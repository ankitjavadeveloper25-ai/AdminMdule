import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { UsersPage } from './features/users/UsersPage';
import { UserDetailsPage } from './features/users/UserDetailsPage';
import { GrantsPage } from './features/subscriptions/GrantsPage';
import { AnnouncementsPage } from './features/announcements/AnnouncementsPage';
import { PromoCodesPage } from './features/promos/PromoCodesPage';
import { PaymentsPage } from './features/payments/PaymentsPage';
import { AuditLogsPage } from './features/audit-logs/AuditLogsPage';
import { SettingsPage } from './features/settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/:userId" element={<UserDetailsPage />} />
                <Route path="/subscriptions" element={<GrantsPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/promo-codes" element={<PromoCodesPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/audit-logs" element={<AuditLogsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
