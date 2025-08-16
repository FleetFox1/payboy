'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AuthModal from '@/components/AuthModal';

export default function HomePage() {
  const { authenticated, login } = usePrivy();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleGetStarted = () => {
    if (authenticated) {
      // Only redirect when they click Get Started
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
    } else {
      // If not authenticated, trigger login
      login();
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
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
            Accept <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">PYUSD</span> Payments
            <br />Instantly & Securely
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            The easiest way to accept PayPal USD (PYUSD) payments on Arbitrum. 
            Whether you're a store, individual seller, or marketplace - start accepting crypto payments in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
            >
              🚀 Start Accepting PYUSD
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition font-semibold text-lg"
            >
              Learn More
            </button>
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
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-gray-600">PayPal USD</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-gray-600">Privy Auth</span>
            </div>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Every Business</h2>
            <p className="text-xl text-gray-600">Choose your setup and start accepting PYUSD payments today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Physical Store */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center border border-blue-200">
              <div className="text-6xl mb-4">🏪</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Physical Store</h3>
              <p className="text-blue-700 mb-6">
                Generate QR codes for in-person payments. Perfect for retail stores, restaurants, and service businesses.
              </p>
              <ul className="text-sm text-blue-800 space-y-2 mb-6">
                <li>• Custom QR code generator</li>
                <li>• Print-ready payment codes</li>
                <li>• Real-time payment notifications</li>
                <li>• Transaction history & reporting</li>
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
                Sell individual items with instant payment links. Great for creators, freelancers, and individual sellers.
              </p>
              <ul className="text-sm text-green-800 space-y-2 mb-6">
                <li>• Instant payment links</li>
                <li>• No monthly fees</li>
                <li>• Built-in buyer protection</li>
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
                Create a platform where multiple sellers can list products and accept PYUSD payments.
              </p>
              <ul className="text-sm text-purple-800 space-y-2 mb-6">
                <li>• Multi-vendor platform</li>
                <li>• Commission-based revenue</li>
                <li>• Seller management tools</li>
                <li>• Analytics & reporting</li>
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
      <section id="features" className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose PayBoy?</h2>
            <p className="text-xl text-gray-600">Built on cutting-edge technology for the future of payments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Powered by Arbitrum One for instant, low-cost transactions. No more waiting for payment confirmations.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bank-Grade Security</h3>
              <p className="text-gray-600">
                Built on Ethereum L2 with PayPal USD stablecoin. Your payments are secure and transparent.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Low Fees</h3>
              <p className="text-gray-600">
                Minimal transaction costs on Arbitrum. Keep more of what you earn compared to traditional payment processors.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Reach</h3>
              <p className="text-gray-600">
                Accept payments from anywhere in the world. No borders, no currency conversion headaches.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mobile Ready</h3>
              <p className="text-gray-600">
                QR codes work with any smartphone. Your customers can pay instantly with their crypto wallets.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Setup</h3>
              <p className="text-gray-600">
                Get started in minutes, not days. No technical knowledge required - we handle the blockchain complexity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Powered By Section */}
      <section id="powered-by" className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powered By Industry Leaders</h2>
            <p className="text-xl text-gray-600">Built on trusted, battle-tested infrastructure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* PayPal USD */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">PayPal USD</h3>
              <p className="text-gray-600 text-sm">
                Regulated stablecoin backed by PayPal. 1:1 USD backed with full reserve transparency.
              </p>
            </div>

            {/* Arbitrum */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Arbitrum One</h3>
              <p className="text-gray-600 text-sm">
                Leading Ethereum Layer 2 solution. Fast, cheap, and secure transactions with Ethereum-level security.
              </p>
            </div>

            {/* Privy */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Privy</h3>
              <p className="text-gray-600 text-sm">
                Simple wallet authentication. Connect with email, phone, or existing wallets like MetaMask.
              </p>
            </div>

            {/* Ethereum */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">E</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ethereum</h3>
              <p className="text-gray-600 text-sm">
                World's most secure smart contract platform. Battle-tested infrastructure trusted by billions.
              </p>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="mt-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
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
                  <span className="text-white font-bold">S</span>
                </div>
                <p className="text-sm font-medium">Supabase</p>
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
      <section id="pricing" className="py-16 px-6 bg-gray-50">
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
                  Unlimited payment links
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Basic analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Email support
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Standard transaction fees only
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
                  Unlimited QR codes
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
                  Unlimited sellers
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Commission management
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Seller dashboard
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
              💰 <strong>Only pay network fees:</strong> ~$0.01-0.05 per transaction on Arbitrum
            </p>
            <p className="text-gray-500">
              No monthly fees, no setup costs, no hidden charges. Just fast, cheap PYUSD transactions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Accept PYUSD Payments?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using PayBoy to accept fast, secure crypto payments.
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
                The easiest way to accept PYUSD payments on Arbitrum.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API Reference</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Community</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
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

      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
