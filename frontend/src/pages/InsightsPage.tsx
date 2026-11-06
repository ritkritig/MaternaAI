import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  TrendingDown,
  Activity,
  Layers,
  AlertCircle,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { fetchInsights } from '../services/api';
import { ResearchInsight } from '../types';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<ResearchInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [coverage, setCoverage] = useState<string>('');
  const [isSynthetic, setIsSynthetic] = useState<boolean>(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const res = await fetchInsights();
      setInsights(res.insights || []);
      setCoverage(res.dataset_coverage || '');
      setIsSynthetic((res as any).is_synthetic_demonstration ?? false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons: Record<string, any> = {
    'Regional Disparity': TrendingDown,
    'Service Coverage Disconnect': Activity,
    'Socioeconomic Determinants': Layers,
    'High-Priority Geospatial Clusters': AlertCircle,
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Deterministic Statistical Insights</span>
          </div>
          <h2 className="text-xl font-heading font-bold text-forest-dark">
            Empirical Findings &amp; Research Observations
          </h2>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Automatically derived from {coverage || '751 districts across 36 Indian states'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSynthetic && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              Demonstration Data
            </span>
          )}
          <div className="text-xs text-charcoal-muted flex items-center space-x-2 bg-warmIvory px-3.5 py-2 rounded-xl border border-sage/20">
            <Calendar className="w-4 h-4 text-forest" />
            <span>{isSynthetic ? 'Synthetic Simulation (NFHS-5 Anchored)' : 'Survey Reference: NFHS-5 (2019–2021)'}</span>
          </div>
        </div>
      </div>

      {/* Synthetic data disclaimer */}
      {isSynthetic && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Synthetic Demonstration Notice:</strong> These insights are derived from a synthetic
            simulation dataset. Findings represent demonstration outputs and should not be interpreted
            as actual maternal healthcare conditions across India.
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-sage/20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((ins) => {
            const Icon = categoryIcons[ins.category] || Lightbulb;
            return (
              <div
                key={ins.id}
                className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle flex flex-col justify-between space-y-4 hover:shadow-card transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-forest-50 text-forest">
                      {ins.category}
                    </span>
                    <span className="text-xs font-semibold text-charcoal-muted">{ins.id}</span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-forest-dark">
                    {ins.title}
                  </h3>

                  <p className="text-xs text-charcoal leading-relaxed font-normal">
                    {ins.finding}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-sage/20 text-xs">
                  <div className="p-2.5 rounded-lg bg-warmIvory/80 border border-sage/15 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-forest tracking-wider block">
                      Supporting Quantitative Metric:
                    </span>
                    <span className="font-semibold text-forest-dark">{ins.supporting_metric}</span>
                  </div>

                  <div className="text-[11px] text-charcoal-muted space-y-1 pt-1">
                    <div>
                      <strong className="text-charcoal font-medium">Methodology:</strong> {ins.methodology}
                    </div>
                    <div>
                      <strong className="text-coral-dark font-medium">Research Limitation:</strong> {ins.limitations}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
