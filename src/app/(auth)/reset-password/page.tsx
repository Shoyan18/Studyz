'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Missing reset token. Please request a new password reset link.');
      return;
    }

    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setIsSuccess(true);
      // Automatically navigate to login with success indicator after 2 seconds
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 2000);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-charcoal-900 dark:text-white mb-2">
          Invalid Reset Link
        </h2>
        <p className="text-xs text-charcoal-500 dark:text-gray-400 mb-6 leading-relaxed">
          This password reset link is invalid or incomplete. Please request a new link to reset your password.
        </p>
        <Link
          href="/forgot-password"
          className="w-full inline-flex items-center justify-center gap-1.5 h-11 text-xs font-bold text-white btn-coral rounded-2xl transition-all shadow-coral-glow"
        >
          <span>Request New Reset Link</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-4 animate-in fade-in duration-300">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-charcoal-900 dark:text-white mb-2">
          Password Reset Complete
        </h2>
        <p className="text-xs text-charcoal-600 dark:text-gray-300 mb-6 leading-relaxed">
          Your password has been reset successfully. Redirecting you to sign in...
        </p>
        <Link
          href="/login?reset=success"
          className="w-full inline-flex items-center justify-center gap-1.5 h-11 text-xs font-bold text-white btn-coral rounded-2xl transition-all shadow-coral-glow"
        >
          <span>Continue to Log In</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-charcoal-900 dark:text-white mb-1.5">
          Reset your password
        </h2>
        <p className="text-xs text-charcoal-500 dark:text-gray-400 leading-relaxed font-medium">
          Choose a strong password with at least 6 characters.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-300 text-xs rounded-2xl font-semibold flex items-center gap-2.5 animate-in fade-in duration-200"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="new-password"
          label="New Password"
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

        <Input
          id="confirm-password"
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="text-charcoal-400 hover:text-charcoal-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-400/30"
            >
              {showConfirmPassword ? (
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
          <span>Reset Password</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      <div className="mt-7 pt-5 border-t border-[#F3ECE7] dark:border-[#262832] text-center text-xs text-charcoal-500 dark:text-gray-400 font-medium">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-bold text-coral-600 dark:text-coral-400 hover:text-coral-700 dark:hover:text-coral-300 hover:underline transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to login</span>
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-coral-500/20 selection:text-coral-500">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[480px] h-96 sm:h-[480px] bg-gradient-to-tr from-coral-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-[420px] bg-white dark:bg-[#16171d] border border-[#F0E8E2] dark:border-[#272932] rounded-3xl p-7 sm:p-9 shadow-xl shadow-black/[0.03] dark:shadow-2xl dark:shadow-black/50 transition-all">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-coral-500 to-coral-400 flex items-center justify-center shadow-lg shadow-coral-500/25 mb-3.5 transition-transform hover:scale-105 duration-200">
            <Sparkles className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white tracking-tight font-sans">
            STUDYZ
          </h1>
          <p className="text-[11px] font-extrabold text-coral-500 uppercase tracking-[0.22em] mt-1.5">
            Learn. Focus. Grow.
          </p>
        </div>

        <Suspense fallback={
          <div className="w-full h-64 bg-white dark:bg-[#16171d] rounded-3xl animate-pulse" />
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
