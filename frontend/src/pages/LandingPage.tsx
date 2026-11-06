import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  BarChart3,
  BrainCircuit,
  Database,
  Sliders,
  ShieldCheck,
  Search,
  Globe2,
  FileText
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-dark via-forest to-forest-light text-white p-8 sm:p-12 lg:p-16 shadow-float border border-forest-light/40">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-sage">
            <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
            <span>Academic Decision-Support &amp; Geospatial Analytics Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-white leading-tight">
            Understanding maternal healthcare. <br />
            <span className="text-sage">One region at a time.</span>
          </h1>

          <p className="text-base sm:text-lg text-warmIvory/80 leading-relaxed font-normal max-w-2xl">
            An open research platform using data science, machine learning and geospatial analytics
            to uncover regional disparities in maternal healthcare accessibility across India.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-sage hover:bg-sage-dark text-forest-dark font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              <span>Explore Research Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/methodology"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all"
            >
              <span>Explore Methodology</span>
            </Link>
          </div>
        </div>

        {/* Decorative Graphic Element */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-15 lg:opacity-25 pointer-events-none">
          <svg width="420" height="420" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="90" stroke="#A9C7B3" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="100" cy="100" r="60" stroke="#E88D7D" strokeWidth="2" />
            <circle cx="100" cy="100" r="30" stroke="#FFFFFF" strokeWidth="2" />
          </svg>
        </div>
      </section>

      {/* Research Question & Problem Statement */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-white p-8 rounded-2xl border border-sage/20 shadow-card flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
              <Search className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-heading font-bold text-forest-dark">
              Core Research Question
            </h2>
            <blockquote className="border-l-4 border-sage pl-4 italic text-charcoal text-base font-medium leading-relaxed">
              &ldquo;Can machine learning and geospatial analytics identify regional disparities in
              maternal healthcare accessibility across India and help identify underserved regions?&rdquo;
            </blockquote>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              While national healthcare indicators reflect general progress, aggregate statistics frequently
              mask stark intra-state and district-level gaps in timely antenatal care, institutional deliveries,
              and healthcare professional coverage.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-sage/20 shadow-card flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center text-coral">
              <Globe2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-heading font-bold text-forest-dark">
              The Healthcare Accessibility Challenge
            </h2>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Ensuring equitable maternal healthcare is central to achieving United Nations SDG-3. In India,
              disparities across geographic terrain, socioeconomic status, and rural health infrastructure
              require transparent data science models rather than opaque or aggregated national estimates.
            </p>
            <div className="p-3.5 bg-warmIvory rounded-xl border border-sage/20 text-xs text-charcoal-muted">
              <strong className="text-forest-dark block mb-1">Scientific Integrity Principle:</strong>
              MaternaAI provides transparent statistical indices and machine learning clustering for policy support.
              It does not predict individual medical risks or offer clinical diagnostic advice.
            </div>
          </div>
        </div>
      </section>

      {/* Research Modules Overview */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-forest-dark">
            Analytical Modules
          </h2>
          <p className="text-sm text-charcoal-muted">
            Reproducible data science and statistical pipelines designed for policymakers and researchers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Research Dashboard',
              desc: 'Dynamic KPI cards, service distribution charts, and inter-state disparity metrics across 750+ districts.',
              to: '/dashboard',
              icon: BarChart3,
              tag: 'Descriptive Analytics',
            },
            {
              title: 'India Healthcare Map',
              desc: 'State and district-level choropleth visualization with geospatial boundary integration and indicator filters.',
              to: '/map',
              icon: MapPin,
              tag: 'Geospatial Analytics',
            },
            {
              title: 'Machine Learning Lab',
              desc: 'Unsupervised K-Means clustering with PCA projections and Random Forest regression for coverage estimation.',
              to: '/ml-lab',
              icon: BrainCircuit,
              tag: 'Statistical ML',
            },
            {
              title: 'Data Explorer',
              desc: 'Dataset preview, missingness profiling, custom CSV ingestion, validation, and cleaned CSV export.',
              to: '/data-explorer',
              icon: Database,
              tag: 'Data Pipeline',
            },
            {
              title: 'Accessibility Index',
              desc: 'Transparent multi-criteria weighted indexing calibrated to identify underserved and critical priority zones.',
              to: '/accessibility-lab',
              icon: Sliders,
              tag: 'Composite Indexing',
            },
            {
              title: 'Empirical Insights',
              desc: 'Deterministic findings on service decoupling, literacy correlations, and geographical disparity coefficients.',
              to: '/insights',
              icon: FileText,
              tag: 'Evidence-Based',
            },
          ].map((module, i) => {
            const Icon = module.icon;
            return (
              <Link
                key={i}
                to={module.to}
                className="group p-6 rounded-2xl bg-white border border-sage/20 shadow-subtle hover:shadow-card transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-forest-50 group-hover:bg-forest text-forest group-hover:text-white transition-colors flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-sage/20 text-forest">
                      {module.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-forest-dark group-hover:text-forest transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-xs text-charcoal-muted mt-2 leading-relaxed">
                      {module.desc}
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center space-x-1.5 text-xs font-semibold text-forest">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Datasets & Transparency Section */}
      <section className="p-8 rounded-2xl bg-white border border-sage/30 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage/20 pb-4">
          <div>
            <h2 className="text-xl font-heading font-bold text-forest-dark">
              Data Provenance &amp; Transparency
            </h2>
            <p className="text-xs text-charcoal-muted mt-1">
              Default dataset is a synthetic demonstration generated from state-level NFHS-5 benchmarks.
              Users may upload authentic district-level CSV data for real analysis.
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 text-xs font-medium text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Synthetic Demo Dataset</span>
          </div>
        </div>

        {/* Synthetic data disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <strong className="block mb-1">⚠ Important Disclosure:</strong>
          The bundled dataset (751 districts) is a <strong>state-anchored NFHS-5 simulation</strong> &mdash;
          indicator values are generated via Gaussian noise around published state-level averages from NFHS-5
          (2019-21). They are <em>not</em> actual district-level survey observations. All analytical results
          produced from this dataset are demonstration outputs only. See{' '}
          <span className="font-semibold">docs/data_provenance.md</span> for full methodology.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2 p-4 rounded-xl bg-warmIvory/60 border border-sage/15">
            <h3 className="font-heading font-semibold text-forest">NFHS-5 State Baselines</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              State-level averages for ANC, Institutional Delivery, and Skilled Attendance used as generation
              anchors. Actual district-level microdata is <em>not</em> included in the default dataset.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-xl bg-warmIvory/60 border border-sage/15">
            <h3 className="font-heading font-semibold text-forest">MoHFW HMIS Reference</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Health infrastructure density figures are estimated from state-level HMIS averages,
              not extracted from the official HMIS portal at district granularity.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-xl bg-warmIvory/60 border border-sage/15">
            <h3 className="font-heading font-semibold text-forest">Socioeconomic Proxies</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Female literacy, poverty, and rurality indicators are state-level estimates with added noise.
              Upload authentic district-level data via the Data Explorer for real analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-sage/20 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-muted gap-4">
        <div>
          <span>&copy; {new Date().getFullYear()} MaternaAI. Turning healthcare data into better maternal healthcare access.</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/methodology" className="hover:text-forest transition-colors">
            Research Methodology
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-forest transition-colors"
          >
            GitHub Repository
          </a>
        </div>
      </footer>
    </div>
  );
};
