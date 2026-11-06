import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

def run_kmeans_clustering(
    df: pd.DataFrame,
    features: List[str] = None,
    n_clusters: int = 3,
    random_state: int = 42
) -> Dict[str, Any]:
    if features is None or len(features) == 0:
        features = [
            "anc4_or_more_pct",
            "institutional_delivery_pct",
            "skilled_birth_attendance_pct",
            "postnatal_care_pct",
            "ifa_100_days_pct"
        ]

    # Validate numeric features
    valid_features = [f for f in features if f in df.columns and pd.api.types.is_numeric_dtype(df[f])]
    if len(valid_features) < 2:
        raise ValueError("At least 2 numeric features are required for clustering.")

    # Prepare data & impute median
    X_raw = df[valid_features].copy()
    X_raw = X_raw.fillna(X_raw.median())

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_raw)

    # Compute silhouette scores for k=2..7 for comparison
    silhouette_comparison = {}
    for k in range(2, min(8, len(df))):
        km = KMeans(n_clusters=k, random_state=random_state, n_init=10)
        labels_k = km.fit_predict(X_scaled)
        score = silhouette_score(X_scaled, labels_k)
        silhouette_comparison[k] = round(float(score), 3)

    # Fit target model
    kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
    labels = kmeans.fit_predict(X_scaled)
    current_silhouette = round(float(silhouette_score(X_scaled, labels)), 3)

    # PCA 2D for projection
    pca = PCA(n_components=2, random_state=random_state)
    coords_2d = pca.fit_transform(X_scaled)
    var_explained = [round(float(v) * 100, 1) for v in pca.explained_variance_ratio_]

    df_clustered = df.copy()
    df_clustered["cluster"] = labels

    # Compute cluster profiles and assign research-grounded labels based on mean coverage
    cluster_profiles = []
    cluster_means = df_clustered.groupby("cluster")[valid_features].mean()

    # Determine average composite score for ranking clusters
    composite_scores = cluster_means.mean(axis=1)
    ranked_cluster_ids = composite_scores.sort_values(ascending=False).index.tolist()

    # Label assignment based on rank
    label_map = {}
    if len(ranked_cluster_ids) == 2:
        label_map[ranked_cluster_ids[0]] = ("Relatively Higher Service Coverage", "Districts with well-above average maternal care metrics.")
        label_map[ranked_cluster_ids[1]] = ("Districts with Substantial Accessibility Gaps", "Districts with significantly lower ANC and institutional delivery coverage.")
    elif len(ranked_cluster_ids) == 3:
        label_map[ranked_cluster_ids[0]] = ("Relatively Higher Service Coverage", "Consistent high uptake of antenatal checkups, delivery in facilities, and postnatal visits.")
        label_map[ranked_cluster_ids[1]] = ("Moderate Service Coverage", "Intermediate indicators; facility delivery is established but antenatal visits remain incomplete.")
        label_map[ranked_cluster_ids[2]] = ("Areas with Multiple Accessibility Gaps", "Severe vulnerabilities across antenatal, skilled delivery, and nutritional support.")
    else:
        for idx, cid in enumerate(ranked_cluster_ids):
            label_map[cid] = (f"Cluster Tier {idx+1} (Coverage Score: {composite_scores[cid]:.1f})", "Cluster grouped by multi-indicator profile.")

    total_samples = len(df_clustered)
    for c_id in range(n_clusters):
        count = int((labels == c_id).sum())
        pct = round((count / total_samples) * 100, 1)
        mean_dict = {feat: round(float(cluster_means.loc[c_id, feat]), 1) for feat in valid_features}
        name, desc = label_map.get(c_id, (f"Cluster {c_id}", "Cluster group"))

        cluster_profiles.append({
            "cluster_id": c_id,
            "name": name,
            "description": desc,
            "count": count,
            "percentage": pct,
            "mean_indicators": mean_dict
        })

    # Prepare PCA visual points
    pca_data = []
    for i in range(len(df)):
        pca_data.append({
            "district_name": str(df.iloc[i].get("district_name", f"District {i}")),
            "state_name": str(df.iloc[i].get("state_name", "")),
            "pc1": round(float(coords_2d[i, 0]), 2),
            "pc2": round(float(coords_2d[i, 1]), 2),
            "cluster": int(labels[i]),
            "cluster_name": label_map.get(labels[i], ("Group", ""))[0]
        })

    return {
        "n_clusters": n_clusters,
        "silhouette_score": current_silhouette,
        "features_used": valid_features,
        "pca_variance_explained": var_explained,
        "cluster_profiles": cluster_profiles,
        "pca_data": pca_data,
        "silhouette_comparison": silhouette_comparison
    }
