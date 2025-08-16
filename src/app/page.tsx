'use client'
import { useState } from 'react'
import AuthModal from '@/components/AuthModal'

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold mb-4">Welcome to PayBoy</h1>
      <p className="text-gray-600 text-lg mb-6">
        The fastest way to onboard and pay creators, sellers, and platforms.
      </p>
      <button
        onClick={() => setModalOpen(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Get Started
      </button>

      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  )
}
