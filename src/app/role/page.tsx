'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

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
        You can change later in Settings.
      </p>
    </main>
  )
}