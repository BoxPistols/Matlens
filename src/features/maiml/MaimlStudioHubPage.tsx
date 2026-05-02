// MaiML Studio のランディングページ。
// 5 サブ画面 (Import / Export / Inspect / Validate / Diff) のカード一覧 +
// MaiML が何かを 1 段落で説明 + 直近のローカル履歴を表示する。
//
// MaiML はクライアントの存在理由（JIS K 0200:2024 に準拠したラボ相互運用
// フォーマット）であり、export 機能の 1 つではなくアプリのコア要素である
// ことを最初に印象付ける役割。

import type { IconName } from '@/components/Icon';
import { Icon } from '@/components/Icon';

interface MaimlStudioHubPageProps {
  onNav: (page: string) => void;
}

interface StudioCard {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  badge?: string;
}

const CARDS: StudioCard[] = [
  {
    id: 'maiml-import',
    title: 'インポート',
    subtitle: 'MaiML / XML ファイルを取り込む。3 段階（drop → preview → commit）で必ず止める',
    icon: 'plus',
  },
  {
    id: 'maiml-export',
    title: 'エクスポート',
    subtitle: '材料・案件・試験集合の MaiML 書き出し導線をここに集約',
    icon: 'embed',
  },
  {
    id: 'maiml-inspect',
    title: 'インスペクト',
    subtitle: 'MaiML XML を整形・強調表示し、構造を素早く把握',
    icon: 'scan',
  },
  {
    id: 'maiml-validate',
    title: 'バリデート',
    subtitle: 'XSD + provenance / uncertainty 必須項目チェック',
    icon: 'check',
    badge: 'WIP',
  },
  {
    id: 'maiml-diff',
    title: 'Diff',
    subtitle: '2 つの MaiML ファイルを構造比較',
    icon: 'similar',
    badge: 'WIP',
  },
];

export const MaimlStudioHubPage = ({ onNav }: MaimlStudioHubPageProps) => (
  <div className="flex flex-col h-full overflow-hidden">
    <header className="px-6 py-4 border-b border-[var(--border-faint)]">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">MaiML Studio</h1>
        <span className="text-[10px] font-bold tracking-[.08em] uppercase px-2 py-0.5 rounded bg-[var(--accent-dim)] text-[var(--accent,#2563eb)]">
          CORE
        </span>
      </div>
      <p className="text-[13px] text-[var(--text-lo)] mt-1">
        MaiML (JIS K 0200:2024) は分析化学・材料試験の計測データを記述する XML 標準フォーマットです。
        Matlens の中核は MaiML の入出力にあり、本 Studio から全ての MaiML 操作を行います。
      </p>
    </header>

    <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
      <section
        aria-label="MaiML Studio サブ機能"
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
      >
        {CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onNav(card.id)}
            className="text-left rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4 hover:bg-[var(--hover)] focus:outline focus:outline-2 focus:outline-[var(--accent,#2563eb)] transition-colors"
            aria-label={`${card.title} へ移動`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <Icon name={card.icon} size={18} className="text-[var(--accent,#2563eb)]" />
              {card.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-sunken)] text-[var(--text-lo)]">
                  {card.badge}
                </span>
              )}
            </div>
            <div className="text-[14px] font-semibold mb-1">{card.title}</div>
            <div className="text-[11px] text-[var(--text-lo)] leading-relaxed">
              {card.subtitle}
            </div>
          </button>
        ))}
      </section>

      <section
        aria-label="MaiML について"
        className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4"
      >
        <h2 className="text-[14px] font-semibold mb-2">MaiML とは</h2>
        <ul className="text-[12px] leading-relaxed list-disc list-inside text-[var(--text-md)] flex flex-col gap-1">
          <li>
            <strong>規格</strong>: JIS K 0200:2024 / 日本分析機器工業会（JAIMA）が策定した XML 規格
          </li>
          <li>
            <strong>用途</strong>: 計測データの不変表現 + provenance（出所 / 計測者 / 校正履歴）+ uncertainty（不確かさ）
          </li>
          <li>
            <strong>外部連携</strong>: ラボ計測器 / LIMS / OEM への引き渡しの標準フォーマット
          </li>
          <li>
            <strong>Matlens での扱い</strong>: 材料単体 / 試験集合 / 案件バンドル の 3 種類で round-trip
          </li>
        </ul>
      </section>
    </div>
  </div>
);
