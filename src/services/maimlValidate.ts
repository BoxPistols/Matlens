// MaiML 検証ロジック（純関数）。
// 完全な XSD 検証ではなく、Matlens 運用上重要な「規約準拠 + provenance /
// uncertainty 必須項目」を中心にした意味的検証。
//
// 完全な XSD 検証が必要な場合は CI で `xmllint --schema` を回す前提。
// 本モジュールはブラウザ・Nuxt SSR 双方で動かすため `DOMParser` を引数注入式にし、
// 純関数として呼び出し側からテストできるようにしている。

export type IssueSeverity = 'error' | 'warn' | 'info';

export interface MaimlIssue {
  severity: IssueSeverity;
  code: string;
  message: string;
}

export interface MaimlValidationReport {
  documentKind: string | null;
  generatedAt: string | null;
  source: string | null;
  issues: MaimlIssue[];
  /** 全件のうち error の数 */
  errorCount: number;
  /** 全件のうち warn の数 */
  warnCount: number;
  /** 全件のうち info の数（参考情報、ヒント） */
  infoCount: number;
}

const MAX_BYTES = 10 * 1024 * 1024;

/** ブラウザの DOMParser を引数注入できるようにする（SSR 互換用） */
export type ParseXml = (xml: string) => Document;

const defaultParse: ParseXml = (xml) => {
  const parser = new DOMParser();
  return parser.parseFromString(xml, 'application/xml');
};

/**
 * MaiML 文字列を検証し、issue 一覧と header メタを返す純関数。
 * パースに失敗した時点で error を 1 件だけ返して即終了する。
 */
export function validateMaiml(xml: string, parseXml: ParseXml = defaultParse): MaimlValidationReport {
  const issues: MaimlIssue[] = [];
  const empty: MaimlValidationReport = {
    documentKind: null,
    generatedAt: null,
    source: null,
    issues,
    errorCount: 0,
    warnCount: 0,
    infoCount: 0,
  };

  if (!xml || !xml.trim()) {
    issues.push({ severity: 'error', code: 'empty', message: 'XML 本文が空です' });
    return finalize(empty, issues);
  }
  if (xml.length > MAX_BYTES) {
    issues.push({
      severity: 'error',
      code: 'too-large',
      message: `ファイルサイズが上限 ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB を超えています`,
    });
    return finalize(empty, issues);
  }
  if (/<!DOCTYPE/i.test(xml)) {
    issues.push({
      severity: 'error',
      code: 'doctype-forbidden',
      message: 'DOCTYPE 宣言は受け付けません（Billion Laughs / XXE 防御）',
    });
    return finalize(empty, issues);
  }

  let doc: Document;
  try {
    doc = parseXml(xml);
  } catch (e) {
    issues.push({ severity: 'error', code: 'parse-failed', message: `パース失敗: ${(e as Error).message}` });
    return finalize(empty, issues);
  }

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    issues.push({ severity: 'error', code: 'parse-error', message: 'XML パースエラー（要素 <parsererror> あり）' });
    return finalize(empty, issues);
  }

  const root = doc.documentElement;
  if (!root || root.localName !== 'maiml') {
    issues.push({ severity: 'error', code: 'root-not-maiml', message: 'ルート要素が <maiml> ではありません' });
    return finalize(empty, issues);
  }

  // header の存在確認
  const header = root.getElementsByTagName('header')[0] ?? null;
  if (!header) {
    issues.push({ severity: 'error', code: 'header-missing', message: '<header> 要素が見つかりません' });
  }

  const headerProps = collectProperties(header);
  const generatedAt = headerProps.generatedAt || null;
  const source = headerProps.source || null;
  const documentKind = headerProps.documentKind || null;

  if (!generatedAt) {
    issues.push({ severity: 'warn', code: 'header-generatedAt-missing', message: 'header.generatedAt が未設定（追跡性の観点で推奨）' });
  } else if (!/^\d{4}-\d{2}-\d{2}T/.test(generatedAt)) {
    issues.push({ severity: 'warn', code: 'header-generatedAt-format', message: `header.generatedAt が ISO 8601 形式ではない可能性: "${generatedAt}"` });
  }
  if (!source) {
    issues.push({ severity: 'info', code: 'header-source-missing', message: 'header.source（出力元）の指定を推奨' });
  }
  if (!documentKind) {
    issues.push({ severity: 'warn', code: 'header-documentKind-missing', message: 'header.documentKind（material / project-bundle / test-set）の指定を推奨' });
  }

  // 主要ブロックの少なくとも 1 つを期待
  const hasMaterials = root.getElementsByTagName('material').length > 0;
  const hasProjects = root.getElementsByTagName('project').length > 0;
  const hasTests = root.getElementsByTagName('test').length > 0;
  if (!hasMaterials && !hasProjects && !hasTests) {
    issues.push({ severity: 'warn', code: 'no-data-block', message: '<material> / <project> / <test> のいずれも見つかりません' });
  }

  // result 要素の provenance / uncertainty 必須チェック
  const results = Array.from(root.getElementsByTagName('result'));
  for (const r of results) {
    const props = collectProperties(r);
    const sampleRef = r.getAttribute('sampleRef') ?? r.getAttribute('id') ?? '(no-id)';
    if (!props.uncertainty && !r.getAttribute('uncertainty')) {
      issues.push({
        severity: 'warn',
        code: 'result-uncertainty-missing',
        message: `<result ${sampleRef}> に uncertainty（不確かさ）が未設定`,
      });
    }
  }

  // material / test に provenance プロパティが推奨される（情報レベル）
  const materials = Array.from(root.getElementsByTagName('material'));
  for (const m of materials) {
    const props = collectProperties(m);
    if (!props.AiDetected && !props.Author && !props.RegisteredOn) {
      issues.push({
        severity: 'info',
        code: 'material-provenance-thin',
        message: `<material ${m.getAttribute('id') ?? ''}> に Author / RegisteredOn / AiDetected が無く provenance 情報が薄い`,
      });
    }
  }

  return finalize({ documentKind, generatedAt, source, issues, errorCount: 0, warnCount: 0, infoCount: 0 }, issues);
}

function finalize(report: MaimlValidationReport, issues: MaimlIssue[]): MaimlValidationReport {
  return {
    ...report,
    issues,
    errorCount: issues.filter((i) => i.severity === 'error').length,
    warnCount: issues.filter((i) => i.severity === 'warn').length,
    infoCount: issues.filter((i) => i.severity === 'info').length,
  };
}

function collectProperties(parent: Element | null): Record<string, string> {
  const map: Record<string, string> = {};
  if (!parent) return map;
  for (const child of Array.from(parent.children)) {
    if (child.localName !== 'property') continue;
    const key = child.getAttribute('key');
    if (!key) continue;
    map[key] = child.textContent?.trim() ?? '';
  }
  return map;
}
