'use client'

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugEmailPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSignUp = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log('Testing signup with:', email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      console.log('Signup result:', { data, error })

      setResult({
        type: 'signup',
        data,
        error: error?.message || null,
        user: data.user,
        session: data.session,
        emailConfirmed: data.user?.email_confirmed_at,
        userConfirmed: data.user?.confirmed_at
      })
    } catch (err: any) {
      console.error('Signup error:', err)
      setResult({
        type: 'signup',
        error: err.message,
        data: null
      })
    } finally {
      setLoading(false)
    }
  }

  const testResend = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log('Testing resend for:', email)

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      console.log('Resend result:', { error })

      setResult({
        type: 'resend',
        error: error?.message || null,
        success: !error
      })
    } catch (err: any) {
      console.error('Resend error:', err)
      setResult({
        type: 'resend',
        error: err.message,
        success: false
      })
    } finally {
      setLoading(false)
    }
  }

  const testAuthSettings = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Check current session
      const { data: sessionData } = await supabase.auth.getSession()

      // Get auth settings (this might not work from client but let's try)
      const authSettings = {
        url: supabase.supabaseUrl,
        hasAnonKey: !!supabase.supabaseKey,
        currentSession: sessionData.session,
        currentUser: sessionData.session?.user
      }

      console.log('Auth settings:', authSettings)

      setResult({
        type: 'settings',
        settings: authSettings
      })
    } catch (err: any) {
      console.error('Settings error:', err)
      setResult({
        type: 'settings',
        error: err.message
      })
    } finally {
      setLoading(false)
    }
  }

  const testWithDifferentEmail = async () => {
    const testEmails = [
      'test1@gmail.com',
      'test2@yahoo.com',
      'test3@outlook.com',
      'test4@tempmail.org'
    ]

    setLoading(true)
    setResult(null)

    const results = []

    for (const testEmail of testEmails) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: testEmail,
          password: 'TestPassword123!',
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })

        results.push({
          email: testEmail,
          success: !error,
          error: error?.message,
          confirmationSent: data.user?.confirmation_sent_at
        })
      } catch (err: any) {
        results.push({
          email: testEmail,
          success: false,
          error: err.message,
          confirmationSent: null
        })
      }
    }

    setResult({
      type: 'multiple-email-test',
      results,
      note: 'This tests if the issue is email-provider specific'
    })

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8">Email Verification Debug</h1>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Test Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="test@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="password123"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={testSignUp}
              disabled={loading || !email || !password}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Signup'}
            </button>

            <button
              onClick={testResend}
              disabled={loading || !email}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Resend'}
            </button>

            <button
              onClick={testAuthSettings}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Check Settings'}
            </button>

            <button
              onClick={testWithDifferentEmail}
              disabled={loading}
              className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Multiple Providers'}
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Result ({result.type})</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Instructions:</h3>
          <ol className="text-yellow-700 text-sm space-y-1">
            <li>1. Enter a test email and password</li>
            <li>2. Click "Test Signup" to see what happens during registration</li>
            <li>3. Check browser console and network tab for more details</li>
            <li>4. Try "Test Resend" to see if resending works</li>
            <li>5. Check your email inbox (including spam folder)</li>
          </ol>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">🎯 Key Finding:</h3>
          <div className="text-blue-700 text-sm space-y-2">
            <p><strong>✅ Supabase IS sending emails!</strong> Your `confirmation_sent_at` timestamp proves this.</p>
            <p><strong>🚨 Issue:</strong> Emails are not being delivered to your inbox.</p>
            <p><strong>📧 Check:</strong></p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Gmail spam/junk folder</li>
              <li>Gmail promotions tab</li>
              <li>Email filters/rules blocking Supabase</li>
              <li>Try a different email provider (Yahoo, Outlook)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
