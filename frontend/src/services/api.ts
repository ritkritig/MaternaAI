import {
  DashboardSummary,
  ClusteringResult,
  ModelTrainingResult,
  AccessibilityIndexResponse,
  ResearchInsight
} from '../types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to load dashboard summary');
  return res.json();
}

export async function fetchDatasetsPreview(params?: {
  state?: string;
  region?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams();
  if (params?.state) query.set('state', params.state);
  if (params?.region) query.set('region', params.region);
  if (params?.search) query.set('search', params.search);
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.offset) query.set('offset', params.offset.toString());

  const res = await fetch(`${API_BASE}/datasets/preview?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch dataset preview');
  return res.json();
}

export async function fetchDatasetSummary() {
  const res = await fetch(`${API_BASE}/datasets/summary`);
  if (!res.ok) throw new Error('Failed to fetch dataset summary');
  return res.json();
}

export async function uploadDatasetCSV(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/datasets/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function resetDataset() {
  const res = await fetch(`${API_BASE}/datasets/reset`, { method: 'POST' });
  return res.json();
}

export async function fetchDescriptiveAnalysis() {
  const res = await fetch(`${API_BASE}/analysis/descriptive`);
  if (!res.ok) throw new Error('Failed to fetch descriptive analysis');
  return res.json();
}

export async function fetchCorrelationAnalysis() {
  const res = await fetch(`${API_BASE}/analysis/correlation`);
  if (!res.ok) throw new Error('Failed to fetch correlation analysis');
  return res.json();
}

export async function fetchRegionalComparison(params?: {
  states?: string[];
  districts?: string[];
}) {
  const query = new URLSearchParams();
  if (params?.states && params.states.length > 0) {
    query.set('states', params.states.join(','));
  }
  if (params?.districts && params.districts.length > 0) {
    query.set('districts', params.districts.join(','));
  }
  const res = await fetch(`${API_BASE}/analysis/regional-comparison?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch regional comparison');
  return res.json();
}

export async function fetchMapGeoJSON() {
  const res = await fetch(`${API_BASE}/map/geojson`);
  if (!res.ok) throw new Error('Failed to fetch GeoJSON');
  return res.json();
}

export async function fetchMapIndicators(indicator: string) {
  const res = await fetch(`${API_BASE}/map/indicators?indicator=${encodeURIComponent(indicator)}`);
  if (!res.ok) throw new Error('Failed to fetch map indicators');
  return res.json();
}

export async function fetchDistrictMapDetail(stateName: string) {
  const res = await fetch(`${API_BASE}/map/district-detail?state_name=${encodeURIComponent(stateName)}`);
  if (!res.ok) throw new Error('Failed to fetch district details');
  return res.json();
}

export async function runClustering(params: {
  features?: string[];
  n_clusters: number;
  random_state?: number;
}): Promise<ClusteringResult> {
  const res = await fetch(`${API_BASE}/ml/clustering`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Clustering failed');
  }
  return res.json();
}

export async function trainModel(params: {
  target_variable: string;
  feature_variables: string[];
  model_type: string;
  test_size?: number;
  n_estimators?: number;
}): Promise<ModelTrainingResult> {
  const res = await fetch(`${API_BASE}/ml/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Model training failed');
  }
  return res.json();
}

export async function calculateAccessibilityIndex(weights?: Record<string, number>): Promise<AccessibilityIndexResponse> {
  const res = await fetch(`${API_BASE}/accessibility/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weights: weights || {} }),
  });
  if (!res.ok) throw new Error('Failed to calculate accessibility index');
  return res.json();
}

export async function fetchInsights(): Promise<{ insights: ResearchInsight[]; total_insights: number; dataset_coverage?: string }> {
  const res = await fetch(`${API_BASE}/insights`);
  if (!res.ok) throw new Error('Failed to fetch insights');
  return res.json();
}
