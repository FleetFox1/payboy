'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export default function DashboardRedirect() {
  const router = useRouter();
  const { authenticated } = usePrivy();

  useEffect(() => {
    if (!authenticated) {
      router.replace('/role');
      return;
    }

    // Check user type and redirect to appropriate dashboard
    const userType = localStorage.getItem('userType') || localStorage.getItem('selectedRole');
    
    if (userType === 'store') {
      router.replace('/dashboard/store');
    } else if (userType === 'solo-seller') {
      router.replace('/dashboard/solo-seller');
    } else if (userType === 'marketplace') {
      router.replace('/dashboard/marketplace');
    } else {
      // No user type found, send to role selection
      router.replace('/role');
    }
  }, [authenticated, router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-4xl mb-4">🔄</div>
        <h2 className="text-xl font-semibold mb-2">Redirecting to Dashboard...</h2>
        <p className="text-gray-600">Taking you to your personalized dashboard</p>
      </div>
    </div>
  );
}