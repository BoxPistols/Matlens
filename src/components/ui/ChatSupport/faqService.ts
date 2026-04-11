// FAQ search service — Fuse.js based fuzzy matching over the local
// knowledge base. Replaces the old substring-containment search which
// only fired on literal keyword matches.
//
// Why fuzzy? Users don't type our keyword vocabulary verbatim —
// "ボタンの色変え方" should hit the "カラートークン" FAQ entry, and
// "dark モードの文字色" should land on the theme entry. Fuse scores each
// field (keywords most relevant, question next, answer as a tiebreaker)
// and hands back the top hit if it clears the confidence threshold.
//
// Anything below the threshold is `null`, which lets ChatSupport.handleSend
// fall through to the Story Guide layer, and ultimately to the AI proxy.
// Tune the threshold carefully: too low = false negatives (users blame
// the bot for not knowing), too high = false positives (users get the
// wrong FAQ canned response and blame the bot for lying).

import Fuse from 'fuse.js'
import type { FaqEntry } from './chatSupportTypes'
import { FAQ_DATABASE } from './faqDatabase'

// Matches that score better than this are returned. Fuse scores run 0
// (perfect) → 1 (no match), so 0.45 lets moderately fuzzy hits through
// without letting "banana" answer a question about "button". Empirically
// the sweet spot for mixed Japanese / English technical vocabulary.
const CONFIDENCE_THRESHOLD = 0.45

// Build once at module load. Fuse re-computes its index lazily on first
// search and keeps it for subsequent calls, so subsequent searches are
// O(n) lookups rather than O(n·m) substring scans.
const fuse = new Fuse<FaqEntry>(FAQ_DATABASE, {
  includeScore: true,
  // `threshold` is Fuse's internal cutoff for "any match at all". We
  // deliberately set it fairly loose so Fuse emits borderline hits, then
  // apply our own stricter `CONFIDENCE_THRESHOLD` on the returned score.
  // This lets us distinguish "definitely the answer" from "probably not"
  // without tuning two values in lockstep.
  threshold: 0.6,
  // Keys are weighted by how predictive they are of a real match.
  // Keywords are curated, so they carry the most signal. Questions
  // paraphrase the keywords. Answers are long and contain many incidental
  // words, so they only tip the scales as a final tiebreaker.
  keys: [
    { name: 'keywords', weight: 2 },
    { name: 'question', weight: 1.5 },
    { name: 'answer', weight: 0.5 },
  ],
  // Japanese-friendly options — don't require an exact start-of-word
  // match, let tokens overlap across single-byte / multi-byte boundaries.
  ignoreLocation: true,
  minMatchCharLength: 2,
})

/**
 * Search the FAQ database for the best fuzzy match. Returns `null` when
 * no entry clears the confidence threshold, signalling the caller should
 * fall through to the next response layer (Story Guide → AI).
 */
export function searchFaq(query: string): FaqEntry | null {
  const trimmed = query.trim()
  if (trimmed.length === 0) return null

  const hits = fuse.search(trimmed, { limit: 1 })
  const top = hits[0]
  if (!top) return null

  // `score` is only undefined if `includeScore: false`; it's always set
  // here. The `?? Infinity` is defensive so we never accidentally return
  // a match when the score is missing for some unforeseen reason.
  if ((top.score ?? Infinity) > CONFIDENCE_THRESHOLD) return null

  return top.item
}

/**
 * Test helper — returns all matches above the confidence threshold, with
 * their scores. Used by unit tests and the interactive FAQ tuner.
 */
export function searchFaqDebug(query: string, limit = 5) {
  return fuse
    .search(query.trim(), { limit })
    .filter(hit => (hit.score ?? Infinity) <= CONFIDENCE_THRESHOLD)
    .map(hit => ({ entry: hit.item, score: hit.score ?? 0 }))
}
