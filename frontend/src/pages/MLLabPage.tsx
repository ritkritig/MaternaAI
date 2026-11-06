import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sliders,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Layers
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { runClustering, trainModel } from '../services/api';
import { ClusteringResult, ModelTrainingResult } from '../types';

export const MLLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clustering' | 'prediction'>('clustering');

  // Clustering State
  const [clusterK, setClusterK] = useState<number>(3);
  const [clusteringResult, setClusteringResult] = useState<ClusteringResult | null>(null);
  const [clusteringLoading, setClusteringLoading] = useState<boolean>(false);
  const [clusteringError, setClusteringError] = useState<string | null>(null);

  // Prediction State
  const [targetVar, setTargetVar] = useState<string>('institutional_delivery_pct');
  const [modelType, setModelType] = useState<string>('random_forest');
  const [nEstimators, setNEstimators] = useState<number>(100);
  const [trainingResult, setTrainingResult] = useState<ModelTrainingResult | null>(null);
  const [trainingLoading, setTrainingLoading] = useState<boolean>(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);

  useEffect(() => {
    handleRunClustering();
    handleTrainModel();
  }, []);

  const handleRunClustering = async () => {
    setClusteringLoading(true);
    setClusteringError(null);
    try {
      const res = await runClustering({
        n_clusters: clusterK,
        random_state: 42,
      });
      setClusteringResult(res);
    } catch (err: any) {
      setClusteringError(err.message || 'Clustering execution failed');
    } finally {
      setClusteringLoading(false);
    }
  };

  const handleTrainModel = async () => {
    setTrainingLoading(true);
    setTrainingError(null);
    try {
      const res = await trainModel({
        target_variable: targetVar,
        feature_variables: [
          'anc4_or_more_pct',
          'postnatal_care_pct',
          'ifa_100_days_pct',
          'female_literacy_rate_pct',
          'rural_population_pct',
          'below_poverty_line_pct',
          'phc_chc_density_per_100k',
        ],
        model_type: modelType,
        n_estimators: nEstimators,
      });
      setTrainingResult(res);
    } catch (err: any) {
      setTrainingError(err.message || 'Model training failed');
    } finally {
      setTrainingLoading(false);
    }
  };

  const clusterColors = ['#174C3C', '#E88D7D', '#B8AED8', '#85A992', '#364542', '#F4B5AA'];

  return (
    <div className="space-y-8">
      {/* Tab Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-sage/20 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-forest-dark">
            Machine Learning Research Laboratory
          </h2>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Empirical statistical models &amp; unsupervised regional clustering powered by Scikit-learn.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-warmIvory p-1.5 rounded-xl border border-sage/30">
          <button
            onClick={() => setActiveTab('clustering')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'clustering'
                ? 'bg-forest text-white shadow-sm'
                : 'text-charcoal-muted hover:text-forest'
            }`}
          >
            A. K-Means Clustering
          </button>
          <button
            onClick={() => setActiveTab('prediction')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'prediction'
                ? 'bg-forest text-white shadow-sm'
                : 'text-charcoal-muted hover:text-forest'
            }`}
          >
            B. Supervised Regression (Random Forest)
          </button>
        </div>
      </div>

      {/* TAB 1: K-MEANS CLUSTERING */}
      {activeTab === 'clustering' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-forest uppercase tracking-wider">
                Unsupervised Cluster Configuration
              </span>
              <h3 className="text-base font-heading font-bold text-forest-dark">
                Optimal Cluster Selection (k = 2 to 7)
              </h3>
              <p className="text-xs text-charcoal-muted">
                StandardScaler normalization applied prior to Euclidean clustering.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-medium text-charcoal">Number of Clusters (k):</span>
                <select
                  value={clusterK}
                  onChange={(e) => setClusterK(Number(e.target.value))}
                  className="bg-warmIvory border border-sage/30 rounded-lg px-3 py-1.5 text-xs text-forest-dark font-bold focus:outline-none focus:ring-1 focus:ring-forest"
                >
                  {[2, 3, 4, 5, 6, 7].map((k) => (
                    <option key={k} value={k}>
                      k = {k}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRunClustering}
                disabled={clusteringLoading}
                className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold inline-flex items-center space-x-2 transition-all shadow-sm disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{clusteringLoading ? 'Fitting K-Means...' : 'Execute Clustering'}</span>
              </button>
            </div>
          </div>

          {clusteringError && (
            <div className="p-4 rounded-xl bg-coral/10 border border-coral/30 text-coral-dark text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-coral" />
              <span>{clusteringError}</span>
            </div>
          )}

          {clusteringResult && (
            <>
              {/* Silhouette Comparison & PCA 2D Scatter Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Silhouette Score Metric Card & Evaluation Chart */}
                <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-forest tracking-wider">
                      Cluster Quality Metric
                    </span>
                    <h4 className="text-lg font-heading font-bold text-forest-dark">
                      Silhouette Score
                    </h4>
                    <div className="text-4xl font-heading font-extrabold text-forest">
                      {clusteringResult.silhouette_score}
                    </div>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      Measures cohesion within clusters compared to separation between clusters.
                      Scores above 0.35 indicate robust mathematical partitioning.
                    </p>
                  </div>

                  {/* Silhouette across k bar chart */}
                  <div className="pt-4 border-t border-sage/20 space-y-2">
                    <span className="text-xs font-semibold text-forest-dark block">
                      Silhouette Score by k:
                    </span>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(clusteringResult.silhouette_comparison).map(
                            ([k, score]) => ({
                              k: `k=${k}`,
                              score,
                              isCurrent: Number(k) === clusterK,
                            })
                          )}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E6EFE9" />
                          <XAxis dataKey="k" tick={{ fontSize: 10, fill: '#77827D' }} />
                          <YAxis domain={[0, 0.6]} tick={{ fontSize: 10, fill: '#77827D' }} />
                          <Tooltip
                            formatter={(val: any) => [val, 'Silhouette Score']}
                            contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                          />
                          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                            {Object.entries(clusteringResult.silhouette_comparison).map(
                              ([k], index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={Number(k) === clusterK ? '#174C3C' : '#A9C7B3'}
                                />
                              )
                            )}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* PCA 2D Cluster Projection */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-heading font-bold text-forest-dark">
                        Principal Component Analysis (PCA) 2D Projection
                      </h4>
                      <p className="text-xs text-charcoal-muted">
                        First 2 principal components explaining {clusteringResult.pca_variance_explained?.[0]}% and {clusteringResult.pca_variance_explained?.[1]}% of variance
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-forest-50 text-forest font-medium">
                      {clusteringResult.pca_data.length} Districts Mapped
                    </span>
                  </div>

                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E6EFE9" />
                        <XAxis
                          type="number"
                          dataKey="pc1"
                          name="PC 1 (Service Uptake)"
                          tick={{ fontSize: 10, fill: '#77827D' }}
                        />
                        <YAxis
                          type="number"
                          dataKey="pc2"
                          name="PC 2 (Nutritional/IFA)"
                          tick={{ fontSize: 10, fill: '#77827D' }}
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-white p-3 rounded-xl border border-sage/30 shadow-card text-xs space-y-1">
                                  <div className="font-bold text-forest-dark">{d.district_name}</div>
                                  <div className="text-charcoal-muted">{d.state_name}</div>
                                  <div className="font-semibold text-forest">Group: {d.cluster_name}</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter
                          data={clusteringResult.pca_data}
                          fill="#174C3C"
                        >
                          {clusteringResult.pca_data.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={clusterColors[entry.cluster % clusterColors.length]}
                              opacity={0.8}
                            />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Cluster Profiles Table */}
              <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-heading font-bold text-forest-dark">
                      Cluster Characterization &amp; Mean Indicators
                    </h4>
                    <p className="text-xs text-charcoal-muted">
                      Descriptive summaries avoiding arbitrary labels; defined strictly by empirical coverage statistics.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {clusteringResult.cluster_profiles.map((profile, idx) => (
                    <div
                      key={profile.cluster_id}
                      className="p-5 rounded-xl border space-y-3"
                      style={{
                        borderColor: clusterColors[idx % clusterColors.length],
                        backgroundColor: '#FBFBF8',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="px-2.5 py-1 rounded-full text-white text-[10px] font-bold"
                          style={{ backgroundColor: clusterColors[idx % clusterColors.length] }}
                        >
                          Cluster {profile.cluster_id + 1}
                        </span>
                        <span className="text-xs font-semibold text-charcoal-muted">
                          {profile.count} districts ({profile.percentage}%)
                        </span>
                      </div>

                      <h5 className="font-heading font-bold text-sm text-forest-dark">
                        {profile.name}
                      </h5>
                      <p className="text-xs text-charcoal-muted leading-relaxed">
                        {profile.description}
                      </p>

                      <div className="pt-3 border-t border-sage/20 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-charcoal-muted">Mean 4+ ANC:</span>
                          <span className="font-semibold text-forest-dark">{profile.mean_indicators['anc4_or_more_pct']}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-muted">Mean Inst. Delivery:</span>
                          <span className="font-semibold text-forest-dark">{profile.mean_indicators['institutional_delivery_pct']}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-muted">Mean Postnatal Care:</span>
                          <span className="font-semibold text-forest-dark">{profile.mean_indicators['postnatal_care_pct']}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-muted">Mean IFA 100d:</span>
                          <span className="font-semibold text-forest-dark">{profile.mean_indicators['ifa_100_days_pct']}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: SUPERVISED REGRESSION (RANDOM FOREST) */}
      {activeTab === 'prediction' && (
        <div className="space-y-6">
          {/* Synthetic data disclaimer */}
          {trainingResult?.is_synthetic_demonstration && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Demonstration Results:</strong> The active dataset is a synthetic simulation.
                All metrics (R², MAE, RMSE) shown below are demonstration outputs and may not reflect
                performance on authentic district-level survey data.
              </div>
            </div>
          )}

          {/* Configuration Form */}
          <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-forest uppercase tracking-wider">
                Supervised Model Training
              </span>
              <h3 className="text-base font-heading font-bold text-forest-dark">
                Estimate Regional Coverage via Random Forest &amp; Baseline Linear Regression
              </h3>
              <p className="text-xs text-charcoal-muted">
                Trained on 80% holdout split with 5-fold cross-validation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-medium text-charcoal">Target Indicator:</span>
                <select
                  value={targetVar}
                  onChange={(e) => setTargetVar(e.target.value)}
                  className="bg-warmIvory border border-sage/30 rounded-lg px-3 py-1.5 text-xs text-forest-dark font-medium focus:outline-none"
                >
                  <option value="institutional_delivery_pct">Institutional Delivery (%)</option>
                  <option value="anc4_or_more_pct">Antenatal Care 4+ Visits (%)</option>
                  <option value="postnatal_care_pct">Postnatal Care within 48h (%)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="font-medium text-charcoal">Algorithm:</span>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="bg-warmIvory border border-sage/30 rounded-lg px-3 py-1.5 text-xs text-forest-dark font-medium focus:outline-none"
                >
                  <option value="random_forest">Random Forest (100 Trees)</option>
                  <option value="linear_regression">Linear Regression (Baseline)</option>
                </select>
              </div>

              <button
                onClick={handleTrainModel}
                disabled={trainingLoading}
                className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold inline-flex items-center space-x-2 transition-all shadow-sm disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{trainingLoading ? 'Fitting Model...' : 'Train & Evaluate'}</span>
              </button>
            </div>
          </div>

          {trainingError && (
            <div className="p-4 rounded-xl bg-coral/10 border border-coral/30 text-coral-dark text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-coral" />
              <span>{trainingError}</span>
            </div>
          )}

          {trainingResult && (
            <>
              {/* Metrics Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-sage/20 shadow-subtle space-y-1">
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">
                    Coefficient of Det. (R²)
                  </span>
                  <div className="text-2xl font-heading font-extrabold text-forest-dark">
                    {trainingResult.metrics.r2_score}
                  </div>
                  <span className="text-[10px] text-charcoal-muted">Holdout Test Set</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-sage/20 shadow-subtle space-y-1">
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">
                    5-Fold Cross-Val R²
                  </span>
                  <div className="text-2xl font-heading font-extrabold text-forest">
                    {trainingResult.metrics.cross_val_r2_mean}
                  </div>
                  <span className="text-[10px] text-charcoal-muted">&plusmn;{trainingResult.metrics.cross_val_r2_std} (stability)</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-sage/20 shadow-subtle space-y-1">
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">
                    Mean Absolute Error (MAE)
                  </span>
                  <div className="text-2xl font-heading font-extrabold text-charcoal">
                    {trainingResult.metrics.mae}%
                  </div>
                  <span className="text-[10px] text-charcoal-muted">Average residual error</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-sage/20 shadow-subtle space-y-1">
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">
                    Root Mean Squared (RMSE)
                  </span>
                  <div className="text-2xl font-heading font-extrabold text-charcoal">
                    {trainingResult.metrics.rmse}%
                  </div>
                  <span className="text-[10px] text-charcoal-muted">Penalizes large errors</span>
                </div>
              </div>

              {/* Feature Importance & Actual vs Predicted Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Feature Importance Bar Chart */}
                <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-heading font-bold text-forest-dark">
                        Feature Importance
                      </h4>
                      <p className="text-xs text-charcoal-muted">
                        Relative predictive contribution in predicting {trainingResult.target_variable.replace(/_pct/g, '')}
                      </p>
                    </div>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={trainingResult.feature_importances}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E6EFE9" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#77827D' }} />
                        <YAxis
                          type="category"
                          dataKey="feature"
                          tick={{ fontSize: 10, fill: '#77827D' }}
                          tickFormatter={(f) => f.replace(/_pct/g, '').replace(/_/g, ' ')}
                        />
                        <Tooltip
                          formatter={(val: any) => [val, 'Importance Score']}
                          contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                        />
                        <Bar dataKey="importance" fill="#174C3C" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Actual vs Predicted Scatter Plot */}
                <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-heading font-bold text-forest-dark">
                        Model Fit: Actual vs. Predicted
                      </h4>
                      <p className="text-xs text-charcoal-muted">
                        Evaluated across holdout test sample districts
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-sage/20 text-forest font-semibold">
                      Baseline LR R²: {trainingResult.baseline_linear_r2}
                    </span>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E6EFE9" />
                        <XAxis
                          type="number"
                          dataKey="actual"
                          name="Actual Value (%)"
                          domain={[30, 100]}
                          tick={{ fontSize: 10, fill: '#77827D' }}
                        />
                        <YAxis
                          type="number"
                          dataKey="predicted"
                          name="Predicted Value (%)"
                          domain={[30, 100]}
                          tick={{ fontSize: 10, fill: '#77827D' }}
                        />
                        <Tooltip
                          formatter={(val: any, name: string) => [`${val}%`, name]}
                          contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                        />
                        <Scatter data={trainingResult.predictions_vs_actual} fill="#E88D7D" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Scientific Responsible Use Notice */}
              <div className="p-4 rounded-xl bg-forest-50/70 border border-sage/30 text-xs text-charcoal space-y-1">
                <div className="flex items-center space-x-2 font-semibold text-forest">
                  <Info className="w-4 h-4 text-forest" />
                  <span>Explainability &amp; Association vs Causation Notice</span>
                </div>
                <p className="text-charcoal-muted leading-relaxed">
                  {trainingResult.scientific_note}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
