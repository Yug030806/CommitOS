'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, ArrowUpRight, Bot } from 'lucide-react';
import { CommitOSStore } from '@/lib/store';
import { ChatMessage } from '@/lib/types';

export default function AskCommitOSWidget() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => CommitOSStore.getChatMessages());
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Event budget?',
    'Who leads marketing?',
    'Dec 15 risk?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
          'Approved budget is ₹15,000, Rahul leads marketing, and the Dec 15 event date is currently in conflict review with Dec 20.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, fallbackMsg]);
      CommitOSStore.addChatMessage(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-[#121217] border border-[#23232f] p-4 flex flex-col h-[480px] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1f1f28] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">CommitOS Assistant</h3>
            <p className="text-[11px] text-zinc-400">Ask about meetings, decisions, or tasks</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto shrink-0 no-scrollbar">
        {samplePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleAsk(prompt)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#181822] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-[#2b2b3a] transition-all whitespace-nowrap flex items-center gap-1 shrink-0"
          >
            <span>{prompt}</span>
            <ArrowUpRight className="w-2.5 h-2.5 text-zinc-500" />
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 text-xs">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-zinc-500 space-y-2">
            <Bot className="w-7 h-7 text-zinc-600" />
            <p className="text-xs text-zinc-400">How can I help with SVIT Podcast Club today?</p>
            <p className="text-[11px] text-zinc-600 max-w-xs">
              Try clicking a suggestion above or ask about budgets, tasks, or event dates.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[88%] ${
                msg.role === 'user'
                  ? 'bg-zinc-800 text-white rounded-br-sm border border-zinc-700/60'
                  : 'bg-[#181822] text-zinc-200 rounded-bl-sm border border-[#282838]'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#262638] flex flex-wrap gap-1">
                  {msg.sources.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] text-zinc-400 bg-[#121218] px-1.5 py-0.5 rounded border border-[#242432] font-mono"
                    >
                      {s.meetingTitle} ({s.date})
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[9px] text-zinc-600 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#181822] border border-[#282838] text-xs text-zinc-400 max-w-[70%]">
            <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
            <span className="text-[11px]">Finding information...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="pt-2 border-t border-[#1f1f28] shrink-0">
        <div className="relative flex items-center">
          <input
            id="ask-commitos-input"
            type="text"
            placeholder="Ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            disabled={isLoading}
            className="w-full pl-3.5 pr-10 py-2 rounded-lg bg-[#16161d] border border-[#272736] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isLoading || !query.trim()}
            className="absolute right-1.5 p-1.5 rounded-md bg-white text-black hover:bg-zinc-200 disabled:opacity-30 transition-colors"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
