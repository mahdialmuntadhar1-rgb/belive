/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import Scraper from '@/pages/Scraper';
import Review from '@/pages/Review';
import BusinessDashboard from '@/pages/BusinessDashboard';
import ClaimPage from '@/pages/ClaimPage';
import AdminDashboard from '@/pages/AdminDashboard';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import './styles/humus-design.css';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main Homepage - Version 1 Design */}
        <Route path="/" element={<HomePage />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

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
    </Router>
  );
}
