/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import Scraper from '@/pages/Scraper';
import Review from '@/pages/Review';
import BusinessDashboard from '@/components/dashboard/BusinessDashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import './styles/humus-design.css';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main Homepage - Version 1 Design */}
        <Route path="/" element={<HomePage />} />

        {/* Existing Scraper Pages */}
        <Route path="/scraper" element={<Scraper />} />
        <Route path="/review" element={<Review />} />

        {/* Business Dashboard — requires authenticated business_owner */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireBusinessOwner>
              <BusinessDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
