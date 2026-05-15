// ヘルプ・用語集ページ。
//
// 旧版はページガイドが縦に長い 1 列リストで、概要 / できること / Tips / 関連 が
// 全カードで常に展開されていてスクロールが冗長だった。
// 新設計では:
//   1) ページガイドを「カタログ（カード一覧）」として grid 表示
//   2) NAV_ITEMS のセクション (ホーム / コア / データ / 探索 / 解析 / 工程 / 情報)
//      でグループ化し、視覚的に「どの画面が何に属するか」を一目で把握
//   3) カード本体をクリックで詳細をインライン展開（同時に開くのは 1 枚）
//   4) 検索は title / titleEn / summary / features / tips を横断、ヒットしたカードを
//      自動展開して操作回数を減らす
// 用語集 (HELP_TERMS) は既に grid + 展開で良い形なので維持。

import { useContext, useMemo, useState } from 'react';
import { Icon, type IconName } from '../../components/Icon';
import { Badge, Card } from '../../components/atoms';
import { SearchBox } from '../../components/molecules';
import { AppCtx } from '../../context/AppContext';
import type { AppContextValue } from '../../types';
import { HELP_TERMS, PAGE_GUIDES } from '../../data/constants';
import type { PageGuide } from '../../data/constants';
import { urlForChapter, urlForTerm } from '../../data/glossaryMapping';
import { sectionForGuideId, allSectionsInOrder } from './sectionMap';

const GUIDE_TITLE_MAP: Record<string, string> = Object.fromEntries(
  PAGE_GUIDES.map((g) => [g.id, g.title]),
);

// 1 カードに乗せる「短い要約」: 概要文の先頭 1 文を返す（Q: 句点区切り）
function shortSummary(text: string): string {
  const match = text.match(/^(.+?[。.])/);
  return match ? match[1]! : text;
}

// 検索ヒット判定: title / titleEn / summary / features / tips すべてを横断
function guideMatchesQuery(g: PageGuide, q: string): boolean {
  if (!q) return true;
  const haystack = [
    g.title,
    g.titleEn,
    g.summary,
    g.summaryEn,
    ...g.features,
    ...g.featuresEn,
    ...g.tips,
    ...g.tipsEn,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
}

/* ---------- ガイド詳細パネル（展開時のみ描画） ---------- */

const GuideDetailPanel = ({
  guide,
  onClose,
  onNav,
}: {
  guide: PageGuide;
  onClose: () => void;
  onNav?: (page: string) => void;
}) => {
  const { t } = useContext(AppCtx) as AppContextValue;
  return (
    <div className="border-t border-[var(--border-faint)] bg-[var(--bg-sunken)] px-5 py-4 flex flex-col gap-4 text-[13px] leading-relaxed text-text-md">
      <div>
        <div className="text-[12px] font-bold text-text-lo uppercase tracking-wider mb-1">
          {t('概要', 'Overview')}
        </div>
        <p>{t(guide.summary, guide.summaryEn)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-[12px] font-bold text-text-lo uppercase tracking-wider mb-1">
            {t('できること', 'Features')}
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {guide.features.map((f, i) => (
              <li key={i}>{t(f, guide.featuresEn[i] ?? f)}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[12px] font-bold text-text-lo uppercase tracking-wider mb-1">
            {t('操作のヒント', 'Tips')}
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {guide.tips.map((tip, i) => (
              <li key={i}>{t(tip, guide.tipsEn[i] ?? tip)}</li>
            ))}
          </ul>
        </div>
      </div>

      {guide.learnMore && guide.learnMore.length > 0 && (
        <div>
          <div className="text-[12px] font-bold text-text-lo uppercase tracking-wider mb-1">
            {t('詳しく学ぶ', 'Learn More')}
          </div>
          <p className="text-[12px] text-text-lo mb-1.5">
            {t(
              '画面で扱う概念を金属加工の基礎解説サイトで学べます（外部リンク・新しいタブで開きます）。',
              'Learn the concepts in this page at the metal machining fundamentals site (external link, opens in a new tab).',
            )}
          </p>
          <ul className="flex flex-col gap-1">
            {guide.learnMore.map((link, i) => {
              const href = link.termId ? urlForTerm(link.termId) : urlForChapter(link.chapterRef);
              const key = link.termId ?? `chapter-${link.chapterRef}-${i}`;
              const label = t(link.label, link.labelEn);
              return (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(
                      `${link.label}（外部サイトで開きます）`,
                      `${link.labelEn} (opens in a new tab)`,
                    )}
                    className="inline-flex items-center gap-1 text-accent hover:underline text-[13px]"
                  >
                    <Icon name="external" size={12} ariaHidden />
                    <span>{label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
        {guide.related.length > 0 && (
          <div className="text-[12px] text-text-lo">
            {t('関連ページ:', 'Related:')}{' '}
            {guide.related.map((rid, i) => {
              const label = GUIDE_TITLE_MAP[rid] ?? rid;
              return (
                <span key={rid}>
                  {i > 0 && <span className="mx-1">|</span>}
                  {onNav ? (
                    <button className="text-accent hover:underline" onClick={() => onNav(rid)}>
                      {label}
                    </button>
                  ) : (
                    <span className="text-accent">{label}</span>
                  )}
                </span>
              );
            })}
          </div>
        )}
        <div className="ml-auto flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] text-text-lo hover:underline"
          >
            {t('閉じる', 'Close')}
          </button>
          {onNav && guide.id !== 'help' && (
            <button
              className="text-[12px] font-bold text-accent hover:underline flex items-center gap-1"
              onClick={() => onNav(guide.id)}
            >
              {t('このページを開く', 'Open this page')}
              <Icon name="chevronRight" size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- ガイドカード ---------- */

const GuideCard = ({
  guide,
  open,
  onToggle,
  onNav,
}: {
  guide: PageGuide;
  open: boolean;
  onToggle: () => void;
  onNav?: (page: string) => void;
}) => {
  const { t } = useContext(AppCtx) as AppContextValue;
  return (
    <div
      className={`rounded-xl border bg-surface overflow-hidden transition-colors ${
        open ? 'border-accent ring-1 ring-accent/40' : 'border-[var(--border-default)] hover:border-accent/60'
      }`}
      style={open ? { gridColumn: '1 / -1' } : undefined}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-hover transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Icon name={guide.icon as IconName} size={20} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-[14px] font-bold text-text-hi truncate">{t(guide.title, guide.titleEn)}</h3>
            <span className="text-[11px] text-text-lo font-mono truncate">/ {guide.titleEn}</span>
          </div>
          <p
            className="text-[12px] text-text-md leading-relaxed"
            style={
              open
                ? undefined
                : {
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }
            }
          >
            {open ? t(guide.summary, guide.summaryEn) : shortSummary(t(guide.summary, guide.summaryEn))}
          </p>
          {!open && (
            <div className="flex items-center gap-2 mt-2 text-[11px] text-text-lo">
              <span>{guide.features.length} {t('機能', 'features')}</span>
              <span>·</span>
              <span>{guide.tips.length} {t('ヒント', 'tips')}</span>
              {guide.related.length > 0 && (
                <>
                  <span>·</span>
                  <span>{guide.related.length} {t('関連', 'related')}</span>
                </>
              )}
              {guide.learnMore && guide.learnMore.length > 0 && (
                <>
                  <span>·</span>
                  <span className="text-accent">{t('学習リンク', 'Learn More')}</span>
                </>
              )}
            </div>
          )}
        </div>
        <Icon
          name={open ? 'chevronDown' : 'chevronRight'}
          size={14}
          className="text-text-lo mt-2 flex-shrink-0"
        />
      </button>
      {open && <GuideDetailPanel guide={guide} onClose={onToggle} onNav={onNav} />}
    </div>
  );
};

/* ---------- ページガイドセクション ---------- */

const PageGuideCatalog = ({
  guides,
  openId,
  onToggle,
  onNav,
}: {
  guides: PageGuide[];
  openId: string | null;
  onToggle: (id: string) => void;
  onNav?: (page: string) => void;
}) => {
  const { t } = useContext(AppCtx) as AppContextValue;

  // section ごとに分類
  const grouped = useMemo(() => {
    const map = new Map<string, { section: ReturnType<typeof sectionForGuideId>; items: PageGuide[] }>();
    for (const g of guides) {
      const sec = sectionForGuideId(g.id);
      const entry = map.get(sec.label);
      if (entry) {
        entry.items.push(g);
      } else {
        map.set(sec.label, { section: sec, items: [g] });
      }
    }
    return [...map.values()].sort((a, b) => a.section.order - b.section.order);
  }, [guides]);

  // セクション順序は NAV_ITEMS 由来で固定
  const sectionOrder = allSectionsInOrder();
  const sectionOrderKey = sectionOrder.map((s) => s.label);
  grouped.sort(
    (a, b) =>
      (sectionOrderKey.indexOf(a.section.label) === -1
        ? 999
        : sectionOrderKey.indexOf(a.section.label)) -
      (sectionOrderKey.indexOf(b.section.label) === -1
        ? 999
        : sectionOrderKey.indexOf(b.section.label)),
  );

  return (
    <div className="flex flex-col gap-6">
      {grouped.map(({ section, items }) => (
        <section key={section.label} aria-label={t(section.label, section.labelEn)}>
          <div className="flex items-baseline gap-2 mb-2">
            <h2 className="text-[12px] font-bold text-text-lo uppercase tracking-wider">
              {t(section.label, section.labelEn)}
            </h2>
            <span className="text-[11px] text-text-lo">{items.length}</span>
          </div>
          <div
            className="grid gap-2.5"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {items.map((g) => (
              <GuideCard
                key={g.id}
                guide={g}
                open={openId === g.id}
                onToggle={() => onToggle(g.id)}
                onNav={onNav}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

/* ---------- HelpPage 本体 ---------- */

export const HelpPage = ({ onNav }: { onNav?: (page: string) => void }) => {
  const { t } = useContext(AppCtx) as AppContextValue;
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null); // 用語集の展開 ID
  const [openGuideId, setOpenGuideId] = useState<string | null>(null); // ガイドの展開 ID

  const CATS = [
    { id: 'all', label: t('すべて', 'All') },
    { id: 'guide', label: t('ページガイド', 'Page Guide') },
    { id: 'mat', label: t('材料工学', 'Materials') },
    { id: 'ai', label: 'AI / ML' },
    { id: 'sys', label: t('システム', 'System') },
    { id: 'ops', label: t('操作ガイド', 'Operations') },
  ];

  const filtered = HELP_TERMS.filter(
    (term) =>
      (cat === 'all' || term.cat === cat) &&
      (!q || `${term.term} ${term.en} ${term.body}`.toLowerCase().includes(q.toLowerCase())),
  );

  const filteredGuides = useMemo(
    () => PAGE_GUIDES.filter((g) => guideMatchesQuery(g, q)),
    [q],
  );

  // 検索ヒット時、結果が 1 件ならそれを自動展開（既に他が開いていたら尊重）
  const effectiveOpenGuideId =
    q && filteredGuides.length === 1 && !openGuideId
      ? filteredGuides[0]!.id
      : openGuideId;

  const toggleGuide = (id: string) => {
    setOpenGuideId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight">ヘルプ・用語集</h1>
          <p className="text-[12px] text-text-lo mt-0.5">
            Matlens で使われる専門用語・操作ガイドのリファレンス
          </p>
        </div>
        <div style={{ width: 220 }}>
          <SearchBox value={q} onChange={setQ} placeholder="用語を検索..." />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap" role="tablist">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            role="tab"
            aria-selected={cat === c.id}
            className={`px-4 py-1.5 rounded-full text-[13px] border transition-all font-ui ${
              cat === c.id
                ? 'bg-accent text-white border-accent'
                : 'bg-surface text-text-md border-[var(--border-default)] hover:bg-hover'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {cat === 'guide' ? (
        filteredGuides.length > 0 ? (
          <PageGuideCatalog
            guides={filteredGuides}
            openId={effectiveOpenGuideId}
            onToggle={toggleGuide}
            onNav={onNav}
          />
        ) : (
          <div className="text-center py-10 text-text-lo">
            <Icon name="search" size={24} className="mx-auto mb-2 opacity-30" />
            <p>該当するガイドが見つかりません</p>
          </div>
        )
      ) : (
        <div
          className="grid gap-2.5"
          style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}
        >
          {filtered.map((term) => (
            <Card
              key={term.id}
              className={openId === term.id ? 'ring-2 ring-[var(--accent)]' : ''}
            >
              <button
                className="w-full flex items-start justify-between gap-3 p-3.5 text-left hover:bg-hover transition-colors rounded-lg"
                onClick={() => setOpenId(openId === term.id ? null : term.id)}
                aria-expanded={openId === term.id}
              >
                <div>
                  <div className="text-[14px] font-bold text-text-hi">{term.term}</div>
                  {term.en && (
                    <div className="text-[12px] text-text-lo font-mono mt-0.5">{term.en}</div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge variant={term.catVariant}>{term.catLabel}</Badge>
                  <Icon
                    name={openId === term.id ? 'chevronDown' : 'chevronRight'}
                    size={12}
                    className="text-text-lo"
                  />
                </div>
              </button>
              {openId === term.id && (
                <div className="px-3.5 pb-3.5 pt-0 text-[13px] text-text-md leading-relaxed border-t border-[var(--border-faint)] mt-0">
                  <div className="pt-3">{term.body}</div>
                  {term.related && (
                    <div className="mt-2 text-[12px] text-text-lo">
                      関連: <strong className="text-accent">{term.related}</strong>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-10 text-text-lo">
              <Icon name="search" size={24} className="mx-auto mb-2 opacity-30" />
              <p>該当する用語が見つかりません</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
