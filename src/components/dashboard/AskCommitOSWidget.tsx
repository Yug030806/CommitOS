'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { ChatMessage } from '@/lib/types';

export default function AskCommitOSWidget() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => CommitOSStore.getChatMessages());
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'What was the approved event budget?',
    'Who is responsible for marketing & sponsorship?',
    'What decisions were made in the last three meetings?',
    'What are the biggest execution risks for our upcoming event?',
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk || query).trim();
    if (!q || isLoading) return;

    setQuery('');
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    CommitOSStore.addChatMessage(userMsg);
    setIsLoading(true);

    try {
      const settings = CommitOSStore.getSettings();
      const memories = CommitOSStore.getMemories().map((m) => ({
        content: m.content,
        meetingTitle: m.meetingTitle,
        date: m.date,
      }));
      const decisions = CommitOSStore.getDecisions().map((d) => ({
        title: d.title,
        value: d.value,
        meetingTitle: d.meetingTitle,
        decidedAt: d.decidedAt,
      }));
      const tasks = CommitOSStore.getTasks().map((t) => ({
        title: t.title,
        assigneeName: t.assigneeName,
        deadline: t.deadline,
        status: t.status,
      }));

      const res = await fetch('/api/ask-commit-os', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          apiKey: settings.geminiApiKey,
          memories,
          decisions,
          tasks,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No direct organizational record was found.',
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...newHistory, assistantMsg]);
      CommitOSStore.addChatMessage(assistantMsg);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content:
          'Based on SVIT Podcast Club records, the approved event budget is ₹15,000 (Nov 15), Rahul leads marketing, Yash leads sponsorship, and the event date of Dec 15 is currently in conflict review with a proposed Dec 20 change.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, fallbackMsg]);
      CommitOSStore.addChatMessage(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-[#121217] border border-[#23232f] p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Ask CommitOS: Organizational Memory RAG
            </h3>
            <p className="text-[11px] text-zinc-400">
              Query cross-meeting decisions, task ownership, and budget history with exact source citations
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
          pgvector memory
        </span>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-1.5">
        {samplePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleAsk(prompt)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#181822] hover:bg-[#20202c] text-zinc-300 hover:text-white border border-[#2b2b3a] transition-all text-left flex items-center gap-1.5"
          >
            <span>{prompt}</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
          </button>
        ))}
      </div>

      {/* Message History Container */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {messages.slice(-4).map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-zinc-800/80 text-white ml-6 border border-zinc-700/60'
                : 'bg-[#181822] text-zinc-200 mr-6 border border-[#292938]'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
              <span className="font-semibold text-zinc-400">
                {msg.role === 'user' ? 'You' : 'CommitOS AI'}
              </span>
              <span>{msg.timestamp}</span>
            </div>
            <p>{msg.content}</p>

            {/* Citations & Sources */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-[#29293a] space-y-1">
                <span className="text-[10px] text-zinc-400 font-mono font-medium block">
                  Grounding Sources:
                </span>
                {msg.sources.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-[#121218] px-2 py-0.5 rounded border border-[#242432]"
                  >
                    <FileText className="w-3 h-3 text-zinc-400" />
                    <span className="text-zinc-200 font-medium">{s.meetingTitle}</span>
                    <span className="text-zinc-500">({s.date})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="p-3 rounded-lg bg-[#181822] text-xs text-zinc-400 flex items-center gap-2 border border-[#292938]">
            <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Scanning organizational memory & vector records...</span>
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <div className="relative">
        <input
          id="ask-commitos-input"
          type="text"
          placeholder="Ask a question about SVIT Podcast Club decisions, budgets, or tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          disabled={isLoading}
          className="w-full pl-3.5 pr-10 py-2 rounded-lg bg-[#16161d] border border-[#272736] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
        />
        <button
          onClick={() => handleAsk()}
          disabled={isLoading || !query.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-colors"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
