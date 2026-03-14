'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import { useState } from 'react';
import { auth } from '@/lib/auth';

export default function DebugRegistrationPage() {
  const [email, setEmail] = useState('test@example.com');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { timestamp, message, data }]);
  };

  const testRegistration = async () => {
    setLoading(true);
    setResults([]);

    try {
      addResult('Starting registration test...');

      const userData = {
        email,
        password: 'password123',
        full_name: 'Test User',
        role: 'buyer' as const,
        country: 'United States',
        buyer_persona_type: 'individual_investor'
      };

      addResult('Registration data prepared', userData);

      const result = await auth.signUp(userData);

      addResult('Registration completed', result);

      // Wait a moment then try to fetch profile
      setTimeout(async () => {
        addResult('Attempting to fetch profile...');
        const profile = await auth.getCurrentUserProfile();
        addResult('Profile fetch result', profile);
      }, 1000);

    } catch (error) {
      addResult('Registration failed', error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Debug Registration</h1>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Test Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="test@example.com"
          />
        </div>

        <div className="space-x-4">
          <button
            onClick={testRegistration}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Registration'}
          </button>

          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Clear Results
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Debug Results:</h2>
        <div className="bg-gray-100 p-4 rounded-lg space-y-2 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-gray-500">No results yet. Click "Test Registration" to begin.</p>
          ) : (
            results.map((result, index) => (
              <div key={index} className="border-b pb-2">
                <div className="text-sm text-gray-600">{result.timestamp}</div>
                <div className="font-medium">{result.message}</div>
                {result.data && (
                  <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
