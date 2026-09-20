'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GoogleButton } from '@/components/ui/GoogleButton';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get('error');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const displayError = () => {
    if (error) return error;
    if (oauthError === 'google_not_configured') {
      return 'Google Sign-In is not configured yet. Please use email and password or configure GOOGLE_CLIENT_ID.';
    }
    if (oauthError === 'google_cancelled') {
      return 'Google Sign-In was cancelled. Please try again.';
    }
    if (oauthError) {
      return 'Failed to sign up with Google. Please try again.';
    }
    return '';
  };

  const activeError = displayError();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
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
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
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
    <div className="w-full max-w-[420px] bg-white dark:bg-[#16171d] border border-[#F0E8E2] dark:border-[#272932] rounded-3xl p-7 sm:p-9 shadow-xl shadow-black/[0.03] dark:shadow-2xl dark:shadow-black/50 transition-all">
      {/* Brand Header */}
      <div className="text-center mb-7">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-coral-500 to-coral-400 flex items-center justify-center shadow-lg shadow-coral-500/25 mb-3.5 transition-transform hover:scale-105 duration-200">
          <Sparkles className="w-6 h-6 text-white fill-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white tracking-tight font-sans">
          Join STUDYZ
        </h1>
        <p className="text-[11px] font-extrabold text-coral-500 uppercase tracking-[0.22em] mt-1.5">
          Learn. Focus. Grow.
        </p>
        <p className="text-xs text-charcoal-500 dark:text-gray-400 mt-2 font-medium">
          Start your personalized study journey today.
        </p>
      </div>

      {/* Error Alert */}
      {activeError && (
        <div
          role="alert"
          className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-300 text-xs rounded-2xl font-semibold flex items-center gap-2.5 animate-in fade-in duration-200"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span className="leading-relaxed">{activeError}</span>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          id="signup-name"
          label="Your Name"
          type="text"
          placeholder="e.g. Shoyan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="w-4 h-4" />}
          autoComplete="name"
          required
        />

        <Input
          id="signup-email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          required
        />

        <Input
          id="signup-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-charcoal-400 hover:text-charcoal-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-400/30"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 h-12 text-sm font-bold tracking-wide rounded-2xl shadow-coral-glow hover:shadow-lg transition-all"
          isLoading={isLoading}
        >
          <span>Create Account</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 border-t border-[#F0E8E2] dark:border-[#272932]" />
        <span className="text-[10px] font-bold text-charcoal-400 dark:text-gray-500 uppercase tracking-widest">
          Or continue with
        </span>
        <div className="flex-1 border-t border-[#F0E8E2] dark:border-[#272932]" />
      </div>

      {/* Google Button */}
      <GoogleButton label="Continue with Google" />

      {/* Sign In Link */}
      <div className="mt-6 pt-5 border-t border-[#F3ECE7] dark:border-[#262832] text-center text-xs text-charcoal-500 dark:text-gray-400 font-medium">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-bold text-coral-600 dark:text-coral-400 hover:text-coral-700 dark:hover:text-coral-300 hover:underline transition-colors ml-0.5"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-coral-500/20 selection:text-coral-500">
      {/* Ambient background decor */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[480px] h-96 sm:h-[480px] bg-gradient-to-tr from-coral-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <Suspense fallback={
        <div className="w-full max-w-[420px] h-96 bg-white dark:bg-[#16171d] rounded-3xl animate-pulse" />
      }>
        <SignupForm />
      </Suspense>
    </div>
  );
}

