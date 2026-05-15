// PageGuide.id → サイドバー上のセクション名 へのマッピング。
// HelpPage はガイド表示をセクションごとにグループ化するため、NAV_ITEMS
// の section 区切りを踏襲した「ガイド側の section 推定ロジック」を 1 箇所に
// 集約する。constants.ts 側に section を埋め込む選択肢もあるが、PageGuide は
// 純粋な「ガイドテキスト」コンテンツなので、ナビ構造への依存はここで吸収する。

import { NAV_ITEMS } from '../../data/constants';

export interface GuideSection {
  /** 日本語表示名 */
  label: string;
  /** 英語表示名 */
  labelEn: string;
  /** 順序（NAV_ITEMS の出現順を踏襲） */
  order: number;
}

const FALLBACK_SECTION: GuideSection = { label: 'その他', labelEn: 'Other', order: 999 };

// NAV_ITEMS を 1 度走査して id → section を作る。section ヘッダ行（id 無し）が
// 現れたら以降の id をそのセクションに割り当てる。子ナビ (children) も同様に
// 親が属するセクションに帰属させる。
function buildIdToSection(): Map<string, GuideSection> {
  const map = new Map<string, GuideSection>();
  let current: GuideSection = FALLBACK_SECTION;
  let order = 0;

  for (const item of NAV_ITEMS) {
    if (item.section) {
      current = { label: item.section, labelEn: item.sectionEn ?? item.section, order: order++ };
      continue;
    }
    if (item.id) map.set(item.id, current);
    if (item.children) {
      for (const child of item.children) {
        if (child.id) map.set(child.id, current);
      }
    }
  }
  return map;
}

const ID_TO_SECTION = buildIdToSection();

/**
 * ガイドの id からセクションを返す。
 * NAV_ITEMS にマッチしない id（独立ガイド等）は FALLBACK_SECTION。
 */
export function sectionForGuideId(guideId: string): GuideSection {
  // PAGE_GUIDES の id と NAV_ITEMS の id は同じ命名規約だが、'maiml-hub' のように
  // ガイド側で省略されているケースもあるので、prefix も試す。
  const direct = ID_TO_SECTION.get(guideId);
  if (direct) return direct;
  // maiml-* は親 'maiml-hub' のセクション（= コア）に寄せる
  if (guideId.startsWith('maiml-')) {
    return ID_TO_SECTION.get('maiml-hub') ?? FALLBACK_SECTION;
  }
  return FALLBACK_SECTION;
}

/** NAV_ITEMS に登場した全セクションを順序付きで返す（HelpPage の見出し描画用） */
export function allSectionsInOrder(): GuideSection[] {
  const seen = new Map<string, GuideSection>();
  for (const sec of ID_TO_SECTION.values()) {
    if (!seen.has(sec.label)) seen.set(sec.label, sec);
  }
  // FALLBACK は末尾に必要なら追加
  const arr = [...seen.values()].sort((a, b) => a.order - b.order);
  return arr;
}
