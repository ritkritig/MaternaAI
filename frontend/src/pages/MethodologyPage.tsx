import React from 'react';
import {
  BookOpen,
  ShieldAlert,
  Database,
  BrainCircuit,
  Calculator,
  Compass,
  FileCheck2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="space-y-10 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest-50 text-forest text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Research Documentation &amp; Standards</span>
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-forest-dark sm:text-4xl">
          Scientific Methodology &amp; Ethics
        </h1>
        <p className="text-sm text-charcoal-muted leading-relaxed">
          Comprehensive documentation of mathematical formulations, statistical pipelines,
          data provenance, and ethical guardrails underpinning the MaternaAI platform.
        </p>
      </div>

      {/* 1. Research Problem & Core Question */}
      <section className="bg-white p-8 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
        <h2 className="text-xl font-heading font-bold text-forest-dark flex items-center space-x-2">
          <Compass className="w-5 h-5 text-forest" />
          <span>1. Research Problem &amp; Core Inquiry</span>
        </h2>
        <p className="text-xs text-charcoal-muted leading-relaxed">
          Maternal mortality and pregnancy-related morbidity remain critical public health challenges across the Global South.
          While India has achieved laudable improvements in national institutional delivery rates (reaching ~89% in NFHS-5),
          broad national indicators obscure acute regional disparities. The central research inquiry is:
        </p>
        <blockquote className="p-4 rounded-xl bg-warmIvory border-l-4 border-forest text-forest-dark font-medium italic text-xs leading-relaxed">
          &ldquo;Can machine learning and geospatial analytics identify regional disparities in maternal
          healthcare accessibility across India and help identify underserved regions?&rdquo;
        </blockquote>
      </section>

      {/* 2. Data Sources & Calibration */}
      <section className="bg-white p-8 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
        <h2 className="text-xl font-heading font-bold text-forest-dark flex items-center space-x-2">
          <Database className="w-5 h-5 text-forest" />
          <span>2. Data Pipeline &amp; Public Sources</span>
        </h2>
        <div className="space-y-3 text-xs text-charcoal-muted leading-relaxed">
          <p>
            MaternaAI prioritizes legitimate, reproducible government datasets:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-charcoal">
            <li>
              <strong>NFHS-5 (National Family Health Survey 2019-2021):</strong> MoHFW / IIPS micro-factsheets
              providing district-level benchmarks on 4+ ANC visits, institutional births, skilled attendance,
              and postnatal visits.
            </li>
            <li>
              <strong>MoHFW HMIS (Health Management Information System):</strong> Infrastructure metrics on
              Primary and Community Health Centre densities per 100k population.
            </li>
            <li>
              <strong>Census &amp; NITI Aayog Multidimensional Poverty Index:</strong> District-level female literacy
              rates and poverty headcount ratios as socioeconomic proxies.
            </li>
          </ul>
        </div>
      </section>

      {/* 3. Mathematical Formulation of Accessibility Index */}
      <section className="bg-white p-8 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
        <h2 className="text-xl font-heading font-bold text-forest-dark flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-forest" />
          <span>3. MaternaAI Experimental Accessibility Index Formulation</span>
        </h2>
        <p className="text-xs text-charcoal-muted leading-relaxed">
          The composite index uses a transparent multi-criteria linear weighted sum model. Each indicator is first
          normalized to a standard scale (0 to 100) using Min-Max scaling:
        </p>
        <div className="p-4 rounded-xl bg-warmIvory border border-sage/20 font-mono text-xs text-forest-dark">
          Normalized_Indicator(i, d) = [ (X(i, d) - Min(i)) / (Max(i) - Min(i)) ] &times; 100
        </div>
        <p className="text-xs text-charcoal-muted leading-relaxed">
          The Composite Accessibility Index (CAI) for district <em>d</em> is then computed as:
        </p>
        <div className="p-4 rounded-xl bg-warmIvory border border-sage/20 font-mono text-xs text-forest-dark">
          CAI(d) = &sum; [ w_i &times; Normalized_Indicator(i, d) ] &nbsp;&nbsp; where &sum; w_i = 1.0
        </div>
      </section>

      {/* 4. Machine Learning Algorithms */}
      <section className="bg-white p-8 rounded-2xl border border-sage/20 shadow-subtle space-y-4">
        <h2 className="text-xl font-heading font-bold text-forest-dark flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-forest" />
          <span>4. Machine Learning Implementation &amp; Validation</span>
        </h2>
        <div className="space-y-3 text-xs text-charcoal-muted leading-relaxed">
          <p>
            <strong>Unsupervised K-Means Clustering:</strong> Identifies natural geographic groupings of districts
            based on multi-indicator service profiles. Features are standardized via <code>StandardScaler</code>.
            Optimal cluster counts are evaluated using silhouette coefficients across <em>k &isin; [2, 7]</em>.
            Dimensionality reduction via 2-component PCA enables visual validation.
          </p>
          <p>
            <strong>Supervised Random Forest Regressor:</strong> Estimates regional institutional delivery uptake
            from socioeconomic and infrastructure predictors. Models use 80/20 train-test splits and 5-fold cross-validation
            to evaluate generalizability (Mean Absolute Error, Root Mean Squared Error, R&sup2;).
          </p>
        </div>
      </section>

      {/* 5. DEDICATED SECTION: Research Limitations and Ethical Considerations */}
      <section className="bg-coral/5 p-8 rounded-2xl border border-coral/30 shadow-subtle space-y-5">
        <div className="flex items-center space-x-3 text-coral-dark">
          <AlertTriangle className="w-6 h-6 text-coral" />
          <h2 className="text-xl font-heading font-bold text-forest-dark">
            Research Limitations and Ethical Considerations
          </h2>
        </div>

        <div className="space-y-3 text-xs text-charcoal leading-relaxed">
          <p className="font-semibold text-forest-dark">
            This section specifies fundamental scientific caveats and ethical principles governing this platform:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Decision-Support, Not Clinical Diagnosis:</strong> MaternaAI is strictly a macro-level
              demographic and healthcare policy tool. It does not predict individual patient outcomes, diagnose
              obstetric complications, or prescribe therapies.
            </li>
            <li>
              <strong>Survey Lag:</strong> NFHS-5 data reflects conditions during 2019–2021. Recent post-pandemic
              facility upgrades or newly bifurcated administrative districts may not be reflected.
            </li>
            <li>
              <strong>Geographic Resolution:</strong> District-level statistics represent sampled cluster survey
              estimates subject to sampling errors in low-population mountain or island districts.
            </li>
            <li>
              <strong>Association vs. Causation:</strong> Statistical correlations (e.g., between female literacy
              and institutional births) reflect structural co-variation and must not be misinterpreted as monocausal
              mechanisms.
            </li>
            <li>
              <strong>Zero Individual PII:</strong> All data handled by the platform is strictly aggregated at the
              district and state administrative level. No personally identifiable medical records are utilized or stored.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};
