'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export default function OnboardingRouter() {
  const router = useRouter();
  const { authenticated } = usePrivy();

  useEffect(() => {
    // Check if user is authenticated first
    if (!authenticated) {
      router.replace('/role');
      return;
    }

    // Check if user already has a userType (completed onboarding)
    const userType = localStorage.getItem('userType');
    
    if (userType) {
      // User has completed onboarding, redirect to their dashboard
      switch (userType) {
        case 'marketplace':
        case 'marketplace_owner':
          router.replace('/dashboard/marketplace');
          return;
        case 'solo_seller':
        case 'seller':
          router.replace('/dashboard/solo-seller');
          return;
        case 'store_owner':
        case 'store':
          router.replace('/dashboard/store');
          return;
        default:
          // Unknown user type, clear and start over
          localStorage.removeItem('userType');
          break;
      }
    }

    // Check if user has selected a role but hasn't completed onboarding
    const savedRole = localStorage.getItem('selectedRole');
    
    if (savedRole === 'store') {
      router.replace('/onboarding/store');
    } else if (savedRole === 'solo-seller') {
      router.replace('/onboarding/solo-seller');
    } else if (savedRole === 'marketplace') {
      router.replace('/onboarding/marketplace');
    } else {
      // No role selected, send to role selection
      router.replace('/role');
    }
  }, [authenticated, router]);

  // Show loading while routing
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Setting up your account...</h2>
        <p className="text-gray-600">Redirecting you to the right place</p>
      </div>
    </div>
  );
}