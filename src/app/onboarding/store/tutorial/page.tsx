'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type TutorialSection = {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps: string[];
};

const tutorialSections: TutorialSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Your Store',
    icon: '🚀',
    description: 'Learn the basics of setting up and managing your PayBoy store',
    steps: [
      'Complete your store onboarding with business information',
      'Add your first products with photos and descriptions',
      'Configure your store settings and payment methods',
      'Share your store link to start accepting PYUSD payments',
      'Monitor orders and communicate with customers'
    ]
  },
  {
    id: 'managing-products',
    title: 'Managing Products',
    icon: '📦',
    description: 'How to add, edit, and organize your product catalog',
    steps: [
      'Click "Add Product" to create new listings',
      'Upload high-quality product photos (max 5MB)',
      'Write clear titles and detailed descriptions',
      'Set competitive prices in PYUSD',
      'Edit or remove products anytime from your products page'
    ]
  },
  {
    id: 'orders-management',
    title: 'Order Management',
    icon: '📋',
    description: 'Track and manage customer orders effectively',
    steps: [
      'View all orders with status indicators (pending, paid, shipped, completed)',
      'Mark orders as shipped when you send products',
      'Use "Contact Customer" to communicate about orders',
      'Track order history and customer information',
      'Handle returns and refunds when needed'
    ]
  },
  {
    id: 'customer-communication',
    title: 'Customer Communication',
    icon: '📞',
    description: 'Set up multiple ways for customers to contact you',
    steps: [
      'Go to Store Settings to configure contact methods',
      'Add your business email and phone number',
      'Connect PayPal and Venmo for alternative payments',
      'Link social media accounts (Instagram, Facebook, Telegram)',
      'Respond quickly to build customer trust and satisfaction'
    ]
  },
  {
    id: 'withdrawals',
    title: 'Withdrawing Your Earnings',
    icon: '💰',
    description: 'How to cash out your PYUSD earnings',
    steps: [
      'Click "Withdraw" from your store dashboard',
      'Enter the amount you want to withdraw',
      'Provide your destination wallet address',
      'Review the withdrawal summary and network fees',
      'Confirm the transaction and receive your PYUSD'
    ]
  },
  {
    id: 'store-settings',
    title: 'Store Settings & Customization',
    icon: '⚙️',
    description: 'Customize your store for better customer experience',
    steps: [
      'Update store name, description, and contact information',
      'Configure shipping settings for physical products',
      'Set up tax rates if required in your location',
      'Write clear return and refund policies',
      'Connect all your payment methods and social accounts'
    ]
  }
];

export default function StoreTutorial() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('getting-started');

  const currentSection = tutorialSections.find(s => s.id === activeSection);

  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Tutorial</h1>
          <p className="text-gray-600">Learn how to manage your PayBoy store and maximize sales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-4 space-y-2 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tutorial Topics</h3>
            {tutorialSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  activeSection === section.id
                    ? 'bg-blue-50 border-blue-200 border-2'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{section.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{section.title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {currentSection && (
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">{currentSection.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentSection.title}</h2>
                  <p className="text-gray-600">{currentSection.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {currentSection.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>

              {/* Pro Tips based on section */}
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips:</h4>
                {activeSection === 'getting-started' && (
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Start with 3-5 products to test the waters</li>
                    <li>• Use clear, professional product photos</li>
                    <li>• Set competitive prices by researching similar stores</li>
                  </ul>
                )}
                {activeSection === 'managing-products' && (
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Take photos in good lighting for best results</li>
                    <li>• Include size charts and measurements when relevant</li>
                    <li>• Update inventory regularly to avoid overselling</li>
                  </ul>
                )}
                {activeSection === 'orders-management' && (
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Ship orders quickly to maintain good ratings</li>
                    <li>• Send tracking information to customers</li>
                    <li>• Follow up after delivery to ensure satisfaction</li>
                  </ul>
                )}
                {activeSection === 'customer-communication' && (
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Respond to messages within 24 hours</li>
                    <li>• Be professional and friendly in all communications</li>
                    <li>• Multiple contact options build customer confidence</li>
                  </ul>
                )}
                {activeSection === 'withdrawals' && (
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Keep some ETH in your wallet for gas fees</li>
                    <li>• Withdraw regularly to secure your earnings</li>
                    <li>• Double-check wallet addresses before confirming</li>
                  </ul>
                )}
                {activeSection === 'store-settings' && (
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Complete all settings for professional appearance</li>
                    <li>• Review and update policies regularly</li>
                    <li>• Test your store from a customer's perspective</li>
                  </ul>
                )}
              </div>

              {/* Quick Action Button */}
              <div className="mt-6 flex justify-end">
                {activeSection === 'managing-products' && (
                  <button
                    onClick={() => router.push('/store/products/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Add Your First Product
                  </button>
                )}
                {activeSection === 'orders-management' && (
                  <button
                    onClick={() => router.push('/store/orders')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    View Orders
                  </button>
                )}
                {activeSection === 'withdrawals' && (
                  <button
                    onClick={() => router.push('/store/withdraw')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Withdraw Earnings
                  </button>
                )}
                {activeSection === 'store-settings' && (
                  <button
                    onClick={() => router.push('/store/settings')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Configure Settings
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Footer */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help With Your Store?</h3>
        <p className="text-blue-700 mb-4">
          Our support team is here to help you succeed with your PayBoy store!
        </p>
        <div className="space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Contact Store Support
          </button>
          <button className="text-blue-600 hover:text-blue-700">
            Join Seller Community
          </button>
        </div>
      </div>
    </main>
  );
}