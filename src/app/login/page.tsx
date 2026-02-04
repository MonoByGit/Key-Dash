'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Ongeldige inloggegevens');
      }
    } catch (err) {
      setError('Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-2 bg-[#1c1c1e] rounded-xl">
            <KeyRound className="w-6 h-6 text-[#98989d]" />
          </div>
          <h1 className="text-[20px] font-medium text-[#f5f5f7]">Key Dash</h1>
        </div>

        {/* Login Form */}
        <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl p-5">
          <h2 className="text-[13px] font-medium text-[#f5f5f7] mb-4">Inloggen</h2>

          {error && (
            <div className="mb-4 p-3 bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-lg text-[#ff453a] text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1a25] border border-[#2c2c2e] rounded-lg py-2 px-3 text-[#f5f5f7] placeholder-[#636366] text-sm focus:outline-none focus:border-[#3a3a3c] transition-colors"
                placeholder="jouw@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">
                Wachtwoord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a25] border border-[#2c2c2e] rounded-lg py-2 px-3 text-[#f5f5f7] placeholder-[#636366] text-sm focus:outline-none focus:border-[#3a3a3c] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3a3a3c] hover:bg-[#555557] text-[#f5f5f7] text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Inloggen
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[#636366] text-xs mt-4">
          AI API Dashboard
        </p>
      </div>
    </div>
  );
}
