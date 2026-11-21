'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Key,
  Database,
  Users,
  Building,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { CommitOSStore, AppSettings } from '@/lib/store';
import { DEMO_MEMBERS } from '@/lib/demo-data';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => CommitOSStore.getSettings());
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setSettings(CommitOSStore.getSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    CommitOSStore.saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestGeminiKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ask-commit-os', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Ping test',
          apiKey: settings.geminiApiKey,
        }),
      });

      const data = await res.json();
      if (data.isLiveAI) {
        setTestResult({
          success: true,
          message: 'Gemini API connection successful! Live LLM reasoning enabled.',
        });
      } else {
        setTestResult({
          success: false,
          message: settings.geminiApiKey
            ? 'API key was not accepted by Google Gemini. Check key validity.'
            : 'No Gemini API key provided. CommitOS is currently in Offline Demo Memory Mode.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Network error communicating with Gemini endpoint.',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleResetDemo = () => {
    if (confirm('Reset all SVIT Podcast Club records to the clean hackathon demo state?')) {
      CommitOSStore.resetToDemo();
      alert('SVIT Podcast Club demo records restored successfully.');
      window.location.reload();
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#1f1f27] pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings & System Configuration</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure AI reasoning models, API credentials, organization profiles, and team access
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: AI Reasoning & API Keys */}
        <div className="p-6 rounded-2xl bg-[#121217] border border-[#23232f] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1f1f28]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Engine & API Credentials</h3>
                <p className="text-xs text-zinc-400">
                  Google Gemini integration for Meeting Intelligence, Conflict Detection & RAG
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181822] border border-[#262635] text-[11px] font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  settings.geminiApiKey ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="text-zinc-300">
                {settings.geminiApiKey ? 'Live AI Key Loaded' : 'Demo Mode (Simulation)'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Gemini API Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Google Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  <span>Get API Key from Google AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  className="w-full pl-3 pr-20 py-2 rounded-lg bg-[#16161d] border border-[#272736] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="p-1.5 text-zinc-400 hover:text-white"
                  >
                    {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleTestGeminiKey}
                    disabled={isTestingKey}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-white font-medium border border-zinc-700"
                  >
                    {isTestingKey ? 'Testing...' : 'Test'}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                All AI calls are securely proxied on the Next.js server. Keys are never exposed to browser clients.
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Model & Transcription Provider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Gemini LLM Reasoning Model
                </label>
                <select
                  value={settings.geminiModel}
                  onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#16161d] border border-[#272736] text-xs text-white focus:outline-none"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast, Low Latency) - Recommended</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning & Long Context)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Latest Experimental)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Audio Speech-to-Text Engine
                </label>
                <select
                  value={settings.transcriptionProvider}
                  onChange={(e) => setSettings({ ...settings, transcriptionProvider: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#16161d] border border-[#272736] text-xs text-white focus:outline-none"
                >
                  <option value="gemini_audio">Native Gemini 1.5 Audio (Multimodal - Zero Extra Keys)</option>
                  <option value="deepgram">Deepgram Nova-2</option>
                  <option value="assemblyai">AssemblyAI Universal-1</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Organization Profile */}
        <div className="p-6 rounded-2xl bg-[#121217] border border-[#23232f] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1f1f28]">
            <Building className="w-4 h-4 text-white" />
            <div>
              <h3 className="text-sm font-semibold text-white">Organization Profile</h3>
              <p className="text-xs text-zinc-400">Isolated workspace configuration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Organization Name</label>
              <input
                type="text"
                value="SVIT Podcast Club"
                disabled
                className="w-full px-3 py-2 rounded-lg bg-[#16161d] border border-[#272736] text-xs text-zinc-300 disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Identifier Slug</label>
              <input
                type="text"
                value="svit-podcast-club"
                disabled
                className="w-full px-3 py-2 rounded-lg bg-[#16161d] border border-[#272736] text-xs text-zinc-300 disabled:opacity-70 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Team Members */}
        <div className="p-6 rounded-2xl bg-[#121217] border border-[#23232f] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1f1f28]">
            <Users className="w-4 h-4 text-white" />
            <div>
              <h3 className="text-sm font-semibold text-white">Authorized Team Roster</h3>
              <p className="text-xs text-zinc-400">Members with decision ratification privileges</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_MEMBERS.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-lg bg-[#16161d] border border-[#262633] flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">{m.name}</p>
                  <p className="text-[11px] text-zinc-400">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: Supabase Connection (Optional / Hybrid) */}
        <div className="p-6 rounded-2xl bg-[#121217] border border-[#23232f] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1f1f28]">
            <Database className="w-4 h-4 text-white" />
            <div>
              <h3 className="text-sm font-semibold text-white">Supabase Cloud PostgreSQL & pgvector</h3>
              <p className="text-xs text-zinc-400">Optional: Connect to remote Supabase database instance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={settings.supabaseUrl || ''}
                onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#16161d] border border-[#272736] text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={settings.supabaseAnonKey || ''}
                onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#16161d] border border-[#272736] text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
              />
            </div>
          </div>
          <p className="text-[11px] text-zinc-500">
            If left blank, CommitOS uses its built-in resilient local memory repository. Complete SQL schema is available in <code className="text-zinc-300">supabase/schema.sql</code>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#16161d] hover:bg-[#1f1f27] border border-[#262633] text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Clean SVIT State</span>
          </button>

          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Settings Saved
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-md"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
