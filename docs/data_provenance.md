# MaternaAI Data Provenance & Scientific Transparency Specification
**Document Version:** 1.1.0  
**Status:** Official Scientific Audit & Provenance Record  
**Last Updated:** November 2026

---

## 1. Executive Summary & Provenance Classification

The primary demonstration dataset bundled with this repository at:
```
datasets/demo/india_maternal_health_district_data.csv
```
is formally classified as a **Calibrated Synthetic Demonstration Dataset (State-Anchored NFHS-5 Simulation)**.

> **CRITICAL SCIENTIFIC NOTICE:**  
> This dataset does **NOT** contain raw, unadjusted district microdata directly exported from the National Family Health Survey (NFHS-5) or the Health Management Information System (HMIS). The observations are synthetically generated using mathematical Gaussian dispersion centered around 36 verified state-level benchmarks. **Results, metrics, and regional rankings produced using this demo dataset serve demonstration and methodological prototyping purposes only and must never be interpreted as actual health conditions or used for clinical decision-making.**

---

## 2. Origin & Generation Methodology

The dataset was generated programmatically via `backend/app/data/generate_dataset.py` using NumPy random distributions anchored to published state-level summaries from the **National Family Health Survey 2019–2021 (NFHS-5)**.

### Generation Mechanism:
For each of the 36 States and Union Territories, a state baseline anchor $S_k$ is defined. For each district $i \in [1, N_{\text{state}}]$:

1. A latent district development factor is sampled:
   $$\delta_i \sim \mathcal{N}(0, 1)$$

2. Individual indicators are simulated around the state baseline:
   - **4+ ANC Visits (%):**
     $$\text{ANC4}_i = \text{clip}\left(S_{\text{anc4}} + 8.5 \cdot \delta_i + \epsilon_1, \, 10.0, \, 99.5\right) \quad \text{where } \epsilon_1 \sim \mathcal{N}(0, 3.5^2)$$
   - **Institutional Deliveries (%):**
     $$\text{InstDel}_i = \text{clip}\left(S_{\text{inst}} + 4.2 \cdot \delta_i + \epsilon_2, \, 25.0, \, 100.0\right) \quad \text{where } \epsilon_2 \sim \mathcal{N}(0, 2.8^2)$$
   - **Skilled Attendance at Birth (%):**
     $$\text{Skilled}_i = \text{clip}\left(S_{\text{skilled}} + 3.8 \cdot \delta_i + \epsilon_3, \, 30.0, \, 100.0\right) \quad \text{where } \epsilon_3 \sim \mathcal{N}(0, 2.5^2)$$
   - **Postnatal Care within 48 Hours (%):**
     $$\text{PNC}_i = \text{clip}\left(S_{\text{pnc}} + 5.0 \cdot \delta_i + \epsilon_4, \, 20.0, \, 99.0\right) \quad \text{where } \epsilon_4 \sim \mathcal{N}(0, 3.0^2)$$
   - **Iron & Folic Acid 100+ Days (%):**
     $$\text{IFA}_i = \text{clip}\left(S_{\text{ifa}} + 7.5 \cdot \delta_i + \epsilon_5, \, 8.0, \, 90.0\right) \quad \text{where } \epsilon_5 \sim \mathcal{N}(0, 4.0^2)$$
   - **Maternal Mortality Ratio Proxy (per 100k live births):**
     $$\text{MMR}_i = \text{clip}\left(S_{\text{mmr}} - 22.0 \cdot \delta_i + \epsilon_6, \, 10.0, \, 350.0\right) \quad \text{where } \epsilon_6 \sim \mathcal{N}(0, 12.0^2)$$

---

## 3. District Identity & Geographic Representation Audit

An exhaustive forensic audit of the 751 records in `india_maternal_health_district_data.csv` reveals:

| Category | Record Count | Percentage | Examples |
|---|---|---|---|
| **Named Prominent Districts** | 152 | 20.24% | *Thiruvananthapuram, Chennai, Bengaluru Urban, Mumbai City, Lucknow, Patna* |
| **Programmatic Placeholder Names** | 599 | 79.76% | *Tamil Nadu District 16, Uttar Pradesh District 17, Rajasthan District 14* |
| **Total Administrative Rows** | 751 | 100.0% | Covered across all 36 States & UTs |

### Implications:
- The presence of 599 generic placeholder district names confirms that intra-state geographic variation in the demonstration dataset is purely mathematical and cannot be matched to physical district boundaries outside the 152 named seeds.
- Machine learning performance metrics ($R^2 > 0.85$) obtained on this dataset are partially inflated by the shared underlying generator factor $\delta_i$.

---

## 4. Indicator Mapping & Source Attribution

| Indicator Column | Dataset Type | Real-World Benchmark Anchor Source | Anchor Calibration Year |
|---|---|---|---|
| `anc4_or_more_pct` | Synthetic Simulation | NFHS-5 State Factsheets (IIPS / MoHFW) | 2019–2021 |
| `institutional_delivery_pct` | Synthetic Simulation | NFHS-5 State Factsheets (IIPS / MoHFW) | 2019–2021 |
| `skilled_birth_attendance_pct` | Synthetic Simulation | NFHS-5 State Factsheets (IIPS / MoHFW) | 2019–2021 |
| `postnatal_care_pct` | Synthetic Simulation | NFHS-5 State Factsheets (IIPS / MoHFW) | 2019–2021 |
| `ifa_100_days_pct` | Synthetic Simulation | NFHS-5 State Factsheets (IIPS / MoHFW) | 2019–2021 |
| `first_trimester_anc_pct` | Synthetic Simulation | NFHS-5 State Factsheets (IIPS / MoHFW) | 2019–2021 |
| `maternal_mortality_ratio_proxy` | Synthetic Simulation | SRS Special Bulletin on Maternal Mortality | 2018–2020 |
| `phc_chc_density_per_100k` | Synthetic Simulation | Rural Health Statistics / HMIS | 2021–2022 |
| `female_literacy_rate_pct` | Synthetic Simulation | Census & NFHS-5 State Demographics | 2019–2021 |
| `below_poverty_line_pct` | Synthetic Simulation | NITI Aayog Multidimensional Poverty Index | 2021 |

---

## 5. Protocol for Ingesting Authentic Datasets

To conduct authentic demographic research, users can upload genuine district-level survey CSVs via the **Data Explorer** interface (`POST /api/datasets/upload`):

### Required Format for Authentic CSV:
- **`state_name`** *(string, required)*: Administrative state name (e.g. `Kerala`, `Bihar`).
- **`district_name`** *(string, recommended)*: Official Census / NFHS district name.
- At least one core indicator column:
  - `anc4_or_more_pct` (Float, 0 to 100)
  - `institutional_delivery_pct` (Float, 0 to 100)
  - `skilled_birth_attendance_pct` (Float, 0 to 100)
  - `postnatal_care_pct` (Float, 0 to 100)

### Where to Obtain Authentic Datasets:
1. **DHS Program Data Portal:** [https://dhsprogram.com/data/](https://dhsprogram.com/data/) (NFHS-5 District Recode files).
2. **MoHFW HMIS Portal:** [https://hmis.mohfw.gov.in/](https://hmis.mohfw.gov.in/) (Annual District Progress Reports).
3. **Open Government Data (OGD) Platform India:** [https://data.gov.in/](https://data.gov.in/).
