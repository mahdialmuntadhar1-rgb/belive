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
import AdminClaimsDashboard from '@/pages/AdminClaimsDashboard';
import ShakuMakuAdmin from '@/pages/ShakuMakuAdmin';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import BusinessOwnerDashboard from '@/pages/BusinessOwnerDashboard';
import AdminRoute from '@/components/auth/AdminRoute';
import BuildModeEditor from '@/components/BuildModeEditor/BuildModeEditor';
import { useAuthStore } from '@/stores/authStore';
import { ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import './styles/humus-design.css';

export default function App() {
  const { profile } = useAuthStore();
  
  // Admin visibility logic: Check role OR show always in DEV mode
  const showAdminFAB = (profile?.role === 'admin') || (import.meta.env.DEV);

  // Build Mode Access Check - Admin only
  const hasBuildModeAccess = profile?.role === 'admin';

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

        {/* Admin Claims Dashboard - Protected */}
        <Route 
          path="/admin/claims" 
          element={
            <AdminRoute>
              <AdminClaimsDashboard />
            </AdminRoute>
          } 
        />

        {/* Shaku Maku Admin - Protected */}
        <Route 
          path="/admin/shaku-maku" 
          element={
            <AdminRoute>
              <ShakuMakuAdmin />
            </AdminRoute>
          } 
        />

        {/* Existing Scraper Pages */}
        <Route path="/scraper" element={<Scraper />} />
        <Route path="/review" element={<Review />} />

        {/* Business Dashboard */}
        <Route path="/dashboard" element={<BusinessDashboard />} />

        {/* Business Owner Dashboard */}
        <Route path="/my-business" element={<BusinessOwnerDashboard />} />

        {/* Claim Flow */}
        <Route path="/claim" element={<ClaimPage />} />

        {/* Auth Routes */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Catch-all 404 route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Build Mode Editor - Build Mode Only */}
      {hasBuildModeAccess && <BuildModeEditor />}

      {/* Global Admin Access FAB */}
      <AnimatePresence>
        {showAdminFAB && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-[9999]"
          >
            <Link
              to="/admin"
              className="w-16 h-16 bg-[#0F7B6C] text-[#C8A96A] rounded-full shadow-2xl shadow-[#0F7B6C]/40 flex items-center justify-center hover:scale-110 hover:bg-[#0d6b5e] transition-all group relative"
              title="Admin Dashboard"
            >
              <ShieldCheck className="w-8 h-8" />
              <div className="absolute right-full mr-4 px-4 py-2 bg-white text-[#0F7B6C] text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100">
                Open Admin Panel {import.meta.env.DEV && profile?.role !== 'admin' && "(DEV MODE)"}
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </Router>
  );
}
