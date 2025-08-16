'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import ENSAddress from '@/components/ENSAddress'

type BusinessType = 'solo' | 'store' | 'marketplace'

const OPTIONS: Array<{ key: BusinessType; title: string; desc: string; emoji: string }> = [
  { key: 'solo',         title: 'Solo Seller',            desc: 'Just you selling services or one-off items.',           emoji: '🧑‍💻' },
  { key: 'store',        title: 'Store',                  desc: 'A single brand/shop with multiple products.',           emoji: '🏬'   },
  { key: 'marketplace',  title: 'Marketplace / Platform', desc: 'You host buyers and sellers; platform fees optional.', emoji: '🌐'   },
]

export default function RolePage() {
  const router = useRouter()
  const [choice, setChoice] = useState<BusinessType | null>(null)

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('pb.businessType')) as BusinessType | null
    if (saved) setChoice(saved)
  }, [])

  function saveAndContinue() {
    if (!choice) return
    localStorage.setItem('pb.businessType', choice)

    // Redirect to the proper onboarding page
    const routeMap: Record<BusinessType, string> = {
      solo: 'solo-seller',
      store: 'store',
      marketplace: 'marketplace'
    }

    router.push(`/onboarding/${routeMap[choice]}`)
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* ENS Testing Section - Remove after testing */}
      <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-900 mb-3">🧪 ENS Resolution Test</h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-yellow-800 font-medium">vitalik.eth:</p>
              <ENSAddress address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" />
            </div>
            <div>
              <p className="text-yellow-800 font-medium">Random address:</p>
              <ENSAddress address="0x225f137127d9067788314bc7fcc1f36746a3c3B5" />
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">
            Check browser console for ENS resolution logs. Remove this section after testing.
          </p>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-center">What type of account are you setting up?</h1>
      <p className="mt-2 text-center text-gray-600">
        Pick the option that best matches how you'll accept payments.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {OPTIONS.map(opt => {
          const selected = choice === opt.key
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setChoice(opt.key)}
              className={[
                'rounded-xl border p-5 text-left transition',
                selected ? 'border-blue-600 ring-2 ring-blue-600' : 'hover:border-gray-400',
              ].join(' ')}
            >
              <div className="text-3xl">{opt.emoji}</div>
              <div className="mt-3 font-semibold">{opt.title}</div>
              <div className="mt-1 text-sm text-gray-600">{opt.desc}</div>
            </button>
          )
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={saveAndContinue}
          disabled={!choice}
          className={[
            'rounded-lg px-4 py-2 text-white',
            choice ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed',
          ].join(' ')}
        >
          Continue
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        You can change this later in Settings.
      </p>
    </main>
  )
}