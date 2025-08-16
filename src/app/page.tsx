export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Welcome to PayBoy 💳</h1>
      <p className="mt-4 text-gray-600">Your Web3 payments made simple.</p>
      <a
        href="/onboarding"
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white"
      >
        Get Started
      </a>
    </main>
  )
}
