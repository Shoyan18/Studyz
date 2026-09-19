'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { StudyzSelect } from '@/components/ui/StudyzSelect';
import {
  Sparkles,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Cpu,
  Zap,
} from 'lucide-react';

interface AIConfigData {
  isConfigured: boolean;
  maskedKey: string;
  source: 'DATABASE' | 'ENV' | 'NONE';
  provider: string;
  model: string;
  availableModels: Array<{ id: string; name: string; provider: string }>;
}

export const AiConfigSection: React.FC = () => {
  const [config, setConfig] = useState<AIConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isReplacingKey, setIsReplacingKey] = useState(false);
  const [showKeyText, setShowKeyText] = useState(false);

  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    latencyMs?: number;
  }>({ status: 'idle', message: '' });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch admin AI config
  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/ai/admin/config');
      if (res.ok) {
        const data: AIConfigData = await res.json();
        setConfig(data);
        setSelectedProvider(data.provider || 'gemini');
        setSelectedModel(data.model || 'gemini-2.5-flash');
      } else {
        // Not authorized or failed
        setConfig(null);
      }
    } catch (err) {
      console.error('Failed to load AI config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Save updated config
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    setErrorMessage('');
    setTestResult({ status: 'idle', message: '' });

    try {
      const res = await fetch('/api/ai/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          apiKey: isReplacingKey && apiKeyInput.trim() ? apiKeyInput.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save AI configuration');
      }

      setSaveSuccessMsg('AI configuration saved successfully!');
      setApiKeyInput('');
      setIsReplacingKey(false);
      await fetchConfig();
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong saving AI config.');
    } finally {
      setIsSaving(false);
    }
  };

  // Test provider connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult({ status: 'idle', message: '' });
    setErrorMessage('');

    try {
      const res = await fetch('/api/ai/admin/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          apiKey: isReplacingKey && apiKeyInput.trim() ? apiKeyInput.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          status: 'success',
          message: data.message || 'Connection successful!',
          latencyMs: data.latencyMs,
        });
      } else {
        setTestResult({
          status: 'error',
          message: data.message || 'Unable to connect to AI provider.',
          latencyMs: data.latencyMs,
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: 'Network error occurred while testing connection.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-[#F3ECE7] rounded-4xl p-6 sm:p-8 shadow-soft animate-pulse flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-coral-500 animate-spin mr-2" />
        <span className="text-xs font-bold text-charcoal-400">Loading AI configuration...</span>
      </div>
    );
  }

  // If user is not authorized or config is null, render nothing
  if (!config) return null;

  const isConnected = config.isConfigured && testResult.status !== 'error';

  return (
    <div className="bg-white border border-[#F3ECE7] rounded-4xl p-6 sm:p-8 shadow-soft space-y-6">
      {/* Header with Admin Badge & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F5EBE4]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-coral-100 to-lavender-100 flex items-center justify-center text-coral-600 shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-charcoal-900">AI Configuration</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-lavender-50 border border-lavender-200 text-lavender-700 text-[10px] font-extrabold uppercase tracking-wider">
                <Shield className="w-3 h-3 text-lavender-600" />
                Admin Only
              </span>
            </div>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Manage server-side AI provider credentials and active models for STUDYZ AI.
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2">
          {config.isConfigured ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Not Configured
            </span>
          )}
        </div>
      </div>

      {/* Notifications */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-2xl font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Test Connection Banner */}
      {testResult.status === 'success' && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-start gap-2.5 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">🟢 Gemini connection successful</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Verified with Google Gemini API {testResult.latencyMs ? `(Latency: ${testResult.latencyMs}ms)` : ''} using model <code className="bg-emerald-100/70 px-1 rounded font-mono">{selectedModel}</code>.
            </p>
          </div>
        </div>
      )}

      {testResult.status === 'error' && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5 shadow-2xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">🔴 Unable to connect to Gemini</p>
            <p className="text-[11px] text-rose-700 mt-0.5">{testResult.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Provider & Model Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StudyzSelect
            label="AI Provider"
            value={selectedProvider}
            onChange={(val) => setSelectedProvider(String(val))}
            options={[
              {
                value: 'gemini',
                label: 'Google Gemini',
                secondaryText: 'Primary Provider',
              },
            ]}
          />

          <StudyzSelect
            label="Active AI Model"
            value={selectedModel}
            onChange={(val) => setSelectedModel(String(val))}
            options={
              config.availableModels.map((m) => ({
                value: m.id,
                label: m.name,
                secondaryText: m.id === 'gemini-2.5-flash' ? 'Recommended' : undefined,
              })) || [
                { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast & Recommended)' },
                { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash (High Intelligence)' },
              ]
            }
          />
        </div>

        {/* API Key Configuration Container */}
        <div className="p-4 rounded-3xl bg-[#FCFAF8] border border-[#F3ECE7] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-coral-500" />
              Gemini API Key
            </label>

            {config.isConfigured && !isReplacingKey && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F3ECE7] text-charcoal-600">
                Source: {config.source === 'ENV' ? 'Environment (.env)' : 'Server Setting'}
              </span>
            )}
          </div>

          {/* Masked Key Display vs Edit Input */}
          {config.isConfigured && !isReplacingKey ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-[#EFE7E1]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs text-charcoal-700 tracking-wider">
                  {config.maskedKey || '••••••••••••••••••••••••'}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Configured
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsReplacingKey(true);
                  setApiKeyInput('');
                }}
                className="text-xs font-bold text-coral-600 hover:text-coral-700 transition-colors shrink-0 px-2 py-1 hover:bg-[#FFF5F2] rounded-xl text-left"
              >
                [ Replace Key ]
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showKeyText ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter your Gemini API key (AIza...)"
                  className="w-full px-4 py-2.5 pr-10 text-xs font-mono rounded-2xl border border-[#EFE7E1] focus:border-coral-400 focus:ring-2 focus:ring-coral-100 outline-none bg-white text-charcoal-900"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKeyText(!showKeyText)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                  title={showKeyText ? 'Hide key' : 'Show key while typing'}
                >
                  {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {config.isConfigured && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplacingKey(false);
                      setApiKeyInput('');
                    }}
                    className="text-[11px] text-charcoal-500 hover:text-charcoal-800"
                  >
                    Cancel replace
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Security Notice & Google Studio Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-charcoal-500">
            <p className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-lavender-500" />
              Keys remain encrypted server-side and are never exposed to clients.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-coral-600 hover:text-coral-700 font-bold hover:underline"
            >
              Get Gemini API Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Buttons Bar: Test Connection & Save */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || (!config.isConfigured && !apiKeyInput.trim())}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FCFAF8] hover:bg-[#FFF5F2] border border-[#EFE7E1] hover:border-coral-200 text-charcoal-700 hover:text-coral-600 rounded-2xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isTesting ? (
              <Loader2 className="w-4 h-4 animate-spin text-coral-500" />
            ) : (
              <Zap className="w-4 h-4 text-coral-500" />
            )}
            <span>{isTesting ? 'Testing Connection...' : 'Test Connection'}</span>
          </button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            disabled={isSaving}
            className="w-full sm:w-auto text-xs font-bold"
          >
            Save AI Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
