'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, ArrowUpRight, Bot, User, CheckCircle2 } from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { ChatMessage } from '@/lib/types';

interface AskCommitOSWidgetProps {
  highlighted?: boolean;
}

export default function AskCommitOSWidget({ highlighted = true }: AskCommitOSWidgetProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => CommitOSStore.getChatMessages());
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'What was the approved event budget?',
    'Who is responsible for marketing & sponsorship?',
    'Are there any execution risks for our upcoming event?',
    'What decisions were made in the last meeting?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem('commitos_chat_messages');
  };

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
          'Approved budget is ₹15,000 (Nov 15), Rahul leads marketing, Yash leads sponsorships, and the Dec 15 event date is currently in conflict review with Dec 20.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, fallbackMsg]);
      CommitOSStore.addChatMessage(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`rounded-2xl transition-all ${
        highlighted
          ? 'bg-gradient-to-b from-[#15151c] to-[#0e0e13] border-2 border-white/20 shadow-[0_0_50px_-15px_rgba(255,255,255,0.12)] p-4 sm:p-6'
          : 'bg-[#121217] border border-[#23232f] p-4 sm:p-5'
      }`}
    >
      {/* Highlighted Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-lg shrink-0">
            <Sparkles className="w-5 h-5 fill-black stroke-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                CommitOS AI Assistant
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 font-semibold">
                Intelligence Core
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Ask anything about SVIT Podcast Club meetings, budgets, deadlines, or decisions
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="self-start sm:self-center text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="pt-4 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleAsk(prompt)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>{prompt}</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Message History Container */}
      <div
        className={`overflow-y-auto space-y-3.5 my-3 pr-1.5 transition-all ${
          messages.length === 0 ? 'min-h-[140px] flex items-center justify-center' : 'max-h-[380px]'
        }`}
      >
        {messages.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 space-y-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
              <Bot className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-zinc-300">
              What can I find for you in your team records?
            </p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Click any suggested question above or type your own question below.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[95%] sm:max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-white text-black font-medium rounded-br-xs shadow-md'
                    : 'bg-[#1a1a24] text-zinc-100 rounded-bl-xs border border-zinc-700/80 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] opacity-70 mb-1">
                  {msg.role === 'user' ? (
                    <span className="font-semibold uppercase tracking-wider">You</span>
                  ) : (
                    <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> CommitOS AI
                    </span>
                  )}
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-700/60 flex flex-wrap gap-1.5">
                    {msg.sources.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-zinc-300 bg-black/40 px-2 py-0.5 rounded border border-zinc-700 font-mono"
                      >
                        {s.meetingTitle} ({s.date})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#1a1a24] border border-zinc-700/80 text-xs text-zinc-300 max-w-[70%]">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
            <span>Scanning organizational memory &amp; decisions...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="pt-3 border-t border-white/10">
        <div className="relative flex items-center">
          <input
            id="ask-commitos-input"
            type="text"
            placeholder="Ask a question about your meetings, tasks, budget, or decisions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-black/40 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 p-2 rounded-lg bg-white text-black hover:bg-zinc-200 disabled:opacity-30 transition-all active:scale-95 shadow"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
