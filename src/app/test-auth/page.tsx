'use client'

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAuthPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testDirectAuth = async () => {
    setLoading(true)
    setResult('Testing...')

    try {
      // Test 1: Check if supabase client is working
      setResult(prev => prev + '\n1. Testing Supabase client initialization...')
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')

      // Test 2: Try a simple health check
      setResult(prev => prev + '\n2. Testing connection...')
      const { data: healthCheck, error: healthError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)

      if (healthError) {
        setResult(prev => prev + `\n   Health check error: ${healthError.message}`)
      } else {
        setResult(prev => prev + '\n   ✅ Supabase connection working')
      }

      // Test 3: Try to create a test user first
      setResult(prev => prev + '\n3. Creating test user...')
      const testEmail = 'test@example.com'
      const testPassword = 'password123'

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })

      if (signUpError) {
        setResult(prev => prev + `\n   Sign up error: ${signUpError.message}`)
      } else {
        setResult(prev => prev + `\n   ✅ Test user created or already exists: ${signUpData.user?.id}`)
      }

      // Test 4: Try login with the test user
      setResult(prev => prev + '\n4. Testing login...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })

      if (signInError) {
        setResult(prev => prev + `\n   ❌ Login error: ${signInError.message}`)
        setResult(prev => prev + `\n   Error details: ${JSON.stringify(signInError, null, 2)}`)
      } else {
        setResult(prev => prev + `\n   ✅ Login successful: ${signInData.user?.email}`)
      }

    } catch (error) {
      setResult(prev => prev + `\n❌ Unexpected error: ${error}`)
      console.error('Test error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Auth Debugging</h1>

        <button
        onClick={testDirectAuth}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
        {loading ? 'Testing...' : 'Run Auth Test'}
        </button>

      <pre className="mt-4 p-4 bg-gray-100 rounded text-sm whitespace-pre-wrap">
        {result || 'Click "Run Auth Test" to start debugging'}
      </pre>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold">Current Environment:</h3>
        <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
      </div>
    </div>
  )
}
