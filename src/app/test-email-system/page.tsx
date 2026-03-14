'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

export default function TestEmailSystem() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const addResult = (result: any) => {
    setResults(prev => [{ ...result, timestamp: new Date().toISOString() }, ...prev])
  }

  const testEmail = async (action: string) => {
    if (!email.trim()) {
      addResult({
        action,
        success: false,
        error: 'Email is required'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          email: email.trim()
        })
      })

      const result = await response.json()
      addResult(result)
    } catch (error) {
      addResult({
        action,
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      })
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  const getStatusBadge = (result: any) => {
    if (result.success) {
      return <Badge variant="default" className="bg-green-100 text-green-800">SUCCESS</Badge>
    } else {
      return <Badge variant="destructive">FAILED</Badge>
    }
  }

  const getServiceBadge = (service: string) => {
    switch (service) {
      case 'resend':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Resend</Badge>
      case 'supabase-auth':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Supabase Auth</Badge>
      case 'supabase-dev':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">Supabase Dev</Badge>
      case 'resend-fallback':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Resend Fallback</Badge>
      case 'security-response':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Security Response</Badge>
      default:
        return <Badge variant="outline">{service}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Unified Email System Testing</h1>
          <p className="text-gray-600 mb-4">
            Test the consolidated email service with retry logic, fallbacks, and monitoring.
            All email implementations have been unified to eliminate conflicts and improve reliability.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="bg-green-50 text-green-700">✅ Retry Logic</Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">🔄 Fallback Support</Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">📊 Enhanced Monitoring</Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700">🔧 Unified Service</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Check <a href="http://localhost:54324" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mailpit (localhost:54324)</a> for captured emails in development.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Email Tests</CardTitle>
              <CardDescription>
                Test different email scenarios with the new unified service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => testEmail('resend-verification')}
                  disabled={loading}
                  className="w-full"
                  variant="default"
                >
                  {loading ? 'Testing...' : '📧 Test Resend Verification'}
                </Button>

                <Button
                  onClick={() => testEmail('forgot-password')}
                  disabled={loading}
                  className="w-full"
                  variant="secondary"
                >
                  {loading ? 'Testing...' : '🔒 Test Forgot Password'}
                </Button>

                <Button
                  onClick={() => testEmail('signup')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? 'Testing...' : '✨ Test Signup Confirmation'}
                </Button>

                <Button
                  onClick={() => testEmail('custom-email')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? 'Testing...' : '🎨 Test Custom Email'}
                </Button>
              </div>

              <Button
                onClick={clearResults}
                variant="ghost"
                className="w-full"
              >
                🗑️ Clear Results
              </Button>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Results with retry attempts, service used, and debug information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tests run yet</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        result.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {result.action}
                          </span>
                          {result.service && getServiceBadge(result.service)}
                        </div>
                        {getStatusBadge(result)}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {result.message || result.error}
                      </p>

                      {/* Show retry attempts */}
                      {result.attempts && (
                        <p className="text-xs text-gray-500 mb-2">
                          📊 Completed in {result.attempts} attempt{result.attempts > 1 ? 's' : ''}
                        </p>
                      )}

                      {/* Show instructions */}
                      {result.instructions && (
                        <p className="text-xs text-blue-600 mb-2">
                          💡 {result.instructions}
                        </p>
                      )}

                      {result.debug && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                            🔍 Debug Info
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.debug, null, 2)}
                          </pre>
                        </details>
                      )}

                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions and Improvements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>How to Test</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Enter any email address in the input field above</li>
                <li>Click one of the test buttons to trigger that email type</li>
                <li>Check the results panel for success/failure status and retry attempts</li>
                <li>View captured emails at <a href="http://localhost:54324" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mailpit (localhost:54324)</a> in development</li>
                <li>Notice the service badges showing which email provider was used</li>
                <li>Check debug information for technical details and troubleshooting</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Improvements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">NEW</Badge>
                  <span>Retry logic with exponential backoff (up to 3 attempts)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">NEW</Badge>
                  <span>Resend fallback for password resets in production</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">NEW</Badge>
                  <span>Enhanced error handling and user feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">NEW</Badge>
                  <span>Rate limiting detection and appropriate messaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">FIXED</Badge>
                  <span>Consolidated multiple conflicting email services</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700">FIXED</Badge>
                  <span>Eliminated "extremely unreliable" forgot password emails</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
