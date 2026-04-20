// 試験レポートドメイン。
// 案件 / 試験片 / 試験 に紐づく最終成果物。
// 本 PoC では Markdown 本文 + メタデータ保持の最小モデル。
// 将来的には版管理・レビューワークフロー・PDF 生成まで拡張。

import type { AuditInfo, ID, ISODate } from './common';

export type ReportStatus = 'draft' | 'review' | 'approved' | 'issued' | 'archived';

export type ReportKind =
  | 'test_report' // 試験報告書
  | 'damage_analysis' // 損傷解析報告書
  | 'material_certification' // 材料証明書
  | 'inspection' // 検査成績書
  | 'summary'; // サマリレポート

export interface Report extends AuditInfo {
  id: ID;
  /** レポートコード (例: RPT-2026-0001) */
  code: string;
  title: string;
  titleEn: string;
  kind: ReportKind;
  status: ReportStatus;
  /** 関連案件 (多くの場合必須、単独レポートは null) */
  projectId: ID | null;
  /** 関連試験 (test_report / damage_analysis では基本必須) */
  testIds: ID[];
  /** 関連試験片 */
  specimenIds: ID[];
  /** 関連損傷所見 */
  damageIds: ID[];
  /** 発行日 (approved/issued 以降) */
  issuedAt: ISODate | null;
  /** 作成担当者 */
  authorId: ID;
  /** レビュアー (任意) */
  reviewerId: ID | null;
  /** 承認者 (任意) */
  approverId: ID | null;
  /** Markdown 本文（見出し・表・コードブロック可） */
  body: string;
  /** 要約 (一覧カード用) */
  summary: string;
  /** タグ（業種・検査種別などのフリー） */
  tags: string[];
}

export interface CreateReportInput {
  code?: string;
  title: string;
  titleEn?: string;
  kind: ReportKind;
  projectId?: ID | null;
  testIds?: ID[];
  specimenIds?: ID[];
  damageIds?: ID[];
  authorId: ID;
  body: string;
  summary: string;
  tags?: string[];
}

export type UpdateReportInput = Partial<CreateReportInput> & {
  status?: ReportStatus;
  reviewerId?: ID | null;
  approverId?: ID | null;
  issuedAt?: ISODate | null;
};
