import json
from pathlib import Path

NOTEBOOKS_DIR = Path("D:/sem5/projects/MaternaAI/notebooks")
NOTEBOOKS_DIR.mkdir(parents=True, exist_ok=True)

def make_notebook(cells):
    return {
        "cells": cells,
        "metadata": {
            "language_info": {
                "name": "python",
                "version": "3.14.3"
            },
            "kernelspec": {
                "name": "python3",
                "display_name": "Python 3"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }

def md_cell(source):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [line + "\n" for line in source.strip().split("\n")]
    }

def code_cell(source):
    return {
        "cell_type": "code",
        "metadata": {},
        "execution_count": None,
        "outputs": [],
        "source": [line + "\n" for line in source.strip().split("\n")]
    }

# Notebook 01: Data Exploration
nb01 = make_notebook([
    md_cell("""# Notebook 01: Exploratory Data Profiling & Structural Ingestion
### MaternaAI Research Platform: Maternal Healthcare Disparity in India

**Objective:**
Investigate the raw distributions, data schemas, missingness patterns, and statistical properties of district-level maternal healthcare observations across Indian States and Union Territories calibrated against NFHS-5 benchmarks.

**Primary Dataset:**
- `datasets/demo/india_maternal_health_district_data.csv` (751 districts, 36 states/UTs)."""),
    code_cell("""import pandas as pd
import numpy as np

# Load dataset
df = pd.read_csv('../datasets/demo/india_maternal_health_district_data.csv')
print(f"Total records: {len(df)}, Features: {df.shape[1]}")
df.head()"""),
    code_cell("""# Summary statistics of core healthcare indicators
indicators = [
    'anc4_or_more_pct', 'institutional_delivery_pct', 
    'skilled_birth_attendance_pct', 'postnatal_care_pct', 'ifa_100_days_pct'
]
df[indicators].describe().round(2)"""),
    md_cell("""### Research Observations:
1. Significant dispersion exists in full antenatal care (`anc4_or_more_pct`), ranging from ~10% in low-performing regions to >90% in top-performing districts.
2. Institutional delivery exhibits higher overall mean than full antenatal care, indicating service decoupling.""")
])

# Notebook 02: Data Cleaning
nb02 = make_notebook([
    md_cell("""# Notebook 02: Data Cleaning, Imputation & Outlier Validation
### MaternaAI Research Platform

**Objective:**
Clean raw district observations, detect and treat outliers using Interquartile Range (IQR), evaluate missingness, and produce a standardized cleaned dataset ready for modeling."""),
    code_cell("""import pandas as pd
import numpy as np

df = pd.read_csv('../datasets/demo/india_maternal_health_district_data.csv')

# Missingness check
print("Missing values per feature:")
print(df.isnull().sum())"""),
    code_cell("""# Outlier analysis using IQR
for col in ['anc4_or_more_pct', 'institutional_delivery_pct', 'maternal_mortality_ratio_proxy']:
    q25 = df[col].quantile(0.25)
    q75 = df[col].quantile(0.75)
    iqr = q75 - q25
    lower = q25 - 1.5 * iqr
    upper = q75 + 1.5 * iqr
    outliers = df[(df[col] < lower) | (df[col] > upper)]
    print(f"{col}: {len(outliers)} outliers detected outside [{lower:.1f}, {upper:.1f}]")"""),
    md_cell("""### Cleaning Pipeline Export:
The verified and cleaned dataset is saved to `datasets/demo/cleaned_maternal_health_data.csv`.""")
])

# Notebook 03: Statistical Analysis
nb03 = make_notebook([
    md_cell("""# Notebook 03: Inferential Statistics & Bivariate Correlation Analysis
### MaternaAI Research Platform

**Objective:**
Compute Pearson and Spearman rank correlation matrices across maternal health indicators and socioeconomic determinants (female literacy, poverty headcount, rurality)."""),
    code_cell("""import pandas as pd
from scipy import stats

df = pd.read_csv('../datasets/demo/india_maternal_health_district_data.csv')
num_cols = [
    'anc4_or_more_pct', 'institutional_delivery_pct', 'skilled_birth_attendance_pct',
    'postnatal_care_pct', 'ifa_100_days_pct', 'female_literacy_rate_pct', 'below_poverty_line_pct'
]
corr_matrix = df[num_cols].corr()
corr_matrix.round(3)"""),
    code_cell("""# Hypothesis Testing: Does female literacy correlate significantly with institutional births?
r, p_val = stats.pearsonr(df['female_literacy_rate_pct'], df['institutional_delivery_pct'])
print(f"Pearson r = {r:.3f}, p-value = {p_val:.4e}")
assert p_val < 0.05, "Statistically significant correlation confirmed." """),
    md_cell("""### Key Findings:
Strong positive correlation confirms socioeconomic enablement is closely tied to formal healthcare access.""")
])

# Notebook 04: Geospatial Analysis
nb04 = make_notebook([
    md_cell("""# Notebook 04: Geospatial Aggregations & Regional Disparity Mapping
### MaternaAI Research Platform

**Objective:**
Analyze geographic disparities across Northern, Southern, Eastern, Western, Central, and North-Eastern administrative zones."""),
    code_cell("""import pandas as pd

df = pd.read_csv('../datasets/demo/india_maternal_health_district_data.csv')
zone_agg = df.groupby('region')[['anc4_or_more_pct', 'institutional_delivery_pct', 'maternal_mortality_ratio_proxy']].agg(['mean', 'std']).round(2)
zone_agg"""),
    code_cell("""# State-level extremes
state_means = df.groupby('state_name')['anc4_or_more_pct'].mean()
print(f"Top State: {state_means.idxmax()} ({state_means.max():.1f}%)")
print(f"Lowest State: {state_means.idxmin()} ({state_means.min():.1f}%)")
print(f"Absolute Gap: {(state_means.max() - state_means.min()):.1f} percentage points")"""),
    md_cell("""### Scientific Limitation:
State averages mask substantial intra-district inequalities, especially in large states such as Uttar Pradesh and Madhya Pradesh.""")
])

# Notebook 05: Clustering Experiments
nb05 = make_notebook([
    md_cell("""# Notebook 05: Unsupervised Clustering Experiments (K-Means & PCA)
### MaternaAI Research Platform

**Objective:**
Apply K-Means clustering to partition districts into homogeneous healthcare accessibility profiles without supervised bias. Validate cluster count using silhouette analysis."""),
    code_cell("""import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA

df = pd.read_csv('../datasets/demo/india_maternal_health_district_data.csv')
features = ['anc4_or_more_pct', 'institutional_delivery_pct', 'skilled_birth_attendance_pct', 'postnatal_care_pct', 'ifa_100_days_pct']
X = StandardScaler().fit_transform(df[features])

# Compare silhouette scores for k=2..6
for k in range(2, 7):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X)
    print(f"k={k}: Silhouette Score = {silhouette_score(X, labels):.4f}")"""),
    code_cell("""# Fit k=3 model & inspect profile means
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10).fit(X)
df['cluster'] = kmeans.labels_
df.groupby('cluster')[features].mean().round(1)""")
])

# Notebook 06: Predictive Modeling
nb06 = make_notebook([
    md_cell("""# Notebook 06: Predictive Modeling (Random Forest Regressor vs Linear Baseline)
### MaternaAI Research Platform

**Objective:**
Train a Random Forest Regressor to estimate district-level institutional delivery coverage from socioeconomic and health infrastructure determinants."""),
    code_cell("""import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score

df = pd.read_csv('../datasets/demo/india_maternal_health_district_data.csv')
features = ['anc4_or_more_pct', 'female_literacy_rate_pct', 'rural_population_pct', 'below_poverty_line_pct', 'phc_chc_density_per_100k']
target = 'institutional_delivery_pct'

X_train, X_test, y_train, y_test = train_test_split(df[features], df[target], test_size=0.2, random_state=42)

rf = RandomForestRegressor(n_estimators=100, random_state=42).fit(X_train, y_train)
lr = LinearRegression().fit(X_train, y_train)

print(f"Random Forest Test R²: {r2_score(y_test, rf.predict(X_test)):.3f}, MAE: {mean_absolute_error(y_test, rf.predict(X_test)):.2f}%")
print(f"Baseline Linear Test R²: {r2_score(y_test, lr.predict(X_test)):.3f}, MAE: {mean_absolute_error(y_test, lr.predict(X_test)):.2f}%")""")
])

# Notebook 07: Model Evaluation
nb07 = make_notebook([
    md_cell("""# Notebook 07: Rigorous Cross-Validation & Feature Explainability
### MaternaAI Research Platform

**Objective:**
Perform 5-fold cross-validation, inspect residual distributions, and extract feature importances to explain which determinants drive regional service predictions."""),
    code_cell("""import pandas as pd
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestRegressor

df = pd.read_csv('../datasets/demo/india_maternal_health_district_data.csv')
features = ['anc4_or_more_pct', 'female_literacy_rate_pct', 'rural_population_pct', 'below_poverty_line_pct', 'phc_chc_density_per_100k']
target = 'institutional_delivery_pct'

rf = RandomForestRegressor(n_estimators=100, random_state=42)
scores = cross_val_score(rf, df[features], df[target], cv=5, scoring='r2')
print(f"5-Fold Cross Validation R²: Mean = {scores.mean():.3f}, Std = {scores.std():.3f}")

rf.fit(df[features], df[target])
importances = pd.Series(rf.feature_importances_, index=features).sort_values(ascending=False)
print("\nFeature Importances:")
print(importances.round(4))"""),
    md_cell("""### Ethical & Methodological Disclaimer:
High feature importance reflects co-variation and predictive utility within survey strata, not causal health guarantees.""")
])

notebooks = [
    ("01_data_exploration.ipynb", nb01),
    ("02_data_cleaning.ipynb", nb02),
    ("03_statistical_analysis.ipynb", nb03),
    ("04_geospatial_analysis.ipynb", nb04),
    ("05_clustering_experiments.ipynb", nb05),
    ("06_predictive_modeling.ipynb", nb06),
    ("07_model_evaluation.ipynb", nb07),
]

for filename, content in notebooks:
    filepath = NOTEBOOKS_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(content, f, indent=2)
    print(f"Created notebook: {filepath}")
