import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Database,
  BrainCircuit,
  GitCompare,
  Lightbulb,
  BookOpen,
  Home,
  Sliders,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/', label: 'Overview', icon: Home, exact: true },
    { to: '/dashboard', label: 'Research Dashboard', icon: LayoutDashboard },
    { to: '/map', label: 'Healthcare Map', icon: MapPin },
    { to: '/data-explorer', label: 'Data Explorer', icon: Database },
    { to: '/ml-lab', label: 'ML Laboratory', icon: BrainCircuit },
    { to: '/accessibility-lab', label: 'Accessibility Index', icon: Sliders },
    { to: '/regional', label: 'Regional Comparison', icon: GitCompare },
    { to: '/insights', label: 'Research Insights', icon: Lightbulb },
    { to: '/methodology', label: 'Methodology & Ethics', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-forest text-warmIvory flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-forest-light flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-warmIvory/10 flex items-center justify-center p-1 border border-sage/30">
              <img src="/materna-logo.svg" alt="MaternaAI Logo" className="w-8 h-8" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold tracking-tight text-white block">
                MaternaAI
              </span>
              <span className="text-[10px] tracking-wider uppercase text-sage font-medium block">
                Healthcare Analytics
              </span>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-sage/70 uppercase tracking-wider">
            Research Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-forest-light text-white font-semibold shadow-sm border-l-4 border-sage'
                      : 'text-warmIvory/80 hover:text-white hover:bg-forest-light/50'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-sage" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            );
          })}
        </nav>

        {/* Research Disclaimer Footer */}
        <div className="p-4 m-3 bg-forest-dark/60 rounded-xl border border-sage/20 text-xs text-warmIvory/80 space-y-2">
          <div className="flex items-center space-x-2 text-sage font-medium">
            <ShieldCheck className="w-4 h-4 text-coral" />
            <span>Research Platform</span>
          </div>
          <p className="text-[11px] text-warmIvory/70 leading-relaxed">
            Non-clinical decision-support tool based on NFHS-5 &amp; HMIS statistical indicators.
          </p>
        </div>
      </aside>
    </>
  );
};
