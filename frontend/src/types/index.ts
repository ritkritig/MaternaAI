export interface DatasetMetadata {
  name: string;
  source: string;
  year: string;
  type: string;
  last_updated: string;
  record_count: number;
  feature_count: number;
  missing_pct: number;
  states_count: number;
  districts_count: number;
}

export interface KPI {
  total_districts: number;
  total_states: number;
  total_indicators: number;
  underserved_regions: number;
  national_mean_accessibility_index: number;
  is_synthetic?: boolean;
}

export interface IndicatorDistribution {
  indicator: string;
  mean: number;
  median: number;
  min: number;
  max: number;
}

export interface RegionalDisparity {
  indicator: string;
  min_val: number;
  max_val: number;
  gap: number;
  std_dev: number;
  highest_state: string;
  lowest_state: string;
}

export interface DashboardSummary {
  kpis: KPI;
  metadata: DatasetMetadata;
  indicator_distributions: IndicatorDistribution[];
  region_aggregates: Record<string, any>[];
  state_aggregates: Record<string, any>[];
  disparities: RegionalDisparity[];
  correlation: {
    indicators: string[];
    matrix: number[][];
    top_positive_correlations: any[];
    top_negative_correlations: any[];
  };
}

export interface DistrictRecord {
  district_id: string;
  district_name: string;
  state_name: string;
  state_code: string;
  region: string;
  anc4_or_more_pct: number;
  institutional_delivery_pct: number;
  skilled_birth_attendance_pct: number;
  postnatal_care_pct: number;
  ifa_100_days_pct: number;
  first_trimester_anc_pct: number;
  maternal_mortality_ratio_proxy: number;
  female_literacy_rate_pct: number;
  rural_population_pct: number;
  below_poverty_line_pct: number;
  phc_chc_density_per_100k: number;
  public_facility_delivery_share_pct: number;
  data_source: string;
  survey_year: string;
  completeness_score: number;
}

export interface ClusterProfile {
  cluster_id: number;
  name: string;
  description: string;
  count: number;
  percentage: number;
  mean_indicators: Record<string, number>;
}

export interface ClusteringResult {
  n_clusters: number;
  silhouette_score: number;
  features_used: string[];
  pca_variance_explained: number[];
  cluster_profiles: ClusterProfile[];
  pca_data: {
    district_name: string;
    state_name: string;
    pc1: number;
    pc2: number;
    cluster: number;
    cluster_name: string;
  }[];
  silhouette_comparison: Record<number, number>;
}

export interface ModelTrainingResult {
  model_name: string;
  target_variable: string;
  features_used: string[];
  train_samples: number;
  test_samples: number;
  metrics: {
    mae: number;
    rmse: number;
    r2_score: number;
    cross_val_r2_mean: number;
    cross_val_r2_std: number;
  };
  feature_importances: {
    feature: string;
    importance: number;
  }[];
  predictions_vs_actual: {
    actual: number;
    predicted: number;
    residual: number;
  }[];
  baseline_linear_r2: number;
  scientific_note: string;
  is_synthetic_demonstration?: boolean;
}

export interface AccessibilityIndexResponse {
  total_evaluated: number;
  national_mean_index: number;
  is_synthetic_demonstration?: boolean;
  weights_applied: Record<string, number>;
  tier_distribution: Record<string, number>;
  top_performing_districts: {
    district_id: string;
    district_name: string;
    state_name: string;
    region: string;
    accessibility_index: number;
    tier: string;
    indicators: Record<string, number>;
    radar_components: Record<string, number>;
  }[];
  underserved_districts: {
    district_id: string;
    district_name: string;
    state_name: string;
    region: string;
    accessibility_index: number;
    tier: string;
    indicators: Record<string, number>;
    radar_components: Record<string, number>;
  }[];
  state_rankings: {
    state_name: string;
    mean_index: number;
    districts: number;
  }[];
  sensitivity_analysis?: {
    indicator: string;
    mean_rank_shift_positions: number;
  }[];
  methodology_note: string;
}

export interface ResearchInsight {
  id: string;
  category: string;
  title: string;
  finding: string;
  supporting_metric: string;
  relevant_regions: string[];
  methodology: string;
  limitations: string;
  confidence_level: string;
}
