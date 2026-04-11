// WCAG 2.1 AA regression suite.
//
// These tests render a handful of representative pages and assert that
// axe-core finds zero violations at the "wcag2a + wcag2aa" level. The
// goal is _not_ to replace manual / keyboard testing, but to catch the
// class of accessibility bugs that are cheap to detect automatically:
//   • missing form labels
//   • role / aria-* mismatches
//   • buttons / selects with no accessible name
//
// Color contrast is intentionally EXCLUDED here (see the `rules` override
// below) — jsdom can't resolve the `var(--text-hi)` style our theme uses,
// so axe-core would produce noise. Real contrast checking happens in
// Storybook via `@storybook/addon-a11y` on fully rendered components.
//
// Pages that embed `<canvas>` (Dashboard charts) are deliberately not
// audited here because jsdom can't render them. If a new page is added
// that needs to be exempted, document the reason inline where it's
// excluded rather than maintaining a separate skip list.

import { describe, it, expect } from 'vitest';
import { axe } from 'jest-axe';
import { renderWithContext, mockClaude, mockEmbedding, INITIAL_DB, mockContext } from './helpers';
import { MaterialListPage } from '../pages/MaterialList';
import { HelpPage } from '../pages/Help';
import { AboutPage } from '../pages/About';
import { DetailPage } from '../pages/Detail';

// axe-core option tuning:
//  - only: run WCAG 2 A/AA rules and the "best-practice" set (useful
//    checks like region / heading-order that aren't strictly WCAG).
//  - rules.color-contrast: DISABLED because jsdom doesn't compute
//    CSS custom properties (our colors are `var(--text-hi)` etc.),
//    which makes contrast calculations unreliable. Real contrast
//    checking happens in Storybook's @storybook/addon-a11y on the
//    rendered components.
const AXE_OPTIONS = {
  runOnly: {
    type: 'tag' as const,
    values: ['wcag2a', 'wcag2aa', 'best-practice'],
  },
  rules: {
    'color-contrast': { enabled: false },
  },
};

describe('a11y smoke', () => {
  it('MaterialListPage has no axe violations', async () => {
    const { container } = renderWithContext(
      <MaterialListPage
        db={INITIAL_DB}
        dispatch={mockContext.dispatch}
        onNav={() => {}}
        onDetail={() => {}}
        search={mockEmbedding.search}
      />,
    );
    const results = await axe(container, AXE_OPTIONS);
    expect(results).toHaveNoViolations();
  });

  it('HelpPage has no axe violations', async () => {
    const { container } = renderWithContext(<HelpPage />);
    const results = await axe(container, AXE_OPTIONS);
    expect(results).toHaveNoViolations();
  });

  it('AboutPage has no axe violations', async () => {
    const { container } = renderWithContext(<AboutPage />);
    const results = await axe(container, AXE_OPTIONS);
    expect(results).toHaveNoViolations();
  });

  it('DetailPage has no axe violations', async () => {
    const firstRecord = INITIAL_DB[0]!;
    const { container } = renderWithContext(
      <DetailPage
        db={INITIAL_DB}
        recordId={firstRecord.id}
        dispatch={mockContext.dispatch}
        onBack={() => {}}
        onEdit={() => {}}
        onNav={() => {}}
        claude={mockClaude}
        embedding={mockEmbedding}
      />,
    );
    const results = await axe(container, AXE_OPTIONS);
    expect(results).toHaveNoViolations();
  });
});
