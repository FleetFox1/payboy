'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { authenticated } = usePrivy();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const alreadyOnboarded = localStorage.getItem('pb.hasOnboarded');
      if (alreadyOnboarded) {
        router.push('/dashboard'); // skip if already done
      }
    }
  }, []);

  useEffect(() => {
    if (!authenticated && typeof window !== 'undefined') {
      router.push('/');
    }
  }, [authenticated]);

  const handleContinue = () => {
    if (selectedRole && typeof window !== 'undefined') {
      localStorage.setItem('pb.businessType', selectedRole);
      localStorage.setItem('pb.hasOnboarded', 'true');
      router.push('/dashboard');
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Choose Your Role</h1>

      <div className="flex flex-col gap-4">
        {['Solo Seller', 'Store', 'Marketplace'].map((role) => (
          <button
            key={role}
            className={`rounded-md border px-4 py-2 ${
              selectedRole === role
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setSelectedRole(role)}
          >
            {role}
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedRole}
        className={`mt-4 rounded-md px-4 py-2 ${
          selectedRole
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continue
      </button>
    </main>
  );
}
