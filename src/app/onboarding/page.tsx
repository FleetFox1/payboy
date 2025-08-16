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

    // Check if user has selected a role
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
        <p className="text-gray-600">Please wait while we redirect you</p>
      </div>
    </div>
  );
}

