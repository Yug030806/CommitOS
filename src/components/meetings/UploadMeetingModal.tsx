'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  X,
  FileAudio,
  Sparkles,
  Bot,
  BrainCircuit,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  Play,
} from 'lucide-react';
import { SAMPLE_MEETING_4_TRANSCRIPT } from '@/lib/demo-data';
import { CommitOSStore } from '@/lib/store';
import { Meeting } from '@/lib/types';
import { RBAC } from '@/lib/rbac';

interface UploadMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadMeetingModal({ isOpen, onClose }: UploadMeetingModalProps) {
  const router = useRouter();
  const currentUser = CommitOSStore.getCurrentUser();
  const canUpload = RBAC.canUploadMeetings(currentUser.role);

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('text');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAgentStep, setCurrentAgentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  if (!canUpload) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#121218] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Permission Required</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Your current role is <strong className="text-zinc-200">Team Member</strong> ({currentUser.name}).
              Only <strong className="text-rose-300">Organization Admins</strong> and <strong className="text-amber-300">Team Leaders</strong> are authorized to upload recordings and trigger AI meeting ingestion.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const agentSteps = [
    { title: 'Audio Ingestion & Transcription', desc: 'Processing audio stream / speech-to-text tokens' },
    { title: 'Meeting Intelligence Agent', desc: 'Extracting decisions, speakers, and action items with Gemini' },
    { title: 'Organizational Memory Agent', desc: 'Synthesizing vector memories & cross-meeting indexing' },
    { title: 'Decision Conflict Detection Agent', desc: 'Cross-referencing historical decisions for contradiction' },
    { title: 'AI Execution Agent', desc: 'Synthesizing verified tasks and evaluating blast radius' },
  ];

  const handleLoadSampleTranscript = () => {
    setTitle('Meeting 4: Triage & Execution Sync');
    setTranscriptText(SAMPLE_MEETING_4_TRANSCRIPT.trim());
    setInputMode('text');
  };

  const handleProcessMeeting = async () => {
    const finalTitle = title.trim() || 'Executive Sync';
    let textToAnalyze = transcriptText.trim();

    if (inputMode === 'file' && file) {
      // In demo mode or if audio file was uploaded, extract simulated or audio transcript
      textToAnalyze = `[Audio recording transcribed from ${file.name}]\n` + (transcriptText.trim() || SAMPLE_MEETING_4_TRANSCRIPT.trim());
    }

    if (!textToAnalyze) {
      setErrorMessage('Please provide audio file or meeting transcript text.');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);
    setCurrentAgentStep(0);

    try {
      // Progressively advance visual agent steps for demonstration
      const stepTimer1 = setTimeout(() => setCurrentAgentStep(1), 700);
      const stepTimer2 = setTimeout(() => setCurrentAgentStep(2), 1400);
      const stepTimer3 = setTimeout(() => setCurrentAgentStep(3), 2100);
      const stepTimer4 = setTimeout(() => setCurrentAgentStep(4), 2800);

      const settings = CommitOSStore.getSettings();
      const historicalDecisions = CommitOSStore.getDecisions().map((d) => ({
        id: d.id,
        title: d.title,
        value: d.value,
        meetingTitle: d.meetingTitle,
        date: d.decidedAt.split('T')[0],
      }));

      const res = await fetch('/api/process-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToAnalyze,
          title: finalTitle,
          historicalDecisions,
          apiKey: settings.geminiApiKey,
          model: settings.geminiModel,
          actorRole: currentUser.role,
          organizationId: CommitOSStore.getActiveOrgId(),
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to process meeting.');
      }

      const data = await res.json();
      const newMeeting: Meeting = data.meeting;

      // Persist meeting in CommitOSStore
      CommitOSStore.addMeeting(newMeeting);

      // Register any new conflicts detected
      if (data.conflicts && data.conflicts.length > 0) {
        for (const c of data.conflicts) {
          CommitOSStore.addConflict(c);
        }
      }

      setIsProcessing(false);
      onClose();
      router.push(`/meetings/${newMeeting.id}`);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'An error occurred during meeting processing.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#121217] border border-[#272733] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1f1f27] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
              <Upload className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Upload New Meeting</h2>
              <p className="text-[11px] text-zinc-400">Transform conversations into structured decisions & tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {isProcessing ? (
            /* Multi-Agent Orchestration Visualizer */
            <div className="py-6 space-y-5">
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 rounded-full bg-zinc-800/80 border border-zinc-700 animate-pulse">
                  <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white">Agentic Orchestration in Progress</h3>
                <p className="text-xs text-zinc-400">
                  Multiple AI agents are analyzing, cross-checking memory, and extracting commitments
                </p>
              </div>

              <div className="space-y-2.5 max-w-md mx-auto">
                {agentSteps.map((step, idx) => {
                  const isDone = currentAgentStep > idx;
                  const isCurrent = currentAgentStep === idx;
                  return (
                    <div
                      key={step.title}
                      className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                        isCurrent
                          ? 'bg-zinc-800 border-zinc-600 shadow-md scale-[1.02]'
                          : isDone
                          ? 'bg-[#15151b] border-emerald-500/20 text-zinc-400'
                          : 'bg-[#101015] border-[#1f1f27] opacity-40'
                      }`}
                    >
                      <div className="shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin block" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-zinc-700" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-medium ${isCurrent ? 'text-white' : 'text-zinc-300'}`}>
                          {step.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Meeting Title Input */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Meeting Title & Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flagship Event Sync, Budget Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#16161d] border border-[#262633] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* Input Mode Selector */}
              <div className="flex items-center gap-2 border-b border-[#21212b] pb-2">
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    inputMode === 'text'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Paste Transcript</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    inputMode === 'file'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <FileAudio className="w-3.5 h-3.5" />
                  <span>Upload Audio File</span>
                </button>

                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={handleLoadSampleTranscript}
                    className="flex items-center gap-1.5 text-[11px] text-zinc-300 hover:text-white px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 transition-colors"
                    title="Insert sample executive sync transcript to test live AI extraction"
                  >
                    <FileText className="w-3 h-3 text-emerald-400" />
                    <span>Insert Sample Transcript</span>
                  </button>
                </div>
              </div>

              {inputMode === 'text' ? (
                <div>
                  <textarea
                    rows={6}
                    placeholder="Paste meeting conversation or speaker notes here (e.g. Yug: Let's confirm December 15...)"
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#16161d] border border-[#262633] text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono leading-relaxed resize-none"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#2b2b3b] hover:border-zinc-500 rounded-xl p-6 text-center transition-colors">
                  <input
                    type="file"
                    id="audio-upload"
                    accept="audio/*,video/*,.mp3,.wav,.m4a,.webm"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                        if (!title) {
                          setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }
                    }}
                  />
                  <label htmlFor="audio-upload" className="cursor-pointer space-y-2 block">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-300 border border-zinc-700">
                      <FileAudio className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {file ? file.name : 'Click to select or drag audio/video recording'}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">MP3, WAV, M4A, WEBM up to 100MB</p>
                    </div>
                  </label>
                </div>
              )}

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isProcessing && (
          <div className="px-6 py-3.5 border-t border-[#1f1f27] bg-[#0f0f14] flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">Organization: SVIT Podcast Club</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessMeeting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run AI Agent Pipeline</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
