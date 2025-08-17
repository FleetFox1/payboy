'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthRedirect() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    if (authenticated && user) {
      const userType = localStorage.getItem('userType');
      const onboardingComplete = localStorage.getItem('onboardingComplete');
      
      if (onboardingComplete && userType) {
        switch (userType) {
          case 'store':
            router.push('/dashboard/store');
            break;
          case 'solo-seller':
            router.push('/seller/dashboard');
            break;
          case 'marketplace':
            router.push('/dashboard/marketplace');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        router.push('/role');
      }
    }
  }, [ready, authenticated, user, router]);

  return null;
}