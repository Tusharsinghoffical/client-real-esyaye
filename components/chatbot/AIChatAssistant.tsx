'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  MessageSquare, 
  Send, 
  X, 
  Bot, 
  Sparkles, 
  Phone, 
  ArrowUpRight, 
  Calendar,
  CheckCircle2,
  Database,
  Building,
  RefreshCw,
  MessageCircle
} from 'lucide-react';
import { BUSINESS_CONFIG, getWhatsAppLink } from '@/lib/config';
import ChatMessageContent from './ChatMessageContent';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isRagGrounded?: boolean;
}

let messageCounter = 0;
const createMessageId = (prefix: string) => {
  messageCounter += 1;
  return `${prefix}-${messageCounter}-${typeof performance !== 'undefined' ? Math.floor(performance.now()) : 0}`;
};

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to **Signature Aura Developers** private concierge. I am your 24/7 AI Advisory Assistant.\n\nI can assist you with verified property inventory in **Pune (Baner-Sus)**, **Mumbai (Worli Sea Face)**, **Goa villas**, statutory MahaRERA audits, and private site visits. How may I assist you today?`,
      timestamp: 'Just now',
      isRagGrounded: true
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: 'Plots & Acres (JV)', query: 'What land parcels, acres, and builder joint ventures are available in Pune?' },
    { label: 'Marquee Projects', query: 'Show marquee projects and landmark developments' },
    { label: 'Worli Penthouses', query: 'Show me sea-facing penthouses in Worli, Mumbai' },
    { label: 'Baner-Sus Pune', query: 'What properties are available in Baner-Sus, Pune?' },
    { label: 'Services & Advisory', query: 'What advisory services does Signature Aura offer?' },
    { label: '30-Year Title Diligence', query: 'How does Signature Aura verify 30-year property titles?' },
    { label: 'Goa Luxury Villas', query: 'Tell me about private villas in Assagao, Goa' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (typeof window !== 'undefined' && (window as any).omnitrack) {
        (window as any).omnitrack.track('ai_chat_assistant_opened');
      }
    }
  }, [isOpen, messages]);

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: createMessageId('u'),
      role: 'user',
      content: textToSend.trim(),
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        })
      });

      const data = await res.json();
      if (data.success) {
        const botReply: ChatMessage = {
          id: createMessageId('b'),
          role: 'assistant',
          content: data.reply,
          timestamp: 'Just now',
          isRagGrounded: data.isRagGrounded
        };
        setMessages(prev => [...prev, botReply]);
      } else {
        throw new Error('Chat API returned error');
      }
    } catch {
      const fallbackReply: ChatMessage = {
        id: createMessageId('f'),
        role: 'assistant',
        content: `I am connecting directly with our advisory desk. For immediate consultation, Senior Partner Rakesh Desale Patil is reachable on WhatsApp: [Chat on WhatsApp](${getWhatsAppLink()}) or call ${BUSINESS_CONFIG.phoneNumber}.`,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const directWhatsAppLink = getWhatsAppLink(
    `Hello Signature Aura, I am chatting with your AI Advisory Assistant and would like to connect directly with a Partner.`
  );

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open 24/7 AI Real Estate Assistant"
            className="group relative flex items-center gap-3 bg-[#171717] hover:bg-[#B99A63] text-white p-2.5 sm:px-4 sm:py-3 rounded-full shadow-2xl border-2 border-[#B99A63] transition-all hover:scale-105 active:scale-95"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
              <Image
                src="/assets/branding/logo-circle.png"
                alt="Signature Aura AI"
                fill
                className="object-contain"
              />
            </div>
            
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5">
                AI Advisory Desk
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <span className="text-[10px] text-stone-300 font-light group-hover:text-white transition-colors">
                24/7 Grounded RERA & Luxury Insights
              </span>
            </div>

            <span className="sm:hidden absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#171717]" />
          </button>
        )}
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div 
          role="dialog"
          aria-label="Signature Aura 24/7 AI Chat Assistant"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[440px] max-h-[85vh] h-[640px] bg-[#171717] border border-[#B99A63]/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="bg-[#121212] px-4 py-3.5 border-b border-[#2D2D2D] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#B99A63]">
                <Image
                  src="/assets/branding/logo-circle.png"
                  alt="Signature Aura Developers"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-sm font-normal text-white">
                    Signature Aura AI Assistant
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-stone-400">
                  Grounded in Live MahaRERA Data & 30-Year Title Deeds
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={directWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Direct WhatsApp"
                aria-label="Direct WhatsApp"
                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/60 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="bg-[#1a1a1a] px-3 py-2 border-b border-[#2D2D2D] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] text-[#B99A63] font-mono uppercase tracking-wider shrink-0 mr-1">
              Popular:
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp.query)}
                className="text-[11px] bg-stone-800 hover:bg-[#B99A63]/30 text-stone-300 hover:text-white border border-stone-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-all"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0F0F11] text-xs sm:text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#B99A63] text-[#171717] font-medium rounded-br-none shadow-md'
                      : 'bg-[#1C1C1F] text-stone-200 border border-[#2D2D2D] rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-white/10 text-[10px] text-[#B99A63] font-mono uppercase">
                      <Database className="w-2.5 h-2.5" />
                      <span>Verified Knowledge</span>
                    </div>
                  )}

                  <div className="font-light">
                    <ChatMessageContent content={m.content} isUser={m.role === 'user'} />
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-stone-400 bg-[#1C1C1F] p-3 rounded-xl border border-[#2D2D2D] w-fit">
                <RefreshCw className="w-3.5 h-3.5 text-[#B99A63] animate-spin" />
                <span>Synthesizing live real estate data...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom WhatsApp CTA & Input */}
          <div className="bg-[#141416] p-3 border-t border-[#2D2D2D] space-y-2 shrink-0">
            <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
              <span>Need human advisory?</span>
              <a
                href={directWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                <span>Chat with Partner on WhatsApp</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                suppressHydrationWarning
                placeholder="Ask about penthouses, prices, MahaRERA..."
                className="flex-1 bg-[#1C1C1F] border border-[#333333] focus:border-[#B99A63] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                aria-label="Send Message"
                className="bg-[#B99A63] hover:bg-[#a68853] disabled:opacity-40 text-[#171717] p-2.5 rounded-xl transition-all font-semibold"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
