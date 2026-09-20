'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send password reset link.');
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

        {isSubmitted ? (
          <div className="text-center py-2 animate-in fade-in duration-300">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white mb-2">
              Check your inbox
            </h2>
            <p className="text-xs text-charcoal-600 dark:text-gray-300 mb-6 leading-relaxed">
              If an account exists for <span className="font-semibold text-charcoal-900 dark:text-white">{email}</span>, we&apos;ve sent instructions to reset your password.
            </p>
            <p className="text-[11px] text-charcoal-400 dark:text-gray-500 mb-6">
              Didn&apos;t receive an email? Check your spam folder or wait a couple of minutes before requesting again.
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-1.5 h-11 text-xs font-bold text-charcoal-700 dark:text-gray-200 bg-[#F7F4F1] dark:bg-[#20222a] hover:bg-[#EFECE8] dark:hover:bg-[#282a34] rounded-2xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to login</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="text-xs font-semibold text-coral-600 dark:text-coral-400 hover:underline transition-colors"
              >
                Try a different email
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-charcoal-900 dark:text-white mb-1.5">
                Forgot your password?
              </h2>
              <p className="text-xs text-charcoal-500 dark:text-gray-400 leading-relaxed font-medium">
                Enter your email and we&apos;ll send you a link to reset your password.
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
                id="reset-email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                autoComplete="email"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 h-12 text-sm font-bold tracking-wide rounded-2xl shadow-coral-glow hover:shadow-lg transition-all"
                isLoading={isLoading}
              >
                <span>Send reset link</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <div className="mt-7 pt-5 border-t border-[#F3ECE7] dark:border-[#262832] text-center text-xs text-charcoal-500 dark:text-gray-400 font-medium">
              Remember your password?{' '}
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-bold text-coral-600 dark:text-coral-400 hover:text-coral-700 dark:hover:text-coral-300 hover:underline transition-colors ml-0.5"
              >
                <span>Back to login</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
