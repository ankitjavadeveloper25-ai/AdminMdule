import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <div
      className="flex h-screen overflow-hidden bg-background bg-cover bg-center relative"
      style={{ backgroundImage: "url('/assets/bg-mesh.png')" }}
    >
      {/* Subtle Dark Ambient Overlay */}
      <div className="absolute inset-0 bg-background/90 pointer-events-none" />

      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
