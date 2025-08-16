'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

type StoreSettings = {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  shippingEnabled: boolean;
  shippingFee: string;
  taxRate: string;
  returnPolicy: string;
  termsOfService: string;
  // Payment methods
  paypalEmail: string;
  venmoUsername: string;
  // Social media
  telegramUsername: string;
  facebookUrl: string;
  instagramUsername: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const { authenticated, user } = usePrivy();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'My Store',
    storeDescription: 'A great place to shop for quality products',
    contactEmail: 'store@example.com',
    contactPhone: '+1 (555) 123-4567',
    shippingEnabled: true,
    shippingFee: '5.99',
    taxRate: '8.25',
    returnPolicy: '30-day return policy',
    termsOfService: 'Standard terms and conditions apply',
    // Payment methods
    paypalEmail: '',
    venmoUsername: '',
    // Social media
    telegramUsername: '',
    facebookUrl: '',
    instagramUsername: '',
  });

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Mock API call (backend dev will implement real save)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Add back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/onboarding/store')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Store Settings</h1>
        {success && (
          <div className="text-green-600 font-medium">Settings saved successfully!</div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Store Information */}
        <section className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={settings.contactPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store Description
            </label>
            <textarea
              name="storeDescription"
              value={settings.storeDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </section>

        {/* Payment Methods */}
        <section className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
          <p className="text-sm text-gray-600">Connect additional payment methods for your customers</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PayPal Email
              </label>
              <input
                type="email"
                name="paypalEmail"
                value={settings.paypalEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your-paypal@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venmo Username
              </label>
              <input
                type="text"
                name="venmoUsername"
                value={settings.venmoUsername}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="@your-venmo-username"
              />
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Social Media</h2>
          <p className="text-sm text-gray-600">Connect your social media accounts for customer support</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📱 Telegram Username
              </label>
              <input
                type="text"
                name="telegramUsername"
                value={settings.telegramUsername}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="@your-telegram"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📘 Facebook Page URL
              </label>
              <input
                type="url"
                name="facebookUrl"
                value={settings.facebookUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://facebook.com/your-page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📸 Instagram Username
              </label>
              <input
                type="text"
                name="instagramUsername"
                value={settings.instagramUsername}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="@your-instagram"
              />
            </div>
          </div>
        </section>

        {/* Shipping & Tax */}
        <section className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Shipping & Tax</h2>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="shippingEnabled"
              checked={settings.shippingEnabled}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Enable shipping for physical products
            </label>
          </div>

          {settings.shippingEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Fee (PYUSD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="shippingFee"
                  value={settings.shippingFee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="taxRate"
                  value={settings.taxRate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </section>

        {/* Policies */}
        <section className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Policies</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Return Policy
            </label>
            <textarea
              name="returnPolicy"
              value={settings.returnPolicy}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms of Service
            </label>
            <textarea
              name="termsOfService"
              value={settings.termsOfService}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </section>

        {/* Wallet Information */}
        <section className="bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Information</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Connected Wallet:</p>
            <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
              {user?.wallet?.address || 'Not connected'}
            </p>
            <p className="text-xs text-gray-500">
              This is where you'll receive PYUSD payments from your store
            </p>
          </div>
        </section>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-2 rounded font-medium transition ${
              isSaving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </main>
  );
}