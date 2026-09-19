'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user?.onboarded === false) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Demo login failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to login as demo user.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Background soft ambient decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFEAE3] dark:bg-coral-950/30 rounded-full blur-3xl opacity-40 dark:opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F0EDFF] dark:bg-indigo-950/30 rounded-full blur-3xl opacity-40 dark:opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-8 sm:p-10 shadow-soft-lg">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-coral-500 to-coral-400 flex items-center justify-center shadow-coral-glow mb-4">
            <Sparkles className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white tracking-tight font-sans">
            STUDYZ
          </h1>
          <p className="text-xs font-bold text-coral-500 uppercase tracking-widest mt-1">
            Learn. Focus. Grow.
          </p>
          <p className="text-xs text-charcoal-500 dark:text-gray-400 mt-2 font-medium">
            Welcome back! Sign in to resume your study streak.
          </p>
        </div>

        {/* Demo Login Quick CTA */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#FFF5F2] to-[#FFF0EB] dark:from-coral-950/40 dark:to-coral-900/30 border border-[#FFD6CB] dark:border-coral-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-coral-500" />
              <span className="text-xs font-extrabold text-charcoal-900 dark:text-white">Explore Instant Demo</span>
            </div>
            <span className="text-[10px] font-bold text-coral-500 uppercase tracking-wider bg-white dark:bg-[#1a1b20] px-2 py-0.5 rounded-lg border border-[#FFD6CB] dark:border-coral-800/50">
              1-Click
            </span>
          </div>
          <p className="text-[11px] text-charcoal-500 dark:text-gray-300 mb-3">
            Jump in immediately with pre-loaded subjects, JEE chapters, study analytics, and 12-day streak.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-full"
            onClick={handleDemoLogin}
            isLoading={isDemoLoading}
          >
            Enter as Shoyan (Demo Student)
          </Button>
        </div>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 border-t border-[#F3ECE7] dark:border-[#2e313a]" />
          <span className="text-xs font-bold text-charcoal-400 dark:text-gray-500 uppercase tracking-wider">or sign in</span>
          <div className="flex-1 border-t border-[#F3ECE7] dark:border-[#2e313a]" />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 text-xs rounded-xl font-semibold">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            <span>Log In</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Signup Redirect */}
        <div className="mt-6 text-center text-xs text-charcoal-500 dark:text-gray-400 font-medium">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-bold text-coral-600 dark:text-coral-400 hover:text-coral-700 dark:hover:text-coral-300 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
