import json
import os

NOTEBOOKS = [
    "01_data_exploration.ipynb",
    "02_data_cleaning.ipynb",
    "03_statistical_analysis.ipynb",
    "04_geospatial_analysis.ipynb",
    "05_clustering_experiments.ipynb",
    "06_predictive_modeling.ipynb",
    "07_model_evaluation.ipynb",
]

DISCLAIMER_SOURCE = [
    "> ⚠️ **Synthetic Demonstration Dataset Notice**\n",
    ">\n",
    "> The dataset used in this notebook (`datasets/demo/india_maternal_health_district_data.csv`) is a **synthetic demonstration dataset** generated programmatically via Gaussian noise around NFHS-5 state-level published averages. It does **not** contain actual district-level survey observations.\n",
    ">\n",
    "> All analytical results, metrics, and visualizations produced in this notebook are **demonstration outputs only** and should not be interpreted as reflecting real maternal healthcare conditions across India.\n",
    ">\n",
    "> See `docs/data_provenance.md` for complete provenance documentation."
]

DISCLAIMER_CELL = {
    "cell_type": "markdown",
    "metadata": {},
    "source": DISCLAIMER_SOURCE
}

base_dir = os.path.dirname(os.path.abspath(__file__))

for nb_name in NOTEBOOKS:
    nb_path = os.path.join(base_dir, nb_name)
    if not os.path.exists(nb_path):
        print(f"SKIP (not found): {nb_name}")
        continue

    with open(nb_path, "r", encoding="utf-8") as f:
        nb = json.load(f)

    # Check if disclaimer already inserted (idempotency)
    if len(nb["cells"]) > 1:
        second_cell = nb["cells"][1]
        if second_cell.get("cell_type") == "markdown":
            joined = "".join(second_cell.get("source", []))
            if "Synthetic Demonstration Dataset Notice" in joined:
                print(f"SKIP (already has disclaimer): {nb_name}")
                continue

    nb["cells"].insert(1, json.loads(json.dumps(DISCLAIMER_CELL)))

    with open(nb_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
        f.write("\n")

    print(f"OK: {nb_name}")

print("Done.")
