import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Award,
  AlertTriangle,
  RotateCcw,
  Info,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { calculateAccessibilityIndex } from '../services/api';
import { AccessibilityIndexResponse } from '../types';

export const AccessibilityLabPage: React.FC = () => {
  const defaultWeights: Record<string, number> = {
    anc4_or_more_pct: 0.25,
    institutional_delivery_pct: 0.25,
    skilled_birth_attendance_pct: 0.20,
    postnatal_care_pct: 0.15,
    ifa_100_days_pct: 0.15,
  };

  const [weights, setWeights] = useState<Record<string, number>>(defaultWeights);
  const [result, setResult] = useState<AccessibilityIndexResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    recalculate();
  }, []);

  const recalculate = async (customWeights?: Record<string, number>) => {
    setLoading(true);
    try {
      const data = await calculateAccessibilityIndex(customWeights || weights);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (indicator: string, value: number) => {
    const updated = { ...weights, [indicator]: value };
    setWeights(updated);
  };

  const handleResetWeights = () => {
    setWeights(defaultWeights);
    recalculate(defaultWeights);
  };

  const indicatorLabels: Record<string, string> = {
    anc4_or_more_pct: '4+ Antenatal Visits',
    institutional_delivery_pct: 'Institutional Delivery',
    skilled_birth_attendance_pct: 'Skilled Attendance',
    postnatal_care_pct: 'Postnatal Care within 48h',
    ifa_100_days_pct: 'IFA 100+ Days',
  };

  const tierColors: Record<string, string> = {
    'High Accessibility': '#174C3C',
    'Moderate Accessibility': '#85A992',
    'Vulnerable / Emerging': '#B8AED8',
    'Underserved / Critical Priority': '#E88D7D',
  };

  const pieData = result
    ? Object.entries(result.tier_distribution).map(([tier, count]) => ({
        name: tier,
        value: count,
        color: tierColors[tier] || '#77827D',
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MaternaAI Experimental Accessibility Index</span>
          </div>
          <h2 className="text-xl font-heading font-bold text-forest-dark">
            Configurable Multi-Criteria Accessibility Model
          </h2>
          <p className="text-xs text-charcoal-muted mt-1">
            Dynamic linear-weighted scoring across normalized coverage pillars to identify regional service deficits.
          </p>
        </div>

        <button
          onClick={handleResetWeights}
          className="px-4 py-2 rounded-xl border border-sage/30 text-charcoal-muted hover:text-forest text-xs font-semibold inline-flex items-center space-x-2 transition-all self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default Weights</span>
        </button>
      </div>

      {/* Interactive Weight Sliders */}
      <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-6">
        <div className="flex items-center justify-between border-b border-sage/20 pb-4">
          <div>
            <h3 className="font-heading font-bold text-base text-forest-dark">
              Indicator Weight Allocation
            </h3>
            <p className="text-xs text-charcoal-muted">
              Adjust relative indicator importance; weights are automatically normalized dynamically.
            </p>
          </div>
          <button
            onClick={() => recalculate()}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Recalculating...' : 'Update Index'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {Object.entries(weights).map(([ind, val]) => (
            <div key={ind} className="p-4 rounded-xl bg-warmIvory/60 border border-sage/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-forest-dark">{indicatorLabels[ind]}</span>
                <span className="text-xs font-bold text-forest">
                  {result?.weights_applied?.[ind] ? `${Math.round(result.weights_applied[ind] * 100)}%` : `${Math.round(val * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={val}
                onChange={(e) => handleSliderChange(ind, parseFloat(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {result && (
        <>
          {/* Top Level Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-1">
              <span className="text-xs uppercase tracking-wider text-charcoal-muted font-semibold">
                National Mean Index
              </span>
              <div className="text-3xl font-heading font-extrabold text-forest-dark">
                {result.national_mean_index} <span className="text-sm font-normal text-charcoal-muted">/ 100</span>
              </div>
              <p className="text-[11px] text-charcoal-muted">Evaluated over {result.total_evaluated} districts</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-1">
              <span className="text-xs uppercase tracking-wider text-charcoal-muted font-semibold">
                High Accessibility Districts
              </span>
              <div className="text-3xl font-heading font-extrabold text-forest">
                {result.tier_distribution['High Accessibility'] || 0}
              </div>
              <p className="text-[11px] text-charcoal-muted">Score &ge; 75.0 (Established services)</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-coral/30 shadow-subtle space-y-1">
              <span className="text-xs uppercase tracking-wider text-coral-dark font-semibold">
                Critical Priority Districts
              </span>
              <div className="text-3xl font-heading font-extrabold text-coral-dark">
                {result.tier_distribution['Underserved / Critical Priority'] || 0}
              </div>
              <p className="text-[11px] text-charcoal-muted">Score &lt; 40.0 (Severe gaps)</p>
            </div>
          </div>

          {/* Tier Breakdown Pie Chart & State Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
              <h4 className="font-heading font-bold text-base text-forest-dark">
                Accessibility Tier Breakdown
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: string) => [`${val} districts`, name]}
                      contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs">
                {pieData.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-charcoal">{p.name}</span>
                    </div>
                    <span className="font-semibold text-forest-dark">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* State Rankings Table */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-base text-forest-dark">
                    State Accessibility Composite Rankings
                  </h4>
                  <p className="text-xs text-charcoal-muted">
                    Average district accessibility score across States &amp; UTs
                  </p>
                </div>
              </div>

              <div className="h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-warmIvory text-forest-dark font-heading uppercase text-[10px] tracking-wider border-b border-sage/20">
                    <tr>
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">State Name</th>
                      <th className="py-2.5 px-3">Districts</th>
                      <th className="py-2.5 px-3">Mean Accessibility Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage/10 text-charcoal">
                    {result.state_rankings.map((st, idx) => (
                      <tr key={st.state_name} className="hover:bg-warmIvory/50">
                        <td className="py-2.5 px-3 font-semibold text-charcoal-muted">#{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-forest-dark">{st.state_name}</td>
                        <td className="py-2.5 px-3 text-charcoal-muted">{st.districts}</td>
                        <td className="py-2.5 px-3 font-bold text-forest">{st.mean_index}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Underserved Districts vs Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Performers */}
            <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-3">
              <div className="flex items-center space-x-2 text-forest">
                <TrendingUp className="w-5 h-5 text-forest" />
                <h4 className="font-heading font-bold text-base text-forest-dark">
                  Highest Accessibility Districts
                </h4>
              </div>
              <div className="space-y-2">
                {result.top_performing_districts.slice(0, 5).map((d) => (
                  <div
                    key={d.district_id}
                    className="p-3 rounded-xl bg-forest-50/50 border border-sage/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-forest-dark block">{d.district_name}</span>
                      <span className="text-[11px] text-charcoal-muted">{d.state_name} ({d.region})</span>
                    </div>
                    <span className="text-sm font-heading font-extrabold text-forest">
                      {d.accessibility_index}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Underserved / High Priority */}
            <div className="bg-white p-6 rounded-2xl border border-coral/30 shadow-subtle space-y-3">
              <div className="flex items-center space-x-2 text-coral">
                <TrendingDown className="w-5 h-5 text-coral" />
                <h4 className="font-heading font-bold text-base text-forest-dark">
                  Critical Priority Districts (Action Recommended)
                </h4>
              </div>
              <div className="space-y-2">
                {result.underserved_districts.slice(0, 5).map((d) => (
                  <div
                    key={d.district_id}
                    className="p-3 rounded-xl bg-coral/5 border border-coral/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-forest-dark block">{d.district_name}</span>
                      <span className="text-[11px] text-charcoal-muted">{d.state_name} ({d.region})</span>
                    </div>
                    <span className="text-sm font-heading font-extrabold text-coral-dark">
                      {d.accessibility_index}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sensitivity Analysis Panel */}
          {result.sensitivity_analysis && result.sensitivity_analysis.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-sage/20 shadow-subtle space-y-3">
              <div className="flex items-center space-x-2 text-forest">
                <Sliders className="w-4 h-4 text-forest" />
                <h4 className="font-heading font-bold text-base text-forest-dark">
                  Weight Sensitivity Analysis (±20% Weight Perturbation)
                </h4>
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Evaluates rank robustness by assessing the average position shift of districts when individual indicator weights are increased by 20%:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {result.sensitivity_analysis.map((s) => (
                  <div key={s.indicator} className="p-3 rounded-xl bg-warmIvory/60 border border-sage/20 text-xs space-y-1">
                    <span className="font-semibold text-forest-dark block truncate">
                      {indicatorLabels[s.indicator] || s.indicator}
                    </span>
                    <span className="text-[11px] text-charcoal-muted">Mean shift:</span>
                    <span className="font-bold text-forest block">
                      ±{s.mean_rank_shift_positions} ranks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Methodology Formula Card */}
          <div className="p-5 rounded-2xl bg-white border border-sage/20 shadow-subtle space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-forest font-semibold">
              <Info className="w-4 h-4 text-forest" />
              <span>Calculation Methodology &amp; Mathematical Formulation</span>
            </div>
            <p className="text-charcoal-muted leading-relaxed">
              {result.methodology_note}
            </p>
            <div className="p-3 rounded-xl bg-warmIvory border border-sage/20 font-mono text-[11px] text-forest-dark">
              Index = &sum; [ w_i &times; (Indicator_i - Min_i) / (Max_i - Min_i) &times; 100 ]
            </div>
          </div>
        </>
      )}
    </div>
  );
};
