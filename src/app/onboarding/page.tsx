'use client'
import { usePrivy } from '@privy-io/react-auth'

export default function Onboarding() {
  const { login, authenticated, user, ready } = usePrivy()

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading…</p>
      </main>
    )
  }

  async function next() {
    if (!authenticated) {
      await login()
      return
    }
    // TODO: POST /api/auth/privy-sync { email?, wallet: user?.wallet?.address }
    window.location.href = '/dashboard'
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mb-4">Onboarding</h1>
      <button
        onClick={next}
        className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        {authenticated ? 'Continue' : 'Connect with Privy'}
      </button>

      {authenticated && user?.wallet?.address && (
        <p className="mt-3 text-sm text-gray-600">
          Wallet: {user.wallet.address}
        </p>
      )}
    </main>
  )
}
