'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      router.push('/onboarding');
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Something went wrong during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFEAE3] dark:bg-coral-950/30 rounded-full blur-3xl opacity-40 dark:opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F0EDFF] dark:bg-indigo-950/30 rounded-full blur-3xl opacity-40 dark:opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-8 sm:p-10 shadow-soft-lg">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-coral-500 to-coral-400 flex items-center justify-center shadow-coral-glow mb-4">
            <Sparkles className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white tracking-tight font-sans">
            Join STUDYZ
          </h1>
          <p className="text-xs font-bold text-coral-500 uppercase tracking-widest mt-1">
            Learn. Focus. Grow.
          </p>
          <p className="text-xs text-charcoal-500 dark:text-gray-400 mt-2 font-medium">
            Start your personalized study journey today.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 text-xs rounded-xl font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Your Name"
            type="text"
            placeholder="e.g. Shoyan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="w-4 h-4" />}
            required
          />

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
            placeholder="Min. 6 characters"
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
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-charcoal-500 dark:text-gray-400 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-coral-600 dark:text-coral-400 hover:text-coral-700 dark:hover:text-coral-300 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
