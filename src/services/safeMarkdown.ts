// Safe Markdown rendering — parses via marked then sanitizes with DOMPurify.
// Use this EVERYWHERE we render untrusted Markdown (LLM output especially)
// into innerHTML. The sanitizer strips <script>, <iframe>, on* handlers, and
// javascript: URIs so a malicious or hallucinated LLM response cannot inject
// executable content.

import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

marked.setOptions({ breaks: true, gfm: true });

// Pre-process text so CommonMark's emphasis parser can recognise **bold** when
// the delimiters are adjacent to CJK characters or full-width punctuation.
// Without this, LLM output like `**S45C（MAT-0302）**は` or `**ポリマー**は`
// would render as literal asterisks because the closing ** is not considered
// "right-flanking" when followed by a CJK letter.
function normalizeCjkEmphasis(src: string): string {
  // Insert a ZWSP between ** and an adjacent CJK / full-width character so
  // marked treats the delimiter as a proper flanking run.
  const ZWSP = '\u200B';
  const cjk = '\\u3000-\\u303F\\u3040-\\u309F\\u30A0-\\u30FF\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uFF00-\\uFFEF';
  // Opening **: (CJK)** → (CJK) **
  let out = src.replace(new RegExp(`([${cjk}])(\\*\\*|__)(?=\\S)`, 'g'), `$1${ZWSP}$2`);
  // Closing **: **(CJK) → ** (CJK)
  out = out.replace(new RegExp(`(\\S)(\\*\\*|__)([${cjk}])`, 'g'), `$1$2${ZWSP}$3`);
  return out;
}

export function renderSafeMarkdown(src: string | null | undefined): string {
  if (!src) return '';
  try {
    const html = marked.parse(normalizeCjkEmphasis(src)) as string;
    return DOMPurify.sanitize(html, {
      // Allow common Markdown-generated tags. No <script>, <iframe>, <object>, etc.
      ALLOWED_TAGS: [
        'a', 'b', 'blockquote', 'br', 'code', 'dd', 'del', 'div', 'dl', 'dt',
        'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol',
        'p', 'pre', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td',
        'tfoot', 'th', 'thead', 'tr', 'ul',
      ],
      ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  } catch {
    // If marked throws (malformed input), fall back to the raw text escaped.
    return DOMPurify.sanitize(src);
  }
}
