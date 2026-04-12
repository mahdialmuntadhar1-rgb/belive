import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireBusinessOwner?: boolean;
}

export default function ProtectedRoute({ children, requireBusinessOwner = false }: ProtectedRouteProps) {
  const { user, profile } = useAuthStore();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if business owner role is required
  if (requireBusinessOwner && profile?.role !== 'business_owner') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-xl text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#2B2F33] mb-2">Access Denied</h2>
          <p className="text-[#6B7280] mb-6">Only business owners can access this page.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-[#2CA6A4] text-white font-bold rounded-2xl hover:bg-[#1e7a78] transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
