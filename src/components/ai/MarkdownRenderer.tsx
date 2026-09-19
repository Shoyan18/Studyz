'use client';

import React, { useState } from 'react';
import katex from 'katex';
import {
  Copy,
  Check,
  Terminal,
  Info,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  Bookmark,
  FunctionSquare,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Safely renders LaTeX formulas using KaTeX
 */
const MathBlock: React.FC<{ math: string; block?: boolean }> = ({ math, block = false }) => {
  try {
    const html = katex.renderToString(math, {
      displayMode: block,
      throwOnError: false,
    });
    if (block) {
      return (
        <div className="my-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#FFF8F6] via-[#FAF4F0] to-[#FFF8F6] dark:from-[#1b1c20] dark:via-[#22242a] dark:to-[#1b1c20] border border-[#F0E4DC] dark:border-[#2e313a] shadow-xs overflow-x-auto relative group">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-coral-600 dark:text-coral-400 uppercase tracking-widest mb-1.5 select-none">
            <FunctionSquare className="w-3.5 h-3.5 text-coral-500" />
            <span>Mathematical Expression</span>
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: html }}
            className="text-center py-1 overflow-x-auto text-charcoal-900 dark:text-[#e3e3e3] text-sm sm:text-base font-serif"
          />
        </div>
      );
    }
    return (
      <span
        dangerouslySetInnerHTML={{ __html: html }}
        className="inline-block px-2 py-0.5 my-0.5 rounded-lg bg-coral-500/10 dark:bg-white/10 border border-coral-500/20 dark:border-white/15 text-charcoal-900 dark:text-[#ffffff] font-serif text-[13px] align-middle shadow-2xs"
      />
    );
  } catch (err) {
    return (
      <code className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded text-xs font-mono">
        {math}
      </code>
    );
  }
};

/**
 * Code block with dark IDE styling, syntax label, and copy button
 */
const CodeBlock: React.FC<{ language?: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-[#373A4B] bg-[#1E2029] text-charcoal-100 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161822] border-b border-[#2A2D3D] text-xs font-mono select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-coral-400 ml-1" />
          <span className="uppercase font-bold tracking-wider text-[#A0A5BD]">
            {language || 'code'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/10 text-charcoal-300 hover:text-white transition-all text-xs font-medium"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto text-[#E2E8F0] leading-relaxed select-text">
        <code>{code}</code>
      </pre>
    </div>
  );
};

/**
 * Types of structured block AST nodes
 */
type BlockNode =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'math'; math: string }
  | { type: 'callout'; kind: 'note' | 'tip' | 'warning' | 'important' | 'formula' | 'quote'; title?: string; text: string }
  | { type: 'step'; stepNumber: string; title: string; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'hr' }
  | { type: 'paragraph'; text: string };

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Multi-pass Block Parser
  const parseBlocks = (raw: string): BlockNode[] => {
    const lines = raw.split(/\r?\n/);
    const blocks: BlockNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        i++;
        continue;
      }

      // Horizontal Rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        blocks.push({ type: 'hr' });
        i++;
        continue;
      }

      // Code Block Start (```)
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length && lines[i].trim().startsWith('```')) {
          i++; // skip closing ```
        }
        blocks.push({ type: 'code', language: lang, code: codeLines.join('\n') });
        continue;
      }

      // Block Math ($$)
      if (trimmed.startsWith('$$')) {
        let mathStr = '';
        if (trimmed.endsWith('$$') && trimmed.length > 4) {
          mathStr = trimmed.slice(2, -2).trim();
          i++;
        } else {
          const mathLines: string[] = [trimmed.slice(2)];
          i++;
          while (i < lines.length && !lines[i].trim().endsWith('$$')) {
            mathLines.push(lines[i]);
            i++;
          }
          if (i < lines.length) {
            const lastLine = lines[i].trim();
            mathLines.push(lastLine.slice(0, -2));
            i++;
          }
          mathStr = mathLines.join('\n').trim();
        }
        blocks.push({ type: 'math', math: mathStr });
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        blocks.push({ type: 'heading', level: 1, text: line.slice(2).trim() });
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        blocks.push({ type: 'heading', level: 2, text: line.slice(3).trim() });
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        blocks.push({ type: 'heading', level: 3, text: line.slice(4).trim() });
        i++;
        continue;
      }

      // Callout Blocks / Quotes (> ...)
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        const fullQuote = quoteLines.join(' ');
        let kind: 'note' | 'tip' | 'warning' | 'important' | 'formula' | 'quote' = 'quote';
        let text = fullQuote;
        let title: string | undefined = undefined;

        if (/^\[!NOTE\]/i.test(fullQuote) || /^\*\*Note:\*\*/i.test(fullQuote)) {
          kind = 'note';
          text = fullQuote.replace(/^(\[!NOTE\]|\*\*Note:\*\*)\s*/i, '');
          title = 'Note';
        } else if (/^\[!TIP\]/i.test(fullQuote) || /^\*\*Tip:\*\*/i.test(fullQuote) || /^\*\*Pro Tip:\*\*/i.test(fullQuote)) {
          kind = 'tip';
          text = fullQuote.replace(/^(\[!TIP\]|\*\*Tip:\*\*|\*\*Pro Tip:\*\*)\s*/i, '');
          title = 'Pro Tip';
        } else if (/^\[!WARNING\]/i.test(fullQuote) || /^\*\*Warning:\*\*/i.test(fullQuote) || /^\*\*Caution:\*\*/i.test(fullQuote)) {
          kind = 'warning';
          text = fullQuote.replace(/^(\[!WARNING\]|\*\*Warning:\*\*|\*\*Caution:\*\*)\s*/i, '');
          title = 'Warning';
        } else if (/^\[!IMPORTANT\]/i.test(fullQuote) || /^\*\*Important:\*\*/i.test(fullQuote) || /^\*\*Key Concept:\*\*/i.test(fullQuote)) {
          kind = 'important';
          text = fullQuote.replace(/^(\[!IMPORTANT\]|\*\*Important:\*\*|\*\*Key Concept:\*\*)\s*/i, '');
          title = 'Key Concept';
        } else if (/^\[!FORMULA\]/i.test(fullQuote) || /^\*\*Formula:\*\*/i.test(fullQuote)) {
          kind = 'formula';
          text = fullQuote.replace(/^(\[!FORMULA\]|\*\*Formula:\*\*)\s*/i, '');
          title = 'Core Formula';
        }

        blocks.push({ type: 'callout', kind, title, text });
        continue;
      }

      // Step-by-step execution node (e.g., "Step 1: ...", "**Step 1:** ...", "Step 1 - ...")
      const stepMatch = trimmed.match(/^(?:(?:###\s*)?\(?\s*Step\s*(\d+)\s*[:\-\)]|\*\*(?:Step\s*(\d+)|Phase\s*(\d+))\*\*:?)\s*(.*)/i);
      if (stepMatch) {
        const stepNum = stepMatch[1] || stepMatch[2] || stepMatch[3] || '1';
        const restText = stepMatch[4] || '';
        i++;

        // Collect body content of step until next step, heading, or HR
        const contentLines: string[] = [];
        while (i < lines.length) {
          const nextTrimmed = lines[i].trim();
          if (
            !nextTrimmed ||
            nextTrimmed.startsWith('#') ||
            nextTrimmed.startsWith('```') ||
            nextTrimmed === '---' ||
            /^(?:(?:###\s*)?\(?\s*Step\s*\d+\s*[:\-\)]|\*\*(?:Step\s*\d+|Phase\s*\d+)\*\*:?)/i.test(nextTrimmed)
          ) {
            break;
          }
          contentLines.push(lines[i]);
          i++;
        }

        blocks.push({
          type: 'step',
          stepNumber: stepNum,
          title: restText,
          content: contentLines.join('\n'),
        });
        continue;
      }

      // Markdown Tables (| ... |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const parseRow = (r: string) =>
            r
              .split('|')
              .slice(1, -1)
              .map((cell) => cell.trim());

          const headers = parseRow(tableLines[0]);
          // Skip separator row (tableLines[1])
          const bodyRows = tableLines.slice(2).map(parseRow);
          blocks.push({ type: 'table', headers, rows: bodyRows });
        }
        continue;
      }

      // Bullet List (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          items.push(lines[i].trim().slice(2));
          i++;
        }
        blocks.push({ type: 'ul', items });
        continue;
      }

      // Numbered List (1. 2. 3.)
      if (/^\d+\.\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
          i++;
        }
        blocks.push({ type: 'ol', items });
        continue;
      }

      // Default: Paragraph
      blocks.push({ type: 'paragraph', text: trimmed });
      i++;
    }

    return blocks;
  };

  /**
   * Render Inline Text with bold, italic, code, links, and LaTeX math
   */
  const renderInline = (text: string): React.ReactNode => {
    if (!text) return null;

    // Tokenize inline LaTeX ($...$), bold (**...**), italic (*...*), code (`...`), and links ([...](...))
    const regex = /(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Inline Math $...$
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        return <MathBlock key={index} math={part.slice(1, -1)} block={false} />;
      }

      // Bold **...**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={index} className="font-extrabold text-charcoal-900 dark:text-white">
            {renderInline(part.slice(2, -2))}
          </strong>
        );
      }

      // Italic *...*
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={index} className="italic text-charcoal-800 dark:text-gray-200">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Inline Code `...`
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#FAF0EB] dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 font-mono text-[11px] font-semibold border border-[#FFD9CE]/70 dark:border-coral-800/60"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Links [text](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-coral-600 dark:text-coral-400 underline font-semibold hover:text-coral-700 transition-colors"
          >
            {linkMatch[1]}
          </a>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  const astBlocks = parseBlocks(content);

  return (
    <div className="space-y-3 text-charcoal-800 dark:text-gray-200 text-xs sm:text-sm leading-relaxed select-text font-sans">
      {astBlocks.map((block, idx) => {
        switch (block.type) {
          case 'heading': {
            if (block.level === 1) {
              return (
                <div key={idx} className="mt-5 mb-3 pb-2 border-b border-[#F0E4DC] dark:border-[#2e313a]">
                  <h1 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-coral-600 via-coral-500 to-lavender-600 tracking-tight">
                    {renderInline(block.text)}
                  </h1>
                </div>
              );
            }
            if (block.level === 2) {
              return (
                <div key={idx} className="mt-4 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-coral-500 shrink-0" />
                  <h2 className="text-sm sm:text-base font-extrabold text-charcoal-900 dark:text-white tracking-tight">
                    {renderInline(block.text)}
                  </h2>
                </div>
              );
            }
            return (
              <h3 key={idx} className="mt-3 mb-1.5 text-xs sm:text-sm font-bold text-charcoal-900 dark:text-white flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-lavender-500" />
                <span>{renderInline(block.text)}</span>
              </h3>
            );
          }

          case 'code':
            return <CodeBlock key={idx} language={block.language} code={block.code} />;

          case 'math':
            return <MathBlock key={idx} math={block.math} block />;

          case 'callout': {
            const getCalloutStyle = () => {
              switch (block.kind) {
                case 'note':
                  return {
                    bg: 'bg-sky-50/80 border-sky-200 text-sky-950',
                    icon: Info,
                    iconColor: 'text-sky-600',
                    badge: 'bg-sky-100 text-sky-700',
                  };
                case 'tip':
                  return {
                    bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
                    icon: Sparkles,
                    iconColor: 'text-emerald-600',
                    badge: 'bg-emerald-100 text-emerald-700',
                  };
                case 'warning':
                  return {
                    bg: 'bg-amber-50/80 border-amber-200 text-amber-950',
                    icon: AlertTriangle,
                    iconColor: 'text-amber-600',
                    badge: 'bg-amber-100 text-amber-700',
                  };
                case 'important':
                case 'formula':
                  return {
                    bg: 'bg-[#FFF5F2] border-[#FFD9CE] text-charcoal-900',
                    icon: FunctionSquare,
                    iconColor: 'text-coral-500',
                    badge: 'bg-[#FFE2D8] text-coral-700',
                  };
                default:
                  return {
                    bg: 'bg-[#FAF6F3] border-[#F0E4DC] text-charcoal-800',
                    icon: Bookmark,
                    iconColor: 'text-lavender-600',
                    badge: 'bg-lavender-100 text-lavender-700',
                  };
              }
            };

            const style = getCalloutStyle();
            const CalloutIcon = style.icon;

            return (
              <div
                key={idx}
                className={`my-3 p-3.5 rounded-2xl border ${style.bg} flex items-start gap-3 shadow-2xs`}
              >
                <div className={`p-1.5 rounded-xl bg-white shadow-2xs shrink-0 mt-0.5 ${style.iconColor}`}>
                  <CalloutIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  {block.title && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${style.badge}`}>
                        {block.title}
                      </span>
                    </div>
                  )}
                  <div className="text-xs sm:text-sm font-medium leading-relaxed">
                    {renderInline(block.text)}
                  </div>
                </div>
              </div>
            );
          }

          case 'step': {
            return (
              <div key={idx} className="my-3 pl-2 sm:pl-3 relative group">
                {/* Timeline connector visual line */}
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-coral-400 to-transparent rounded-full -z-10 hidden sm:block" />

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#1e1f20] border border-[#F0E4DC] dark:border-[#2e313a] shadow-soft hover:border-[#E8D9CE] transition-all">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-coral-500 to-amber-400 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                      {block.stepNumber}
                    </span>
                    {block.title && (
                      <h4 className="text-xs sm:text-sm font-extrabold text-charcoal-900 dark:text-white">
                        {renderInline(block.title)}
                      </h4>
                    )}
                  </div>
                  {block.content && (
                    <div className="text-xs sm:text-sm text-charcoal-700 dark:text-[#e3e3e3] font-medium pl-8 space-y-1.5">
                      {block.content.split('\n').map((line, lIdx) => (
                        <p key={lIdx}>{renderInline(line)}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          case 'table': {
            return (
              <div key={idx} className="my-4 overflow-hidden rounded-2xl border border-[#F0E4DC] dark:border-[#2e313a] shadow-soft bg-white dark:bg-[#1e1f20]">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#FFF3EF] dark:bg-[#28292c] border-b border-[#F0E4DC] dark:border-[#2e313a]">
                        {block.headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-4 py-3 font-extrabold text-charcoal-900 dark:text-white tracking-tight">
                            {renderInline(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5EBE4] dark:divide-[#2e313a]">
                      {block.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={rIdx % 2 === 0 ? 'bg-white dark:bg-[#1e1f20] hover:bg-[#FFFBF9] dark:hover:bg-white/5' : 'bg-[#FAF6F3]/60 dark:bg-[#22242a] hover:bg-[#FFFBF9] dark:hover:bg-white/5'}
                        >
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-4 py-2.5 text-charcoal-700 dark:text-[#e3e3e3] font-medium">
                              {renderInline(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          case 'ul': {
            return (
              <ul key={idx} className="my-2.5 space-y-2 pl-1">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-800 dark:text-[#e3e3e3]">
                    <span className="w-1.5 h-1.5 rounded-full bg-coral-500 shrink-0 mt-2 shadow-xs" />
                    <span className="flex-1 font-medium leading-relaxed">{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }

          case 'ol': {
            return (
              <ol key={idx} className="my-2.5 space-y-2 pl-1">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-800 dark:text-[#e3e3e3]">
                    <span className="w-5 h-5 rounded-lg bg-[#FFF0EB] dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 font-bold text-[11px] flex items-center justify-center shrink-0 border border-[#FFD9CE]/60 dark:border-coral-800/60">
                      {itemIdx + 1}
                    </span>
                    <span className="flex-1 font-medium leading-relaxed">{renderInline(item)}</span>
                  </li>
                ))}
              </ol>
            );
          }

          case 'hr':
            return (
              <div key={idx} className="my-4 h-px bg-gradient-to-r from-transparent via-[#F0E4DC] dark:via-[#2e313a] to-transparent" />
            );

          case 'paragraph':
          default:
            return (
              <p key={idx} className="my-1.5 font-medium leading-relaxed text-charcoal-800 dark:text-[#e3e3e3]">
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
};

