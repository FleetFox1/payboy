'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    const savedRole = localStorage.getItem('selectedRole');
    if (savedRole) {
      router.replace(`/onboarding/${savedRole}`);
    } else {
      router.replace('/role'); // fallback
    }
  }, [router]);

  return null;
}
