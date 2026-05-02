// MaiML エクスポート導線をまとめたハブ。
// 既存の export 入口（DetailPage / MaterialListPage / ProjectDetailPage / TestMatrixPage）
// は引き続き各ページから動作するが、この Hub から「目的別」にナビゲートできるように
// する。実際のエクスポートは各ページの DownloadPreviewModal で実行。

import type { IconName } from '@/components/Icon';
import { Icon } from '@/components/Icon';
import { MaimlPageLayout } from './components/MaimlPageLayout';

interface MaimlExportHubPageProps {
  onNav: (page: string) => void;
}

interface ExportTile {
  title: string;
  subtitle: string;
  icon: IconName;
  destination: string;
  destinationLabel: string;
}

const TILES: ExportTile[] = [
  {
    title: '材料単体',
    subtitle: '材料データ詳細から MaiML エクスポート（単一 Material）',
    icon: 'embed',
    destination: 'list',
    destinationLabel: '材料データ一覧',
  },
  {
    title: '材料一覧（バルク）',
    subtitle: 'フィルタ済の材料データを一括 MaiML 化（複数 Material）',
    icon: 'list',
    destination: 'list',
    destinationLabel: '材料データ一覧',
  },
  {
    title: '案件バンドル',
    subtitle: '案件 + 試験片 + 試験 + 損傷を 1 ファイル化（Project + 子要素）',
    icon: 'report',
    destination: 'pjlist',
    destinationLabel: '案件一覧',
  },
  {
    title: '試験集合（マトリクス選択）',
    subtitle: '試験マトリクスのセル選択 → 単一 / 一括エクスポート',
    icon: 'scan',
    destination: 'matrix',
    destinationLabel: '試験マトリクス',
  },
];

export const MaimlExportHubPage = ({ onNav }: MaimlExportHubPageProps) => (
  <MaimlPageLayout
    title="MaiML エクスポート"
    subtitle="目的別のエクスポート導線。各画面で DownloadPreviewModal によるプレビューを挟んで安全にダウンロードできます。"
    onBackToHub={() => onNav('maiml-hub')}
  >
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
    >
      {TILES.map((tile) => (
        <button
          key={tile.title}
          type="button"
          onClick={() => onNav(tile.destination)}
          className="text-left rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4 hover:bg-[var(--hover)] focus:outline focus:outline-2 focus:outline-[var(--accent,#2563eb)] transition-colors"
          aria-label={`${tile.destinationLabel} へ移動して ${tile.title} をエクスポート`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon name={tile.icon} size={16} className="text-[var(--accent,#2563eb)]" />
            <div className="text-[14px] font-semibold">{tile.title}</div>
          </div>
          <div className="text-[11px] text-[var(--text-lo)] leading-relaxed mb-3">
            {tile.subtitle}
          </div>
          <div className="text-[11px] text-[var(--text-md)]">
            → {tile.destinationLabel}
          </div>
        </button>
      ))}
    </div>

    <div className="mt-6 text-[11px] text-[var(--text-lo)] leading-relaxed max-w-2xl">
      MaiML 出力先は将来 Repository 経由で API push できるようになる予定ですが、現状は
      ブラウザ側でのファイルダウンロードのみです。すべての出力は MaiML (JIS K 0200:2024)
      の <code className="font-mono">{`<maiml>`}</code> ルート + provenance / uncertainty を
      含む形式で round-trip 可能です。
    </div>
  </MaimlPageLayout>
);
