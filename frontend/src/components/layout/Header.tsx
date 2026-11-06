import React from 'react';
import { Menu, Database, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
  datasetName?: string;
  recordCount?: number;
  isSynthetic?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  datasetName = 'Synthetic Demonstration Dataset (State-Anchored NFHS-5 Simulation)',
  recordCount = 751,
  isSynthetic = true,
}) => {
  const location = useLocation();

  const getBreadcrumbTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Overview & Project Vision';
      case '/dashboard':
        return 'Research Dashboard';
      case '/map':
        return 'India Healthcare Accessibility Map';
      case '/data-explorer':
        return 'Data Explorer & Preprocessing';
      case '/ml-lab':
        return 'Machine Learning Laboratory';
      case '/accessibility-lab':
        return 'MaternaAI Accessibility Index';
      case '/regional':
        return 'Regional Comparison';
      case '/insights':
        return 'Empirical Research Insights';
      case '/methodology':
        return 'Methodology & Research Ethics';
      default:
        return 'Analytics Platform';
    }
  };

  return (
    <div className="sticky top-0 z-30">
      {/* Prominent Scientific Disclaimer Banner for Synthetic Demonstration Dataset */}
      {isSynthetic && (
        <div className="bg-amber-600 text-white text-[11px] px-4 py-1.5 flex items-center justify-center space-x-2 font-medium tracking-wide shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            <strong>DEMONSTRATION MODE:</strong> Active dataset contains synthetically simulated values calibrated around state-level NFHS-5 benchmarks. Results cannot be interpreted as actual field-validated maternal healthcare conditions.
          </span>
        </div>
      )}

      {!isSynthetic && (
        <div className="bg-emerald-700 text-white text-[11px] px-4 py-1.5 flex items-center justify-center space-x-2 font-medium tracking-wide shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            <strong>AUTHENTIC DATASET LOADED:</strong> Evaluating user-uploaded survey records.
          </span>
        </div>
      )}

      <header className="bg-warmIvory/90 backdrop-blur-md border-b border-sage/20 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg text-forest hover:bg-sage/20 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <nav className="text-xs text-charcoal-muted flex items-center space-x-1.5">
              <span>MaternaAI</span>
              <span>/</span>
              <span className="text-forest font-medium">{getBreadcrumbTitle()}</span>
            </nav>
            <h1 className="text-lg font-heading font-bold text-forest-dark sm:text-xl">
              {getBreadcrumbTitle()}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Dataset Status Pill */}
          <div className="hidden md:flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full border border-sage/30 shadow-subtle text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isSynthetic ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <Database className="w-3.5 h-3.5 text-forest" />
            <span className="text-charcoal font-medium truncate max-w-[220px]">
              {datasetName}
            </span>
            <span className="text-charcoal-muted">({recordCount} districts)</span>
          </div>

          {/* Research Notice Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-coral/10 border border-coral/30 text-coral-dark px-3 py-1.5 rounded-full text-xs font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-coral" />
            <span>Academic Research Use</span>
          </div>
        </div>
      </header>
    </div>
  );
};
