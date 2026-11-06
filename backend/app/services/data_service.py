import io
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional, List, Dict, Any
from app.core.config import settings

class DataService:
    def __init__(self):
        self._df: Optional[pd.DataFrame] = None
        self._is_synthetic: bool = True
        self._metadata: Dict[str, Any] = {
            "name": "Synthetic Demonstration Dataset (State-Anchored NFHS-5 Simulation)",
            "source": "Synthetically simulated district values calibrated around 36 State/UT NFHS-5 benchmarks",
            "year": "2019-2021 Reference Period",
            "type": "Synthetic Demonstration (Calibrated Simulation)",
            "is_synthetic": True,
            "provenance_note": (
                "DEMONSTRATION ONLY: 751 district rows generated algorithmically using Gaussian variation "
                "around 36 official state-level NFHS-5 anchors. 599 districts use programmatic placeholder names. "
                "Results must not be interpreted as actual health conditions."
            ),
            "last_updated": "2026-11-06",
            "record_count": 0,
            "feature_count": 0,
            "missing_pct": 0.0,
            "states_count": 0,
            "districts_count": 0,
            "imputed_cells": 0
        }
        self.load_default_dataset()

    def load_default_dataset(self) -> pd.DataFrame:
        if settings.DEMO_DATA_PATH.exists():
            self._df = pd.read_csv(settings.DEMO_DATA_PATH)
        else:
            from app.data.generate_dataset import generate_districts_dataset
            self._df = generate_districts_dataset()
            self._df.to_csv(settings.DEMO_DATA_PATH, index=False)

        self._is_synthetic = True
        self._metadata["name"] = "Synthetic Demonstration Dataset (State-Anchored NFHS-5 Simulation)"
        self._metadata["source"] = "Synthetically simulated district values calibrated around 36 State/UT NFHS-5 benchmarks"
        self._metadata["type"] = "Synthetic Demonstration (Calibrated Simulation)"
        self._metadata["is_synthetic"] = True
        self._metadata["provenance_note"] = (
            "DEMONSTRATION ONLY: 751 district rows generated algorithmically using Gaussian variation "
            "around 36 official state-level NFHS-5 anchors. 599 districts use programmatic placeholder names. "
            "Results must not be interpreted as actual health conditions."
        )
        self._metadata["imputed_cells"] = 0
        self._update_metadata()
        return self._df

    def get_dataframe(self) -> pd.DataFrame:
        if self._df is None:
            self.load_default_dataset()
        return self._df

    def get_metadata(self) -> Dict[str, Any]:
        return self._metadata

    def is_synthetic(self) -> bool:
        return self._is_synthetic

    def _update_metadata(self):
        if self._df is not None:
            self._metadata["record_count"] = int(len(self._df))
            self._metadata["feature_count"] = int(self._df.shape[1])
            total_cells = self._df.size
            null_cells = int(self._df.isnull().sum().sum())
            self._metadata["missing_pct"] = round((null_cells / total_cells * 100), 2) if total_cells > 0 else 0.0
            self._metadata["states_count"] = int(self._df["state_name"].nunique()) if "state_name" in self._df.columns else 0
            self._metadata["districts_count"] = int(self._df["district_name"].nunique()) if "district_name" in self._df.columns else 0

    def load_user_csv(self, file_contents: bytes, filename: str) -> Dict[str, Any]:
        try:
            df = pd.read_csv(io.BytesIO(file_contents))
            
            # Validation: Check minimum required columns
            required_cols = ["state_name"]
            missing_cols = [c for c in required_cols if c not in df.columns]
            if missing_cols:
                return {
                    "success": False,
                    "error": f"Uploaded CSV is missing mandatory column: {', '.join(missing_cols)}"
                }

            # Check that at least one core indicator is present
            core_candidate_indicators = [
                "anc4_or_more_pct", "institutional_delivery_pct",
                "skilled_birth_attendance_pct", "postnatal_care_pct"
            ]
            found_indicators = [c for c in core_candidate_indicators if c in df.columns]
            if not found_indicators:
                return {
                    "success": False,
                    "error": (
                        "Uploaded CSV must include at least one maternal healthcare indicator column, "
                        f"such as: {', '.join(core_candidate_indicators)}"
                    )
                }

            # If district_name is missing, generate sequential IDs
            if "district_name" not in df.columns:
                df["district_name"] = [f"District {i+1}" for i in range(len(df))]
            if "district_id" not in df.columns:
                df["district_id"] = [f"D_{i+1:04d}" for i in range(len(df))]
            if "region" not in df.columns:
                df["region"] = "Unassigned"

            # Check and count missing values before imputation
            num_cols = df.select_dtypes(include=[np.number]).columns
            missing_count = int(df[num_cols].isnull().sum().sum())

            # Median imputation for numeric features (transparently tracked)
            for col in num_cols:
                if df[col].isnull().any():
                    median_val = df[col].median()
                    df[col] = df[col].fillna(median_val if not pd.isna(median_val) else 0.0)

            # Duplicate check
            duplicate_districts = int(df["district_name"].duplicated().sum())

            self._df = df
            self._is_synthetic = False
            self._metadata["name"] = f"User Upload: {filename}"
            self._metadata["source"] = f"Custom CSV Upload ({filename})"
            self._metadata["type"] = "Authentic User-Uploaded Dataset"
            self._metadata["is_synthetic"] = False
            self._metadata["provenance_note"] = (
                f"User-uploaded data with {len(df)} records. "
                f"Transparent preprocessing: {missing_count} missing cells imputed via column median. "
                f"{duplicate_districts} duplicate district names identified."
            )
            self._metadata["imputed_cells"] = missing_count
            self._metadata["duplicate_districts"] = duplicate_districts
            self._update_metadata()

            return {
                "success": True,
                "message": (
                    f"Dataset '{filename}' successfully ingested ({len(df)} records, {df.shape[1]} features). "
                    f"Missing cells imputed: {missing_count}. Duplicates: {duplicate_districts}."
                ),
                "metadata": self._metadata
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to parse uploaded CSV: {str(e)}"
            }

    def filter_data(
        self,
        state: Optional[str] = None,
        region: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        df = self.get_dataframe().copy()

        if region and region.lower() != "all":
            df = df[df["region"].str.lower() == region.lower()]

        if state and state.lower() != "all":
            df = df[df["state_name"].str.lower() == state.lower()]

        if search:
            query = search.lower()
            df = df[
                df["district_name"].str.lower().str.contains(query, na=False) |
                df["state_name"].str.lower().str.contains(query, na=False)
            ]

        total = len(df)
        paginated_records = df.iloc[offset:offset + limit].to_dict(orient="records")

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "is_synthetic": self._is_synthetic,
            "records": paginated_records
        }

    def get_summary_stats(self) -> Dict[str, Any]:
        df = self.get_dataframe()
        numeric_df = df.select_dtypes(include=[np.number])
        desc = numeric_df.describe().round(2).to_dict()
        return {
            "metadata": self._metadata,
            "statistics": desc,
            "columns": list(df.columns),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()}
        }

data_service = DataService()
