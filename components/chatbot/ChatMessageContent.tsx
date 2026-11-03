'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface ChatMessageContentProps {
  content: string;
  isUser?: boolean;
}

/**
 * Parses inline markdown:
 * - **bold** and *bold* -> <strong>
 * - `code` (e.g. RERA numbers) -> <span className="font-mono ...">
 * - [Link Text](url) -> Next.js <Link>
 */
function renderInlineContent(text: string, isUser = false) {
  // Pattern matching: [text](url) | **bold** | *italic/bold* | `code`
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, , linkText, linkUrl, doubleBold, singleBold, code] = match;
    const matchIndex = match.index;

    // Push preceding plain text
    if (matchIndex > lastIndex) {
      elements.push(text.slice(lastIndex, matchIndex));
    }

    if (linkText && linkUrl) {
      const isInternal = linkUrl.startsWith('/');
      if (isInternal) {
        elements.push(
          <Link
            key={`l-${matchIndex}`}
            href={linkUrl}
            className="text-[#B99A63] font-semibold underline underline-offset-2 hover:text-[#D4AF37] transition-colors inline-flex items-center gap-0.5 mx-0.5"
          >
            <span>{linkText}</span>
            <ArrowUpRight className="w-3 h-3 inline-block shrink-0" />
          </Link>
        );
      } else {
        elements.push(
          <a
            key={`a-${matchIndex}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B99A63] font-semibold underline underline-offset-2 hover:text-[#D4AF37] transition-colors inline-flex items-center gap-0.5 mx-0.5"
          >
            <span>{linkText}</span>
            <ArrowUpRight className="w-3 h-3 inline-block shrink-0" />
          </a>
        );
      }
    } else if (doubleBold || singleBold) {
      const boldText = doubleBold || singleBold;
      elements.push(
        <strong
          key={`b-${matchIndex}`}
          className={`font-semibold ${isUser ? 'text-[#171717]' : 'text-stone-900 dark:text-stone-100'}`}
        >
          {boldText}
        </strong>
      );
    } else if (code) {
      elements.push(
        <code
          key={`c-${matchIndex}`}
          className="font-mono text-[11px] bg-[#B99A63]/15 text-[#B99A63] dark:text-[#E8D39E] px-1.5 py-0.5 rounded border border-[#B99A63]/30 mx-0.5 font-medium"
        >
          {code}
        </code>
      );
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  // Push remaining trailing text
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : text;
}

export default function ChatMessageContent({ content, isUser = false }: ChatMessageContentProps) {
  if (!content) return null;

  // Split content into blocks by double line-breaks
  const blocks = content.split('\n\n').filter(Boolean);

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();

        // 1. Heading level 3 or 2 (### or ##)
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^#{2,3}\s+/, '');
          return (
            <h4
              key={bIdx}
              className={`font-serif font-bold text-sm sm:text-base pb-1 mt-1 border-b ${
                isUser 
                  ? 'text-[#171717] border-[#171717]/20' 
                  : 'text-[#B99A63] dark:text-[#E8D39E] border-[#B99A63]/30'
              }`}
            >
              {renderInlineContent(headingText, isUser)}
            </h4>
          );
        }

        // 2. Bullet list block (lines starting with • or - or numbered 1.)
        const lines = trimmed.split('\n');
        const isListBlock = lines.every(
          l => l.trim().startsWith('•') || l.trim().startsWith('-') || /^\d+\.\s/.test(l.trim()) || l.trim().startsWith('*') || l.trim() === ''
        );

        if (isListBlock && lines.length > 0) {
          return (
            <ul key={bIdx} className="space-y-1.5 my-1.5 pl-1">
              {lines.filter(Boolean).map((line, lIdx) => {
                const cleanLine = line.trim().replace(/^[•\-\*]\s+/, '').replace(/^\d+\.\s+/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span className="text-[#B99A63] mt-1 shrink-0 text-xs">◆</span>
                    <span className="flex-1">{renderInlineContent(cleanLine, isUser)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 3. Regular paragraph (may have single linebreaks inside)
        return (
          <p key={bIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInlineContent(line, isUser)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
