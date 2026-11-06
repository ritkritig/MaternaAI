import React, { useState, useEffect } from 'react';
import {
  Upload,
  Download,
  RotateCcw,
  Search,
  Filter,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Table,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  fetchDatasetsPreview,
  fetchDatasetSummary,
  uploadDatasetCSV,
  resetDataset
} from '../services/api';
import { DistrictRecord } from '../types';

export const DataExplorerPage: React.FC = () => {
  const [records, setRecords] = useState<DistrictRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [page, setPage] = useState<number>(0);
  const limit = 25;

  useEffect(() => {
    loadData();
    loadSummary();
  }, [page, regionFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchDatasetsPreview({
        search: search || undefined,
        region: regionFilter !== 'All' ? regionFilter : undefined,
        limit,
        offset: page * limit,
      });
      setRecords(res.records || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to fetch dataset' });
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const res = await fetchDatasetSummary();
      setSummary(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      const res = await uploadDatasetCSV(file);
      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        setPage(0);
        loadData();
        loadSummary();
      } else {
        setMessage({ type: 'error', text: res.error || 'Upload validation failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error uploading file' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await resetDataset();
      setMessage({ type: 'success', text: res.message });
      setSearch('');
      setRegionFilter('All');
      setPage(0);
      loadData();
      loadSummary();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to reset dataset' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCleaned = () => {
    window.open('/api/datasets/download', '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & File Operations */}
      <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-forest-dark">
            Dataset Explorer &amp; Pipeline
          </h2>
          <p className="text-xs text-charcoal-muted mt-1">
            Inspect, filter, upload custom CSVs, and export verified cleaned maternal healthcare indicators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold inline-flex items-center space-x-2 transition-all shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Validating...' : 'Upload CSV'}</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <button
            onClick={handleDownloadCleaned}
            className="px-4 py-2 rounded-xl bg-warmIvory hover:bg-sage/20 border border-sage/30 text-forest-dark text-xs font-semibold inline-flex items-center space-x-2 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Cleaned CSV</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl border border-sage/30 text-charcoal-muted hover:text-forest text-xs font-medium inline-flex items-center space-x-1.5 transition-all"
            title="Reset to bundled synthetic demonstration dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Dataset</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-3 text-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-coral/10 border-coral/30 text-coral-dark'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-coral flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Dataset Metadata Information Panel */}
      {summary?.metadata && (
        <>
          {/* Synthetic data notice */}
          {summary.metadata.type?.toLowerCase().includes('synthetic') && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Synthetic Demonstration Dataset:</strong> The active dataset is a state-anchored
                NFHS-5 simulation. Upload an authentic district-level CSV using the button above to
                work with real survey data.
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-sage/20 shadow-subtle">
            <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Total Records</span>
            <span className="text-xl font-heading font-extrabold text-forest-dark">{summary.metadata.record_count}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-sage/20 shadow-subtle">
            <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Features</span>
            <span className="text-xl font-heading font-extrabold text-forest-dark">{summary.metadata.feature_count}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-sage/20 shadow-subtle">
            <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Missing Values</span>
            <span className="text-xl font-heading font-extrabold text-emerald-700">{summary.metadata.missing_pct}%</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-sage/20 shadow-subtle">
            <span className="text-[10px] uppercase font-bold text-charcoal-muted block">States Covered</span>
            <span className="text-xl font-heading font-extrabold text-forest-dark">{summary.metadata.states_count}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-sage/20 shadow-subtle">
            <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Reference Period</span>
            <span className="text-xl font-heading font-extrabold text-forest-dark">{summary.metadata.year}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-sage/20 shadow-subtle">
            <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Dataset Type</span>
            <span className="text-xs font-semibold text-forest mt-1 block truncate">{summary.metadata.type}</span>
          </div>
        </div>
        </>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-sage/20 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search district or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-warmIvory border border-sage/30 text-xs text-forest-dark placeholder-charcoal-muted focus:outline-none focus:ring-1 focus:ring-forest"
          />
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-forest" />
            <span className="text-charcoal font-medium">Zone:</span>
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setPage(0);
              }}
              className="bg-warmIvory border border-sage/30 rounded-lg px-2.5 py-1.5 text-xs text-forest-dark font-medium focus:outline-none"
            >
              <option value="All">All Regions</option>
              <option value="South">South</option>
              <option value="North">North</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Central">Central</option>
              <option value="Northeast">Northeast</option>
            </select>
          </div>

          <div className="text-xs text-charcoal-muted font-medium">
            Showing {records.length} of {total} districts
          </div>
        </div>
      </div>

      {/* Records Data Table */}
      <div className="bg-white rounded-2xl border border-sage/20 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-forest-50/70 text-forest-dark font-heading uppercase text-[10px] tracking-wider border-b border-sage/20">
              <tr>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">4+ ANC (%)</th>
                <th className="py-3 px-4">Inst. Delivery (%)</th>
                <th className="py-3 px-4">Skilled Att. (%)</th>
                <th className="py-3 px-4">PNC 48h (%)</th>
                <th className="py-3 px-4">IFA 100d (%)</th>
                <th className="py-3 px-4">Female Lit. (%)</th>
                <th className="py-3 px-4">PHC Density</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/10 text-charcoal">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-charcoal-muted">
                    Loading district records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-charcoal-muted">
                    No matching records found for the applied search criteria.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.district_id} className="hover:bg-warmIvory/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-forest-dark">{r.district_name}</td>
                    <td className="py-3 px-4">{r.state_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-sage/20 text-forest text-[10px] font-medium">
                        {r.region}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{r.anc4_or_more_pct}%</td>
                    <td className="py-3 px-4 font-medium">{r.institutional_delivery_pct}%</td>
                    <td className="py-3 px-4">{r.skilled_birth_attendance_pct}%</td>
                    <td className="py-3 px-4">{r.postnatal_care_pct}%</td>
                    <td className="py-3 px-4">{r.ifa_100_days_pct}%</td>
                    <td className="py-3 px-4">{r.female_literacy_rate_pct}%</td>
                    <td className="py-3 px-4">{r.phc_chc_density_per_100k}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-sage/20 flex items-center justify-between text-xs text-charcoal-muted">
          <div>
            Page {page + 1} of {Math.max(1, Math.ceil(total / limit))}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg border border-sage/30 hover:bg-warmIvory disabled:opacity-40 transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * limit >= total}
              className="px-3 py-1.5 rounded-lg border border-sage/30 hover:bg-warmIvory disabled:opacity-40 transition-colors flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Data Dictionary */}
      <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-forest" />
          <h3 className="font-heading font-bold text-base text-forest-dark">
            Data Dictionary &amp; Indicator Definitions
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-warmIvory/60 border border-sage/15 space-y-1">
            <span className="font-semibold text-forest block">anc4_or_more_pct</span>
            <p className="text-charcoal-muted leading-relaxed">
              Mothers who had at least 4 antenatal care visits during pregnancy for their last birth (%).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-warmIvory/60 border border-sage/15 space-y-1">
            <span className="font-semibold text-forest block">institutional_delivery_pct</span>
            <p className="text-charcoal-muted leading-relaxed">
              Births delivered in a public or private healthcare facility (%).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-warmIvory/60 border border-sage/15 space-y-1">
            <span className="font-semibold text-forest block">skilled_birth_attendance_pct</span>
            <p className="text-charcoal-muted leading-relaxed">
              Births assisted by a doctor, nurse, LHV, ANM, or other skilled health personnel (%).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-warmIvory/60 border border-sage/15 space-y-1">
            <span className="font-semibold text-forest block">postnatal_care_pct</span>
            <p className="text-charcoal-muted leading-relaxed">
              Mothers who received postnatal care from doctor/health personnel within 2 days of delivery (%).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-warmIvory/60 border border-sage/15 space-y-1">
            <span className="font-semibold text-forest block">ifa_100_days_pct</span>
            <p className="text-charcoal-muted leading-relaxed">
              Mothers who consumed Iron and Folic Acid (IFA) supplements for 100 days or more (%).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-warmIvory/60 border border-sage/15 space-y-1">
            <span className="font-semibold text-forest block">phc_chc_density_per_100k</span>
            <p className="text-charcoal-muted leading-relaxed">
              Primary and Community Health Centers available per 100,000 population (HMIS benchmark).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
