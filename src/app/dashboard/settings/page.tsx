'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/FormField';
import { SelectField } from '@/components/SelectField';

interface UserSettings {
  displayName: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  website: string;
  socialMedia: string;
  notificationEmail: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  theme: string;
  language: string;
  timezone: string;
  currency: string;
  userType: string;
}

const themes = ['Light', 'Dark', 'Auto'];
const languages = ['English', 'Spanish', 'French', 'German', 'Japanese'];
const timezones = [
  'UTC-8 (PST)',
  'UTC-5 (EST)', 
  'UTC+0 (GMT)',
  'UTC+1 (CET)',
  'UTC+9 (JST)'
];

export default function DashboardSettings() {
  const { authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [userType, setUserType] = useState('');
  
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    description: '',
    website: '',
    socialMedia: '',
    notificationEmail: '',
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    theme: 'Light',
    language: 'English',
    timezone: 'UTC-5 (EST)',
    currency: 'PYUSD',
    userType: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load settings based on user type
      const savedUserType = localStorage.getItem('userType') || '';
      setUserType(savedUserType);
      
      let userData = null;
      if (savedUserType === 'store') {
        userData = localStorage.getItem('storeInfo');
      } else if (savedUserType === 'solo-seller') {
        userData = localStorage.getItem('sellerInfo');
      } else if (savedUserType === 'marketplace') {
        userData = localStorage.getItem('marketplaceInfo');
      }

      if (userData) {
        const parsed = JSON.parse(userData);
        setSettings(prev => ({
          ...prev,
          displayName: parsed.storeName || parsed.displayName || parsed.marketplaceName || '',
          email: parsed.storeEmail || parsed.contactEmail || parsed.businessEmail || '',
          phone: parsed.storePhone || parsed.contactPhone || parsed.businessPhone || '',
          location: parsed.storeAddress || parsed.location || parsed.businessAddress || '',
          description: parsed.description || parsed.businessDescription || '',
          website: parsed.website || parsed.websiteUrl || '',
          socialMedia: parsed.socialMedia || '',
          notificationEmail: parsed.notificationEmail || '',
          userType: savedUserType
        }));
      }

      // Load other settings from localStorage
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    }
  }, []);

  const updateSetting = (field: keyof UserSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('');

    try {
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Update the specific user type data
      if (userType === 'store') {
        const storeData = JSON.parse(localStorage.getItem('storeInfo') || '{}');
        const updatedStore = {
          ...storeData,
          storeName: settings.displayName,
          storeEmail: settings.email,
          storePhone: settings.phone,
          storeAddress: settings.location,
          description: settings.description,
          website: settings.website,
          notificationEmail: settings.notificationEmail
        };
        localStorage.setItem('storeInfo', JSON.stringify(updatedStore));
      } else if (userType === 'solo-seller') {
        const sellerData = JSON.parse(localStorage.getItem('sellerInfo') || '{}');
        const updatedSeller = {
          ...sellerData,
          displayName: settings.displayName,
          contactEmail: settings.email,
          contactPhone: settings.phone,
          location: settings.location,
          businessDescription: settings.description,
          websiteUrl: settings.website,
          socialMedia: settings.socialMedia
        };
        localStorage.setItem('sellerInfo', JSON.stringify(updatedSeller));
      } else if (userType === 'marketplace') {
        const marketplaceData = JSON.parse(localStorage.getItem('marketplaceInfo') || '{}');
        const updatedMarketplace = {
          ...marketplaceData,
          marketplaceName: settings.displayName,
          businessEmail: settings.email,
          businessPhone: settings.phone,
          businessAddress: settings.location,
          description: settings.description,
          website: settings.website,
          notificationEmail: settings.notificationEmail
        };
        localStorage.setItem('marketplaceInfo', JSON.stringify(updatedMarketplace));
      }

      // Try API call
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch('/api/me', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(settings)
          });

          if (response.ok) {
            setSaveStatus('Settings saved successfully!');
          } else {
            setSaveStatus('Settings saved locally');
          }
        } catch (apiError) {
          setSaveStatus('Settings saved locally');
        }
      } else {
        setSaveStatus('Settings saved locally');
      }

    } catch (err) {
      setSaveStatus('Error saving settings');
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'store': return 'Physical Store';
      case 'solo-seller': return 'Solo Seller';
      case 'marketplace': return 'Marketplace';
      default: return 'User';
    }
  };

  const getBackUrl = () => {
    switch (userType) {
      case 'store': return '/dashboard/store';
      case 'solo-seller': return '/seller/dashboard';
      case 'marketplace': return '/dashboard/marketplace';
      default: return '/dashboard';
    }
  };

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please connect your wallet</h2>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600 mt-1">{getUserTypeLabel()} Account</p>
            </div>
            <button
              onClick={() => router.push(getBackUrl())}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          {saveStatus && (
            <div className={`mt-4 p-3 rounded-lg ${
              saveStatus.includes('Error') 
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {saveStatus}
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-3xl">👤</span>
              Profile Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label={userType === 'store' ? 'Store Name' : userType === 'marketplace' ? 'Marketplace Name' : 'Display Name'}
                type="text"
                value={settings.displayName}
                onChange={(value: string) => updateSetting('displayName', value)}
                placeholder="Your display name"
              />

              <FormField
                label="Email Address"
                type="email"
                value={settings.email}
                onChange={(value: string) => updateSetting('email', value)}
                placeholder="your@email.com"
              />

              <FormField
                label="Phone Number"
                type="tel"
                value={settings.phone}
                onChange={(value: string) => updateSetting('phone', value)}
                placeholder="+1 (555) 123-4567"
              />

              <FormField
                label={userType === 'store' ? 'Store Address' : 'Location'}
                type="text"
                value={settings.location}
                onChange={(value: string) => updateSetting('location', value)}
                placeholder="Your location"
              />

              <FormField
                label="Website"
                type="url"
                value={settings.website}
                onChange={(value: string) => updateSetting('website', value)}
                placeholder="https://yourwebsite.com"
              />

              {userType === 'solo-seller' && (
                <FormField
                  label="Social Media"
                  type="text"
                  value={settings.socialMedia}
                  onChange={(value: string) => updateSetting('socialMedia', value)}
                  placeholder="@username or profile link"
                />
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => updateSetting('description', e.target.value)}
                placeholder="Tell people about your business..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-3xl">🔔</span>
              Notifications
            </h2>
            
            <div className="space-y-4">
              <FormField
                label="Notification Email"
                type="email"
                value={settings.notificationEmail}
                onChange={(value: string) => updateSetting('notificationEmail', value)}
                placeholder="notifications@yourstore.com"
              />

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                    className="mr-3"
                  />
                  <span>Email notifications for orders and payments</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                    className="mr-3"
                  />
                  <span>SMS notifications for urgent updates</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.marketingEmails}
                    onChange={(e) => updateSetting('marketingEmails', e.target.checked)}
                    className="mr-3"
                  />
                  <span>Marketing emails and product updates</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-3xl">⚙️</span>
              Preferences
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Theme"
                value={settings.theme}
                onChange={(value) => updateSetting('theme', value)}
                options={themes.map(theme => ({ value: theme, label: theme }))}
                placeholder="Select theme"
              />

              <SelectField
                label="Language"
                value={settings.language}
                onChange={(value) => updateSetting('language', value)}
                options={languages.map(lang => ({ value: lang, label: lang }))}
                placeholder="Select language"
              />

              <SelectField
                label="Timezone"
                value={settings.timezone}
                onChange={(value) => updateSetting('timezone', value)}
                options={timezones.map(tz => ({ value: tz, label: tz }))}
                placeholder="Select timezone"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Currency
                </label>
                <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      P
                    </div>
                    <div>
                      <h3 className="font-medium text-green-900">PayPal USD (PYUSD)</h3>
                      <p className="text-sm text-green-700">Default payment currency</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-3xl">🔐</span>
              Account Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="p-3 bg-gray-50 border rounded-lg">
                  <p className="font-medium">{getUserTypeLabel()}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connected Wallet
                </label>
                <div className="p-3 bg-gray-50 border rounded-lg">
                  <p className="font-mono text-sm">
                    {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}