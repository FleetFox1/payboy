'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const { login, logout, authenticated, getAccessToken, user, ready } = usePrivy()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Watch for authentication state changes after login
  useEffect(() => {
    console.log('🔍 AuthModal: Auth state changed')
    console.log('🔍 AuthModal: Ready:', ready)
    console.log('🔍 AuthModal: Authenticated:', authenticated)
    console.log('🔍 AuthModal: User:', user)
    console.log('🔍 AuthModal: Loading:', loading)
    
    // Only proceed if we're ready, authenticated, have a user, and are currently loading
    if (ready && authenticated && user && loading) {
      console.log('✅ AuthModal: All conditions met, proceeding with backend auth')
      handleBackendAuth()
    }
  }, [ready, authenticated, user, loading])

  if (!open) return null

  // Handle logout for testing
  async function handleLogout() {
    try {
      console.log('🚪 AuthModal: Logging out...')
      await logout()
      
      // Clear local storage
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      
      console.log('✅ AuthModal: Logged out successfully')
      setError('')
    } catch (error) {
      console.error('❌ AuthModal: Logout failed:', error)
    }
  }

  // Handle the backend authentication after Privy login is complete
  async function handleBackendAuth() {
    try {
      console.log('🔑 AuthModal: Getting access token...')
      
      const accessToken = await getAccessToken()
      
      if (!accessToken) {
        console.error('❌ AuthModal: No access token received')
        setError('Failed to get authentication token')
        setLoading(false)
        return
      }

      console.log('🎟️ AuthModal: ✅ Access token received')
      console.log('📡 AuthModal: Calling backend /api/auth...')
      
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          accessToken: accessToken 
        })
      })

      console.log('📨 AuthModal: Backend response status:', response.status)
      
      let data
      try {
        data = await response.json()
        console.log('📋 AuthModal: Backend response data:', data)
      } catch (parseError) {
        console.error('❌ AuthModal: Failed to parse backend response:', parseError)
        setError('Invalid response from server')
        setLoading(false)
        return
      }

      if (data.success && data.token) {
        // Store the JWT token
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userData', JSON.stringify(data.user))
        
        console.log('✅ AuthModal: Login successful!')
        console.log('👤 AuthModal: User data:', data.user)
        
        onClose()
        
        // Redirect based on user type
        if (data.user.userType === 'seller') {
          console.log('🎯 AuthModal: Existing seller - redirecting to seller dashboard')
          router.push('/seller/dashboard')
        } else if (data.user.userType === 'merchant') {
          console.log('🎯 AuthModal: Existing merchant - redirecting to merchant dashboard')
          router.push('/merchant/dashboard')
        } else if (data.user.userType === 'buyer' && data.user.onboardingCompleted) {
          console.log('🎯 AuthModal: Existing buyer - redirecting to dashboard')
          router.push('/dashboard')
        } else {
          console.log('🎯 AuthModal: New user - redirecting to role selection')
          router.push('/role')
        }
      } else {
        console.error('❌ AuthModal: Backend auth failed:', data.error)
        setError(data.error || 'Authentication failed')
      }
    } catch (error) {
      console.error('💥 AuthModal: Backend auth error:', error)
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Privy login trigger
  async function handlePrivyLogin() {
    console.log('🔍 AuthModal: Starting Privy login...')
    console.log('🔍 AuthModal: Currently authenticated?', authenticated)
    
    setLoading(true)
    setError('')

    try {
      console.log('📱 AuthModal: Calling Privy login()...')
      
      // If already authenticated, proceed directly to backend auth
      if (authenticated && user) {
        console.log('✅ AuthModal: Already authenticated, proceeding to backend auth')
        await handleBackendAuth()
        return
      }
      
      // Trigger Privy login modal
      await login()
      console.log('✅ AuthModal: Privy login modal completed')
      
      // The useEffect hook will handle the rest when state updates
      
    } catch (error) {
      console.error('💥 AuthModal: Privy login error:', error)
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-sm p-6 relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-6 text-center">
          Welcome to PayBoy
        </h2>

        <p className="text-gray-600 text-center mb-6">
          Sign in with your email or connect your wallet. We'll create a secure wallet for you automatically.
        </p>

        {/* Show logout button if already authenticated (for testing) */}
        {authenticated && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 mb-2">
              ⚠️ Already logged in as: {user?.email?.address || user?.wallet?.address || 'wallet user'}
            </p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition text-sm"
            >
              🚪 Logout First
            </button>
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handlePrivyLogin}
          disabled={loading || !ready}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition mb-4"
        >
          {!ready ? 'Loading...' : loading ? 'Connecting...' : authenticated ? '🔄 Continue with Account' : '🚀 Sign In / Sign Up'}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-2">
          <p>✅ Email sign-in with auto wallet creation</p>
          <p>✅ Connect existing wallet (MetaMask, WalletConnect)</p>
          <p>✅ Secure and encrypted</p>
        </div>

        <p className="text-xs text-center mt-4 text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <p><strong>Debug:</strong></p>
            <p>Ready: {String(ready)}</p>
            <p>Authenticated: {String(authenticated)}</p>
            <p>User ID: {user?.id || 'None'}</p>
            <p>Email: {user?.email?.address || 'None'}</p>
            <p>Wallet: {user?.wallet?.address || 'None'}</p>
            <p>Loading: {String(loading)}</p>
          </div>
        )}
      </div>
    </div>
  )
}