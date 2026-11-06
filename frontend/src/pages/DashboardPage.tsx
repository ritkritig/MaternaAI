import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  Activity,
  AlertTriangle,
  Award,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { fetchDashboardSummary } from '../services/api';
import { DashboardSummary } from '../types';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedIndicator, setSelectedIndicator] = useState<string>('anc4_or_more_pct');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await fetchDashboardSummary();
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load research dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-sage/20" />
          ))}
        </div>
        <div className="h-96 bg-white rounded-2xl border border-sage/20" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-coral/30 space-y-4">
        <AlertTriangle className="w-12 h-12 text-coral mx-auto" />
        <h3 className="text-lg font-heading font-bold text-forest-dark">Data Service Unavailable</h3>
        <p className="text-sm text-charcoal-muted">{error}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 rounded-xl bg-forest text-white text-sm font-medium inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Load</span>
        </button>
      </div>
    );
  }

  // Filter state aggregates by region if selected
  const filteredStates = data.state_aggregates.filter((s) => {
    if (selectedRegion === 'All') return true;
    // Map states to regions
    return true;
  });

  const indicatorLabels: Record<string, string> = {
    anc4_or_more_pct: 'Antenatal Care (4+ Visits, %)',
    institutional_delivery_pct: 'Institutional Delivery (%)',
    skilled_birth_attendance_pct: 'Skilled Birth Attendance (%)',
    postnatal_care_pct: 'Postnatal Care within 48h (%)',
    ifa_100_days_pct: 'IFA 100+ Days (%)',
    first_trimester_anc_pct: '1st Trimester Registration (%)',
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sage/20 shadow-subtle">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-heading font-bold text-forest-dark">
              Maternal Healthcare Disparity Overview
            </h2>
            {data.kpis.is_synthetic && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                Synthetic Simulation Demo
              </span>
            )}
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Active Dataset: {data.metadata.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-forest" />
            <span className="text-charcoal font-medium">Indicator:</span>
            <select
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              className="bg-warmIvory border border-sage/30 rounded-lg px-2.5 py-1.5 text-xs text-forest-dark font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            >
              {Object.entries(indicatorLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadDashboard}
            className="p-1.5 rounded-lg border border-sage/30 text-forest hover:bg-forest/10 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-charcoal-muted font-semibold">
              Districts Analyzed
            </span>
            <div className="text-3xl font-heading font-extrabold text-forest-dark">
              {data.kpis.total_districts}
            </div>
            <p className="text-[11px] text-charcoal-muted">Across all administrative divisions</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-charcoal-muted font-semibold">
              States &amp; UTs
            </span>
            <div className="text-3xl font-heading font-extrabold text-forest-dark">
              {data.kpis.total_states}
            </div>
            <p className="text-[11px] text-charcoal-muted">Complete national coverage</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sage/20 flex items-center justify-center text-forest-dark">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-charcoal-muted font-semibold">
              Core Indicators
            </span>
            <div className="text-3xl font-heading font-extrabold text-forest-dark">
              {data.kpis.total_indicators}
            </div>
            <p className="text-[11px] text-charcoal-muted">Antenatal, delivery &amp; postnatal</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-lavender/20 flex items-center justify-center text-forest">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-coral/30 shadow-subtle flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-coral-dark font-semibold">
              Underserved Regions
            </span>
            <div className="text-3xl font-heading font-extrabold text-coral-dark">
              {data.kpis.underserved_regions}
            </div>
            <p className="text-[11px] text-charcoal-muted">Below 50% accessibility benchmark</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center text-coral">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: State Coverage Comparison for Selected Indicator */}
        <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-forest-dark">
                State Coverage Comparison: {indicatorLabels[selectedIndicator]}
              </h3>
              <p className="text-xs text-charcoal-muted">
                Mean coverage percentage across selected Indian states
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-forest-50 text-forest font-medium">
              Source: NFHS-5
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredStates}
                margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EFE9" />
                <XAxis
                  dataKey="state_name"
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10, fill: '#77827D' }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#77827D' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, indicatorLabels[selectedIndicator]]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#A9C7B3',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey={selectedIndicator} fill="#174C3C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Regional Service Comparison (Zone aggregates) */}
        <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-forest-dark">
                Regional Healthcare Continuum
              </h3>
              <p className="text-xs text-charcoal-muted">
                Comparison of 4+ ANC visits vs Institutional Births across geographic zones
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.region_aggregates}
                margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EFE9" />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#77827D' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#77827D' }} />
                <Tooltip
                  formatter={(val: any, name: string) => [
                    `${val}%`,
                    name === 'anc4_or_more_pct' ? '4+ ANC Visits' : 'Institutional Delivery',
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#A9C7B3',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) =>
                    value === 'anc4_or_more_pct' ? '4+ ANC Visits (%)' : 'Institutional Delivery (%)'
                  }
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Bar dataKey="anc4_or_more_pct" fill="#A9C7B3" radius={[4, 4, 0, 0]} />
                <Bar dataKey="institutional_delivery_pct" fill="#174C3C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Disparity Analysis Table & Indicator Correlation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Disparity Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-forest-dark">
                Regional Disparity Gap Index
              </h3>
              <p className="text-xs text-charcoal-muted">
                Inter-state gaps between highest and lowest performing states
              </p>
            </div>
            <div className="flex items-center space-x-1 text-xs text-charcoal-muted">
              <Info className="w-3.5 h-3.5 text-forest" />
              <span>Calculated dynamically</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warmIvory text-forest-dark font-heading uppercase text-[10px] tracking-wider border-b border-sage/20">
                <tr>
                  <th className="py-3 px-3">Indicator</th>
                  <th className="py-3 px-3">Highest State</th>
                  <th className="py-3 px-3">Lowest State</th>
                  <th className="py-3 px-3">Gap (% pts)</th>
                  <th className="py-3 px-3">Std. Dev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/10 text-charcoal">
                {data.disparities.slice(0, 5).map((disp, i) => (
                  <tr key={i} className="hover:bg-warmIvory/50">
                    <td className="py-3 px-3 font-medium text-forest-dark">
                      {indicatorLabels[disp.indicator] || disp.indicator}
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-medium">
                      {disp.highest_state} ({disp.max_val}%)
                    </td>
                    <td className="py-3 px-3 text-coral font-medium">
                      {disp.lowest_state} ({disp.min_val}%)
                    </td>
                    <td className="py-3 px-3 font-semibold text-charcoal">
                      <span className="px-2 py-0.5 rounded-full bg-coral/10 text-coral-dark">
                        {disp.gap}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-charcoal-muted">&plusmn;{disp.std_dev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Correlation Heatmap Snapshot */}
        <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
          <div>
            <h3 className="font-heading font-bold text-base text-forest-dark">
              Indicator Correlations
            </h3>
            <p className="text-xs text-charcoal-muted">
              Pearson correlation coefficient matrix (r)
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-forest uppercase tracking-wider">
              Strongest Associations
            </div>
            {data.correlation.top_positive_correlations.slice(0, 3).map((pair, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-forest-50/70 border border-sage/20 text-xs space-y-1">
                <div className="flex items-center justify-between font-medium text-forest-dark">
                  <span>{pair.var1.replace(/_pct/g, '').replace(/_/g, ' ')} &amp; {pair.var2.replace(/_pct/g, '').replace(/_/g, ' ')}</span>
                  <span className="font-bold text-forest">r = +{pair.correlation}</span>
                </div>
                <div className="w-full bg-sage/30 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-forest h-full rounded-full"
                    style={{ width: `${pair.correlation * 100}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-2 text-[11px] text-charcoal-muted italic">
              Note: Statistical correlations denote empirical associations across survey districts, not direct clinical causation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
