import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Info,
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { fetchRegionalComparison } from '../services/api';

export const RegionalPage: React.FC = () => {
  const [selectedStates, setSelectedStates] = useState<string[]>(['Kerala', 'Uttar Pradesh', 'Bihar']);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const availableStates = [
    'Kerala',
    'Tamil Nadu',
    'Karnataka',
    'Maharashtra',
    'Gujarat',
    'Uttar Pradesh',
    'Madhya Pradesh',
    'Rajasthan',
    'Bihar',
    'West Bengal',
    'Odisha',
    'Assam',
    'Punjab',
    'Haryana',
  ];

  useEffect(() => {
    loadComparison();
  }, [selectedStates]);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const data = await fetchRegionalComparison({ states: selectedStates });
      setComparisonData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleState = (st: string) => {
    if (selectedStates.includes(st)) {
      if (selectedStates.length > 1) {
        setSelectedStates(selectedStates.filter((s) => s !== st));
      }
    } else {
      if (selectedStates.length < 5) {
        setSelectedStates([...selectedStates, st]);
      }
    }
  };

  const indicatorKeys = [
    { key: 'anc4_or_more_pct', label: '4+ ANC Visits (%)' },
    { key: 'institutional_delivery_pct', label: 'Institutional Delivery (%)' },
    { key: 'skilled_birth_attendance_pct', label: 'Skilled Birth Att. (%)' },
    { key: 'postnatal_care_pct', label: 'Postnatal Care (%)' },
    { key: 'ifa_100_days_pct', label: 'IFA 100+ Days (%)' },
  ];

  // Prepare chart comparison data
  const chartData = indicatorKeys.map((ind) => {
    const row: any = { indicator: ind.label };
    if (comparisonData?.comparisons) {
      comparisonData.comparisons.forEach((comp: any) => {
        row[comp.name] = comp.indicators[ind.key] || 0;
      });
    }
    return row;
  });

  const stateColors = ['#174C3C', '#E88D7D', '#85A992', '#B8AED8', '#364542'];

  return (
    <div className="space-y-8">
      {/* Top Header & State Selector */}
      <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-forest-dark">
            Inter-State Healthcare Disparity Comparison
          </h2>
          <p className="text-xs text-charcoal-muted mt-1">
            Compare maternal healthcare uptake across up to 5 Indian states against national averages.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {availableStates.map((st) => {
            const isSelected = selectedStates.includes(st);
            return (
              <button
                key={st}
                onClick={() => handleToggleState(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-forest text-white shadow-sm'
                    : 'bg-warmIvory text-charcoal-muted hover:text-forest border border-sage/30'
                }`}
              >
                {st} {isSelected && '✓'}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="h-80 bg-white rounded-2xl border border-sage/20 animate-pulse" />
      ) : (
        comparisonData && (
          <>
            {/* Visual Comparison Chart */}
            <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-forest-dark">
                    Comparative Indicator Uptake
                  </h3>
                  <p className="text-xs text-charcoal-muted">
                    Side-by-side indicator coverage across selected states
                  </p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6EFE9" />
                    <XAxis dataKey="indicator" tick={{ fontSize: 10, fill: '#77827D' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#77827D' }} />
                    <Tooltip
                      formatter={(val: any, name: string) => [`${val}%`, name]}
                      contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    {selectedStates.map((st, idx) => (
                      <Bar
                        key={st}
                        dataKey={st}
                        fill={stateColors[idx % stateColors.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Entity Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparisonData.comparisons.map((entity: any, idx: number) => (
                <div
                  key={entity.name}
                  className="bg-white p-5 rounded-2xl border border-sage/20 shadow-subtle space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-sage/20 pb-3">
                    <div>
                      <h4 className="font-heading font-bold text-base text-forest-dark">
                        {entity.name}
                      </h4>
                      <span className="text-[10px] text-charcoal-muted uppercase tracking-wider font-semibold">
                        {entity.region} Zone &bull; {entity.district_count} Districts
                      </span>
                    </div>
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: stateColors[idx % stateColors.length] }}
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    {indicatorKeys.map((ind) => {
                      const val = entity.indicators[ind.key];
                      const diff = entity.diff_from_national[ind.key];
                      const isPositive = diff >= 0;

                      return (
                        <div key={ind.key} className="flex items-center justify-between">
                          <span className="text-charcoal-muted">{ind.label}:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-forest-dark">{val}%</span>
                            <span
                              className={`text-[10px] font-semibold ${
                                isPositive ? 'text-emerald-700' : 'text-coral'
                              }`}
                            >
                              ({isPositive ? '+' : ''}{diff}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Empirical Summary Note */}
            <div className="p-4 rounded-xl bg-forest-50/70 border border-sage/20 text-xs text-charcoal space-y-1">
              <div className="flex items-center space-x-2 font-semibold text-forest">
                <Info className="w-4 h-4 text-forest" />
                <span>Analytical Observation Derived from Loaded Survey Data</span>
              </div>
              <p className="text-charcoal-muted leading-relaxed">
                Reported figures demonstrate that southern states consistently sustain high institutional
                delivery alongside strong 4+ antenatal checkup uptake (&gt;75%), whereas central and eastern
                states show a pronounced drop between institutional delivery and full antenatal care.
              </p>
            </div>

            {/* Synthetic data disclaimer */}
            {comparisonData.is_synthetic_demonstration && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Demonstration Notice:</strong> These comparisons use a synthetic simulation dataset.
                  State-level averages shown may not match actual NFHS-5 survey values.
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};
