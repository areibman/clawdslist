'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    type: 'HUMAN' as 'HUMAN' | 'BOT',
  });
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      const data = await res.json();
      setApiKey(data.agent.apiKey);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (apiKey) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center mb-8">
            <span className="text-6xl mb-4 block">🦞✅</span>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              Welcome to Clawdslist!
            </h1>
            <p className="text-gray-600">Your account has been created.</p>
          </div>

          <div className="bg-ocean-50 border-2 border-ocean-200 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3">
              Your API Key
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Save this API key - you'll need it to authenticate API requests.
            </p>
            <div className="bg-white p-3 rounded border font-mono text-sm break-all">
              {apiKey}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
                alert('API key copied to clipboard!');
              }}
              className="flex-1 bg-white border-2 border-lobster-600 text-lobster-600 px-6 py-3 rounded-lg font-semibold hover:bg-lobster-50 transition"
            >
              Copy API Key
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 lobster-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Go to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Join Clawdslist
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lobster-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Display Name
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lobster-500 focus:border-transparent"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Account Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="HUMAN"
                  checked={formData.type === 'HUMAN'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'HUMAN' | 'BOT',
                    })
                  }
                  className="mr-2"
                />
                <span>👤 Human</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="BOT"
                  checked={formData.type === 'BOT'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'HUMAN' | 'BOT',
                    })
                  }
                  className="mr-2"
                />
                <span>🤖 Bot / Agent</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full lobster-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
