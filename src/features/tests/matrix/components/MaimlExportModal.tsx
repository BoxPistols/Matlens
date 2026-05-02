// MaimlExportModal — 試験集合（1〜N 件）を MaiML 形式で出力する確認モーダル。
// マトリクスのセル選択ドリルから単独 / 一括の両用途で使う。
//
// `tests === null` の間は何も描画しない。表示時のみ XML を組み立てる。

import { useMemo } from 'react';
import type { DamageFinding, Specimen, Test } from '@/domain/types';
import { DownloadPreviewModal } from '@/components/molecules';
import { downloadMaimlFile } from '@/services/maiml';
import {
  defaultTestSetMaimlFilename,
  serializeTestSetToMaiml,
} from '@/services/maimlProject';

interface MaimlExportModalProps {
  /** null のときはモーダル非表示。配列のときに開く */
  tests: Test[] | null;
  /** ドキュメント識別ラベル。ファイル名 slug にも使われる */
  label: string;
  /** 試験から逆引き対象となる試験片マスタ（全件渡しても OK） */
  allSpecimens: Specimen[];
  /** 試験に紐づく損傷所見マスタ（全件渡しても OK） */
  allDamages: DamageFinding[];
  onClose: () => void;
}

export const MaimlExportModal = ({
  tests,
  label,
  allSpecimens,
  allDamages,
  onClose,
}: MaimlExportModalProps) => {
  const open = tests !== null;

  // モーダルが開いている時だけ XML を組み立てる（重い処理を避ける）。
  const bundle = useMemo(() => {
    if (!tests) return null;
    const specimenIds = new Set(tests.map((t) => t.specimenId));
    const testIds = new Set(tests.map((t) => t.id));
    const specimens = allSpecimens.filter((s) => specimenIds.has(s.id));
    const damages = allDamages.filter((d) => d.testId && testIds.has(d.testId));
    return { label, specimens, tests, damages };
  }, [tests, label, allSpecimens, allDamages]);

  const xml = useMemo(() => {
    if (!open || !bundle) return '';
    return serializeTestSetToMaiml(bundle);
  }, [open, bundle]);

  const filename = useMemo(() => defaultTestSetMaimlFilename(label || 'test-set'), [label]);

  if (!open || !bundle) return null;

  return (
    <DownloadPreviewModal
      open={open}
      onClose={onClose}
      onConfirm={() => {
        downloadMaimlFile(serializeTestSetToMaiml(bundle), filename);
        onClose();
      }}
      title={`MaiML エクスポート プレビュー（${tests?.length === 1 ? '単一試験' : '試験集合'}）`}
      filename={filename}
      content={xml}
      language="xml"
      description={`「${label}」に含まれる ${tests?.length ?? 0} 件の試験を MaiML (JIS K 0200:2024) 形式で書き出します。`}
    />
  );
};
