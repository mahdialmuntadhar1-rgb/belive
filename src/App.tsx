/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import Scraper from '@/pages/Scraper';
import Review from '@/pages/Review';
import BusinessDashboard from '@/pages/BusinessDashboard';
import ClaimPage from '@/pages/ClaimPage';
import AdminDashboard from '@/pages/AdminDashboard';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import AdminRoute from '@/components/auth/AdminRoute';
import { useAuthStore } from '@/stores/authStore';
import { ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import './styles/humus-design.css';

export default function App() {
  const { user, profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin' || user?.email === 'safaribosafar@gmail.com';

  return (
    <Router>
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

      {/* Global Admin Access FAB */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-[9999]"
          >
            <Link
              to="/admin"
              className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 hover:bg-primary-dark transition-all group relative"
              title="Admin Dashboard"
            >
              <ShieldCheck className="w-8 h-8" />
              <div className="absolute right-full mr-4 px-4 py-2 bg-white text-primary text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100">
                Open Admin Panel
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </Router>
  );
}
