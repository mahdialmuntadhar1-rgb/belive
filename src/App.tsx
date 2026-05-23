/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import Scraper from '@/pages/Scraper';
import Review from '@/pages/Review';
import BusinessDashboard from '@/pages/BusinessDashboard';
import ClaimPage from '@/pages/ClaimPage';
import AdminDashboard from '@/pages/AdminDashboard';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import AdminRoute from '@/components/auth/AdminRoute';
import AdminToolbar from '@/components/BuildModeEditor/AdminToolbar';
import { BuildModeProvider } from '@/contexts/BuildModeContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <BuildModeProvider>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Main Homepage - Version 1 Design */}
            <Route path="/" element={<HomePage />} />
    
            {/* Admin Dashboard - Protected */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
    
            {/* Existing Scraper Pages */}
            <Route path="/scraper" element={<Scraper />} />
            <Route path="/review" element={<Review />} />
    
            {/* Business Dashboard */}
            <Route path="/dashboard" element={<BusinessDashboard />} />
    
            {/* Claim Flow */}
            <Route path="/claim" element={<ClaimPage />} />
    
            {/* Auth Routes */}
            <Route path="/reset-password" element={<ResetPasswordPage />} />
    
            {/* Catch-all 404 route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Admin Floating Toolbar */}
      <AdminToolbar />
    </BuildModeProvider>
  );
}
