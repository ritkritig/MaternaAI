import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { MLLabPage } from './pages/MLLabPage';
import { AccessibilityLabPage } from './pages/AccessibilityLabPage';
import { RegionalPage } from './pages/RegionalPage';
import { InsightsPage } from './pages/InsightsPage';
import { MethodologyPage } from './pages/MethodologyPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="data-explorer" element={<DataExplorerPage />} />
          <Route path="ml-lab" element={<MLLabPage />} />
          <Route path="accessibility-lab" element={<AccessibilityLabPage />} />
          <Route path="regional" element={<RegionalPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="methodology" element={<MethodologyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
