'use client';

import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';

export default function HomePage() {
  const { login } = usePrivy();

  const handleGetStarted = () => {
    login();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                PayBoy
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-900 transition">
                Features
              </button>
              <button onClick={() => scrollToSection('payment-methods')} className="text-gray-600 hover:text-gray-900 transition">
                Payment Methods
              </button>
              <button onClick={() => scrollToSection('powered-by')} className="text-gray-600 hover:text-gray-900 transition">
                Partners
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-gray-900 transition">
                Pricing
              </button>
              <button
                onClick={handleGetStarted}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Accept <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Multiple Payment Types</span>
            <br />Instantly & Securely
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            The easiest way to accept PYUSD, Email, PayPal, and Venmo payments. 
            Whether you&apos;re a store, individual seller, or marketplace - start accepting payments in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
            >
              🚀 Start Accepting Payments
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition font-semibold text-lg"
            >
              Learn More
            </button>
          </div>

          {/* Payment Method Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-sm font-medium text-gray-700">PYUSD</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold text-xs">PayPal</span>
              </div>
              <span className="text-sm font-medium text-gray-700">PayPal</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold text-xs">Venmo</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Venmo</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold">@</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Email</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-gray-600">Arbitrum One</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-gray-600">Privy Auth</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-gray-600">MongoDB</span>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section id="payment-methods" className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Multiple Payment Options</h2>
            <p className="text-xl text-gray-600">Give your customers the freedom to pay how they want</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* PYUSD */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">PayPal USD (PYUSD)</h3>
              <p className="text-blue-700 text-sm mb-4">
                Stablecoin payments on Arbitrum. Fast, secure, and low-cost crypto transactions.
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Instant settlement</li>
                <li>• Low network fees</li>
                <li>• Global accessibility</li>
                <li>• Blockchain transparency</li>
              </ul>
            </div>

            {/* PayPal */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-sm">PayPal</span>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">PayPal</h3>
              <p className="text-blue-700 text-sm mb-4">
                Traditional PayPal payments for customers who prefer familiar methods.
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Buyer protection</li>
                <li>• Widely accepted</li>
                <li>• Bank/card linking</li>
                <li>• Dispute resolution</li>
              </ul>
            </div>

            {/* Venmo */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200">
              <div className="w-16 h-16 bg-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-sm">Venmo</span>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Venmo</h3>
              <p className="text-blue-700 text-sm mb-4">
                Social payments popular with younger demographics and casual transactions.
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Social features</li>
                <li>• Mobile-first</li>
                <li>• Instant transfers</li>
                <li>• Popular with Gen Z</li>
              </ul>
            </div>

            {/* Email */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">@</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Email Payments</h3>
              <p className="text-gray-700 text-sm mb-4">
                Send payment requests directly to customer email addresses.
              </p>
              <ul className="text-xs text-gray-800 space-y-1">
                <li>• No app required</li>
                <li>• Universal access</li>
                <li>• Payment reminders</li>
                <li>• Track status</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-green-900 mb-3">🎯 One Platform, All Payment Types</h3>
              <p className="text-green-800">
                Your customers can choose their preferred payment method while you manage everything from one dashboard. 
                Crypto, traditional payments, and email requests - all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Every Business</h2>
            <p className="text-xl text-gray-600">Choose your setup and start accepting payments today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Physical Store */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center border border-blue-200">
              <div className="text-6xl mb-4">🏪</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Physical Store</h3>
              <p className="text-blue-700 mb-6">
                Generate QR codes for in-person payments. Accept PYUSD, PayPal, Venmo, and email payments.
              </p>
              <ul className="text-sm text-blue-800 space-y-2 mb-6">
                <li>• Multi-payment QR codes</li>
                <li>• Print-ready materials</li>
                <li>• Real-time notifications</li>
                <li>• Transaction history</li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Set Up Store
              </button>
            </div>

            {/* Solo Seller */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center border border-green-200">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-2xl font-bold text-green-900 mb-4">Solo Seller</h3>
              <p className="text-green-700 mb-6">
                Send payment requests via email, PYUSD, PayPal, or Venmo. Perfect for freelancers and creators.
              </p>
              <ul className="text-sm text-green-800 space-y-2 mb-6">
                <li>• Multi-payment links</li>
                <li>• Email payment requests</li>
                <li>• No monthly fees</li>
                <li>• Social media integration</li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Start Selling
              </button>
            </div>

            {/* Marketplace */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center border border-purple-200">
              <div className="text-6xl mb-4">🏬</div>
              <h3 className="text-2xl font-bold text-purple-900 mb-4">Marketplace</h3>
              <p className="text-purple-700 mb-6">
                Enable multiple sellers to accept all payment types on your platform with commission management.
              </p>
              <ul className="text-sm text-purple-800 space-y-2 mb-6">
                <li>• Multi-vendor payments</li>
                <li>• Commission splitting</li>
                <li>• Seller dashboards</li>
                <li>• Platform analytics</li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Launch Marketplace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose PayBoy?</h2>
            <p className="text-xl text-gray-600">Built on cutting-edge technology for the future of payments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 border">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                PYUSD on Arbitrum for instant crypto payments. PayPal/Venmo for traditional speed.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bank-Grade Security</h3>
              <p className="text-gray-600">
                Blockchain security for crypto. PayPal protection for traditional payments.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multiple Revenue Streams</h3>
              <p className="text-gray-600">
                Accept crypto, traditional payments, and email requests. Never miss a sale.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global & Local</h3>
              <p className="text-gray-600">
                PYUSD works globally. PayPal/Venmo for local customers. Email works everywhere.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Customer Choice</h3>
              <p className="text-gray-600">
                Let customers pay their way. QR codes, links, or email requests.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Integration</h3>
              <p className="text-gray-600">
                One dashboard for all payment types. No complex integrations or multiple platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Powered By Section */}
      <section id="powered-by" className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powered By Industry Leaders</h2>
            <p className="text-xl text-gray-600">Built on trusted, battle-tested infrastructure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/PayPalUSD.logo.png"
                  alt="PayPal USD"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">PayPal USD</h3>
              <p className="text-gray-600 text-sm">
                Global leader in digital payments. PYUSD stablecoin and traditional PayPal/Venmo payments.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Arbitrum One</h3>
              <p className="text-gray-600 text-sm">
                Leading Ethereum Layer 2. Fast, cheap, and secure PYUSD transactions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Privy</h3>
              <p className="text-gray-600 text-sm">
                Simple wallet authentication. Connect with email, phone, or existing wallets.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/ENS.logo.png"
                  alt="ENS"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ENS Domains</h3>
              <p className="text-gray-600 text-sm">
                Human-readable addresses. Send payments to yourname.eth instead of 0x123...
              </p>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Technology Stack</h3>
              <p className="text-gray-600">Enterprise-grade tools for maximum reliability</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">N</span>
                </div>
                <p className="text-sm font-medium">Next.js</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">T</span>
                </div>
                <p className="text-sm font-medium">TypeScript</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">M</span>
                </div>
                <p className="text-sm font-medium">MongoDB</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">W</span>
                </div>
                <p className="text-sm font-medium">Wagmi</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">R</span>
                </div>
                <p className="text-sm font-medium">Redis</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">T</span>
                </div>
                <p className="text-sm font-medium">Tailwind</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">No hidden fees. Pay only for what you use.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Solo Seller */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Solo Seller</h3>
              <p className="text-gray-600 mb-6">Perfect for individual sellers</p>
              <div className="text-4xl font-bold text-green-600 mb-6">Free</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  All payment methods
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Unlimited payment links
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Email payment requests
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Basic analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Email support
                </li>
              </ul>
            </div>

            {/* Store */}
            <div className="bg-white rounded-2xl p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Physical Store</h3>
              <p className="text-gray-600 mb-6">For brick-and-mortar businesses</p>
              <div className="text-4xl font-bold text-blue-600 mb-6">Free</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  All payment methods
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Multi-payment QR codes
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Print-ready materials
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Real-time notifications
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Advanced analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Priority support
                </li>
              </ul>
            </div>

            {/* Marketplace */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Marketplace</h3>
              <p className="text-gray-600 mb-6">For multi-vendor platforms</p>
              <div className="text-4xl font-bold text-purple-600 mb-6">Free</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  All payment methods
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Unlimited sellers
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Commission management
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Multi-vendor dashboards
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Platform analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  White-label options
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-4">
              💰 <strong>Payment Processing:</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <strong>PYUSD:</strong> ~$0.01-0.05 network fees
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <strong>PayPal:</strong> Standard PayPal rates
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <strong>Venmo:</strong> Standard Venmo rates
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <strong>Email:</strong> Free to send
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Accept All Payment Types?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join businesses using PayBoy to accept PYUSD, PayPal, Venmo, and email payments all in one place.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-12 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-bold text-xl"
          >
            🚀 Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="text-xl font-bold text-white">PayBoy</span>
              </div>
              <p className="text-gray-400">
                Accept PYUSD, PayPal, Venmo, and email payments all in one platform.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><button className="hover:text-white transition">Features</button></li>
                <li><button className="hover:text-white transition">Payment Methods</button></li>
                <li><button className="hover:text-white transition">Pricing</button></li>
                <li><button className="hover:text-white transition">Documentation</button></li>
                <li><button className="hover:text-white transition">API Reference</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><button className="hover:text-white transition">About</button></li>
                <li><button className="hover:text-white transition">Blog</button></li>
                <li><button className="hover:text-white transition">Careers</button></li>
                <li><button className="hover:text-white transition">Contact</button></li>
                <li><button className="hover:text-white transition">Press Kit</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><button className="hover:text-white transition">Help Center</button></li>
                <li><button className="hover:text-white transition">Community</button></li>
                <li><button className="hover:text-white transition">Status</button></li>
                <li><button className="hover:text-white transition">Security</button></li>
                <li><button className="hover:text-white transition">Privacy</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 PayBoy. Built with ❤️ for the future of payments.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
