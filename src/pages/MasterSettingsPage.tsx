import { Icon } from '../components/Icon';
import { Badge, SectionCard, ProgressBar } from '../components/atoms';
import type { Material } from '../types';

interface MasterSettingsPageProps {
  db: Material[];
}

export const MasterSettingsPage = ({ db }: MasterSettingsPageProps) => {
  const CATEGORIES = ['金属合金','セラミクス','ポリマー','複合材料'];
  const STATUSES   = ['登録済','レビュー待','承認済','要修正'];
  const BATCHES    = [...new Set(db.map(r => r.batch))].sort().reverse();
  const AUTHORS    = [...new Set(db.map(r => r.author))].sort();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight">マスタ管理</h1>
          <p className="text-[12px] text-text-lo mt-0.5">
            カテゴリ・ステータス・バッチ・担当者などのマスタデータを確認します
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--warn-dim)] border border-[var(--warn)] text-warn text-[12px] font-semibold">
          <Icon name="warning" size={13} />
          PoC フェーズ — 編集機能は本番実装で追加予定
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* カテゴリマスタ */}
        <SectionCard title="カテゴリ マスタ">
          {CATEGORIES.map(cat => {
            const count = db.filter(r => r.cat === cat).length;
            return (
              <div key={cat} className="flex items-center gap-3 py-2 border-b border-[var(--border-faint)] last:border-b-0">
                <Badge variant="gray">{cat}</Badge>
                <div className="flex-1">
                  <ProgressBar value={Math.round(count / db.length * 100)} color="var(--accent)" />
                </div>
                <span className="text-[12px] text-text-lo font-mono w-10 text-right">{count}件</span>
              </div>
            );
          })}
        </SectionCard>

        {/* ステータスマスタ */}
        <SectionCard title="ステータス マスタ">
          {[
            {s:'登録済', color:'var(--accent)', desc:'新規登録・未レビュー'},
            {s:'レビュー待', color:'var(--warn)', desc:'担当者によるレビュー待ち'},
            {s:'承認済', color:'var(--ok)', desc:'承認完了・参照可能'},
            {s:'要修正', color:'var(--err)', desc:'修正依頼あり・再登録が必要'},
          ].map(({s, color, desc}) => {
            const count = db.filter(r => r.status === s).length;
            return (
              <div key={s} className="flex items-center gap-3 py-2 border-b border-[var(--border-faint)] last:border-b-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background: color}} />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-text-hi">{s}</div>
                  <div className="text-[11px] text-text-lo">{desc}</div>
                </div>
                <Badge>{s}</Badge>
                <span className="text-[12px] text-text-lo font-mono w-8 text-right">{count}</span>
              </div>
            );
          })}
        </SectionCard>

        {/* バッチマスタ */}
        <SectionCard title="バッチ マスタ">
          <div className="max-h-48 overflow-y-auto">
            {BATCHES.map(batch => {
              const count = db.filter(r => r.batch === batch).length;
              return (
                <div key={batch} className="flex items-center gap-3 py-1.5 border-b border-[var(--border-faint)] last:border-b-0 text-[13px]">
                  <span className="font-mono text-accent">{batch}</span>
                  <div className="flex-1">
                    <ProgressBar value={Math.round(count / db.length * 100)} color="var(--accent)" />
                  </div>
                  <span className="text-[12px] text-text-lo font-mono w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* 担当者マスタ */}
        <SectionCard title="担当者 マスタ">
          {AUTHORS.map(author => {
            const count = db.filter(r => r.author === author).length;
            return (
              <div key={author} className="flex items-center gap-3 py-2 border-b border-[var(--border-faint)] last:border-b-0">
                <div className="w-7 h-7 rounded-full bg-accent-dim text-accent flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                  {author.slice(0,1)}
                </div>
                <span className="text-[13px] font-semibold flex-1">{author}</span>
                <span className="text-[12px] text-text-lo font-mono">{count}件担当</span>
              </div>
            );
          })}
        </SectionCard>
      </div>

      {/* 本番実装で追加予定の機能 */}
      <SectionCard title="本番実装で追加予定の機能">
        <div className="grid grid-cols-3 gap-3">
          {[
            ['カテゴリの追加・削除・並び替え','カスタムカテゴリと階層管理'],
            ['ステータスワークフローの編集','承認フローのカスタマイズ'],
            ['バッチの管理・一括インポート','CSVバルクインポートとバッチ管理'],
            ['担当者・権限管理','ロールベースアクセス制御（RBAC）'],
            ['通知設定','レビュー待ち・期限切れの通知'],
            ['データ保持ポリシー','自動アーカイブ・削除ルール'],
          ].map(([title, desc]) => (
            <div key={title} className="bg-raised border border-[var(--border-faint)] rounded-md p-3 opacity-60">
              <Icon name="settings" size={14} className="text-text-lo mb-1.5" />
              <div className="text-[12px] font-bold text-text-hi">{title}</div>
              <div className="text-[11px] text-text-lo mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
