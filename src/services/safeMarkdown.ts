// Safe Markdown rendering — parses via marked then sanitizes with DOMPurify.
// Use this EVERYWHERE we render untrusted Markdown (LLM output especially)
// into innerHTML. The sanitizer strips <script>, <iframe>, on* handlers, and
// javascript: URIs so a malicious or hallucinated LLM response cannot inject
// executable content.

import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

marked.setOptions({ breaks: true, gfm: true });

export function renderSafeMarkdown(src: string | null | undefined): string {
  if (!src) return '';
  try {
    const html = marked.parse(src) as string;
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
