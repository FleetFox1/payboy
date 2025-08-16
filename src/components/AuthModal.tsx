'use client'
import { useState } from 'react'
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
  const { login, logout, authenticated, getAccessToken, user } = usePrivy()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  // Handle Privy authentication (supports both email and wallet)
  async function handlePrivyAuth() {
    console.log('🔍 AuthModal: Starting Privy login...')
    console.log('🔍 AuthModal: Currently authenticated?', authenticated)
    console.log('🔍 AuthModal: Current user:', user)
    
    setLoading(true)
    setError('')

    try {
      console.log('📱 AuthModal: Calling Privy login()...')
      
      // Trigger Privy login modal (user can choose email or wallet)
      const loginResult = await login()
      console.log('✅ AuthModal: Privy login result:', loginResult)
      
      // Wait a bit for Privy to update state
      console.log('⏳ AuthModal: Waiting for Privy state to update...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('👤 AuthModal: User after delay:', user)
      console.log('🔐 AuthModal: Authenticated after delay?', authenticated)
      
      // Get access token after login with retry logic
      console.log('🔑 AuthModal: Getting access token with retry logic...')
      let accessToken = null
      let retries = 0
      const maxRetries = 5
      
      while (!accessToken && retries < maxRetries) {
        try {
          console.log(`🔄 AuthModal: Attempt ${retries + 1}/${maxRetries} to get access token...`)
          accessToken = await getAccessToken()
          if (accessToken) {
            console.log('🎟️ AuthModal: ✅ Access token received on attempt:', retries + 1)
            console.log('🎟️ AuthModal: Token length:', accessToken.length)
            break
          } else {
            console.log('⚠️ AuthModal: No token on attempt:', retries + 1)
          }
        } catch (tokenError) {
          console.log('❌ AuthModal: Token error on attempt', retries + 1, ':', tokenError)
        }
        retries++
        if (retries < maxRetries) {
          console.log('⏳ AuthModal: Waiting 500ms before retry...')
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      console.log('🎟️ AuthModal: Final access token status:', accessToken ? 'SUCCESS' : 'FAILED')
      
      if (accessToken) {
        console.log('📡 AuthModal: Calling backend /api/auth...')
        console.log('📤 AuthModal: Sending access token to backend (length: ' + accessToken.length + ')')
        
        // Call your backend auth endpoint
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
        console.log('📨 AuthModal: Backend response headers:', Object.fromEntries(response.headers.entries()))
        
        let data
        try {
          data = await response.json()
          console.log('📋 AuthModal: Backend response data:', data)
        } catch (parseError) {
          console.error('❌ AuthModal: Failed to parse backend response:', parseError)
          setError('Invalid response from server')
          return
        }

        if (data.success && data.token) {
          // Store the JWT token
          localStorage.setItem('authToken', data.token)
          localStorage.setItem('userData', JSON.stringify(data.user))
          
          console.log('✅ AuthModal: Login successful!')
          console.log('👤 AuthModal: User data:', data.user)
          console.log('💾 AuthModal: JWT token stored in localStorage')
          console.log('🏦 AuthModal: User wallet address:', data.user.walletAddress || 'Not found')
          console.log('🔗 AuthModal: User account type:', data.user.privyAccountType || 'Not specified')
          console.log('💰 AuthModal: Embedded wallet?', data.user.embeddedWallet ? 'Yes' : 'No')
          
          onClose()
          
          // Better redirect logic based on user type and setup status
          if (data.user.userType === 'seller') {
            console.log('🎯 AuthModal: Existing seller - redirecting to seller dashboard')
            router.push('/seller/dashboard')
          } else if (data.user.userType === 'merchant') {
            console.log('🎯 AuthModal: Existing merchant - redirecting to merchant dashboard')
            router.push('/merchant/dashboard')
          } else if (data.user.userType === 'buyer' && data.user.onboardingCompleted) {
            // Existing buyer who completed onboarding
            console.log('🎯 AuthModal: Existing buyer with completed onboarding - redirecting to dashboard')
            router.push('/dashboard')
          } else {
            // New user or hasn't completed role selection
            console.log('🎯 AuthModal: New user or incomplete onboarding - redirecting to role selection')
            console.log('🎯 AuthModal: User type:', data.user.userType, 'Onboarding completed:', data.user.onboardingCompleted)
            router.push('/role')
          }
        } else {
          console.error('❌ AuthModal: Backend auth failed')
          console.error('❌ AuthModal: Backend error:', data.error)
          console.error('❌ AuthModal: Backend success:', data.success)
          console.error('❌ AuthModal: Backend token:', data.token ? 'Present' : 'Missing')
          setError(data.error || 'Authentication failed')
        }
      } else {
        console.error('❌ AuthModal: No access token received from Privy after', maxRetries, 'attempts')
        console.error('❌ AuthModal: User state:', user)
        console.error('❌ AuthModal: Authenticated state:', authenticated)
        setError('Failed to get access token from Privy after multiple attempts. Please try again.')
      }
    } catch (error) {
      console.error('💥 AuthModal: Login error:', error)
      if (error instanceof Error) {
        console.error('💥 AuthModal: Error stack:', error.stack)
      }
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
      console.log('🏁 AuthModal: Login process finished')
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
          onClick={() => {
            console.log('🖱️ AuthModal: Login button clicked!')
            console.log('🖱️ AuthModal: Current authenticated state:', authenticated)
            console.log('🖱️ AuthModal: Current user:', user)
            handlePrivyAuth()
          }}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition mb-4"
        >
          {loading ? 'Connecting...' : authenticated ? '🔄 Continue with Account' : '🚀 Sign In / Sign Up'}
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
            <p>Authenticated: {String(authenticated)}</p>
            <p>User ID: {user?.id || 'None'}</p>
            <p>Email: {user?.email?.address || 'None'}</p>
            <p>Wallet: {user?.wallet?.address || 'None'}</p>
          </div>
        )}
      </div>
    </div>
  )
}