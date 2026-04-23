# ADR 0004: MaiML (JIS K 0200:2024) as the primary export / import format

- **Status:** Accepted
- **Date:** 2026-04-09

## Context

Matlens is intended to be useful inside a Japanese materials / analytical
chemistry workflow. That ecosystem has a standardised XML interchange
format, **MaiML** — Measurement Analysis Instrument Markup Language,
standardised as **JIS K 0200:2024** and used by labs to exchange sample
metadata, analysis results, and their provenance.

The first shipped version of Matlens offered CSV / JSON / Markdown / PDF
export. Feedback from an anonymized reference deployment was that for
real lab integration, the thing that matters is whether we round-trip
cleanly against MaiML — everything else is a bonus.

## Decision

Adopt **MaiML as the primary export and import format** for materials
data, and keep CSV / JSON / MD / PDF as secondary options. Implementation
lives in `src/services/maiml.ts` with these properties:

- Lossless round-trip for the full `Material` shape (id, name, category,
  composition, HV/TS/EL/pf/el2/dn, batch, date, author, status, ai flag,
  memo). Result elements are keyed by `sampleRef` so multi-material
  documents preserve their measurement-to-sample linking.
- XML-safe: `&`, `<`, `>`, `"`, `'` are escaped on serialize and decoded
  on parse. The round-trip test `round-trips XML-special characters`
  locks this in.
- **Hardened against XXE / Billion Laughs.** The parser rejects any
  document with a `DOCTYPE` declaration and caps document size at
  `MAIML_MAX_BYTES`. This is deliberately stricter than the JIS spec
  requires — we trade some flexibility for robustness against hostile
  uploads.
- Default filename `matlens_YYYY-MM-DD.maiml` (see `defaultMaimlFilename`).

All export modals present MaiML as the default selected option, with
CSV / JSON / MD / PDF still accessible as alternates for ad-hoc sharing.

## Alternatives considered

| Option | Why rejected |
| --- | --- |
| CSV as primary | Already supported and comfortable, but loses nested metadata, composition fields, and audit info. Not acceptable for lab integration. |
| JSON as primary | Preserves everything but isn't a standard — tools outside Matlens can't read it. |
| AnIML (ASTM E2077) | Closer international peer to MaiML but not aligned with the JIS reference customer's workflow. Could add in a later ADR if the user base shifts. |

## Consequences

- **Positive:** Matlens can drop into a Japanese lab's existing
  MaiML-aware tooling without a converter. Import/export is lossless.
  The security hardening (`DOCTYPE` rejection, size cap) means the parser
  is safe to point at uploaded files.
- **Negative:** XML-handling code is heavier than JSON. The parser's
  safety constraints may reject documents that would be legal under a
  strict reading of JIS K 0200:2024 but include a `DOCTYPE` — we accept
  this trade-off explicitly.
- Any schema extension to `Material` needs a corresponding update to
  `src/services/maiml.ts` and a new round-trip test, otherwise existing
  MaiML files will silently drop the new field.
