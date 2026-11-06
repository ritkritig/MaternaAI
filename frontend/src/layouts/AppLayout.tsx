import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { fetchDatasetSummary } from '../services/api';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [metadata, setMetadata] = useState<{
    name: string;
    record_count: number;
    is_synthetic: boolean;
  }>({
    name: 'Synthetic Demonstration Dataset (State-Anchored NFHS-5 Simulation)',
    record_count: 751,
    is_synthetic: true,
  });

  useEffect(() => {
    fetchDatasetSummary()
      .then((data) => {
        if (data?.metadata) {
          setMetadata({
            name: data.metadata.name,
            record_count: data.metadata.record_count,
            is_synthetic: data.metadata.is_synthetic ?? true,
          });
        }
      })
      .catch((err) => console.error('Failed to load dataset metadata in layout', err));
  }, []);

  return (
    <div className="min-h-screen bg-warmIvory flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          datasetName={metadata.name}
          recordCount={metadata.record_count}
          isSynthetic={metadata.is_synthetic}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
