// 切削条件エクスプローラ (Signature Screen / #48 PR-2)
// 3 ペイン構成:
//   左:  フィルタ (母材 / 工具種別 / 加工種別 / びびり)
//   中:  Vc × f 散布図 (点クリックで中央ペイン下部に条件詳細)
//   右:  選択プロセスの詳細 (工具情報・代表値・波形プレビュー概要)

import { useMemo, useState } from 'react';
import type {
  MachiningOperation,
  ToolType,
} from '@/domain/types';
import type { CuttingProcessQuery } from '@/infra/repositories/interfaces';
import { ConditionScatter } from './components/ConditionScatter';
import type {
  ScatterAxisKey,
  ScatterColorMode,
} from './components/scatterMappings';
import { KcEstimatePanel } from './components/KcEstimatePanel';
import { StabilityLobePanel } from './components/StabilityLobePanel';
import { WaveformViewer } from './components/WaveformViewer';
import {
  useCuttingMaterials,
  useCuttingProcesses,
  useTools,
  useProcessWaveforms,
} from './api';

const OPERATION_OPTIONS: { value: MachiningOperation; label: string }[] = [
  { value: 'turning', label: '旋削' },
  { value: 'milling_face', label: '正面削り' },
  { value: 'milling_peripheral', label: '側面削り' },
  { value: 'milling_5axis', label: '同時 5 軸' },
  { value: 'drilling', label: 'ドリル' },
];

const TOOL_TYPE_OPTIONS: { value: ToolType; label: string }[] = [
  { value: 'end_mill', label: 'エンドミル' },
  { value: 'ball_mill', label: 'ボール' },
  { value: 'face_mill', label: '正面フライス' },
  { value: 'insert_turning', label: '旋削インサート' },
  { value: 'insert_milling', label: 'ミーリングインサート' },
  { value: 'drill', label: 'ドリル' },
];

type ChatterFilter = 'any' | 'chatter' | 'stable';

const AXIS_OPTIONS: { value: ScatterAxisKey; label: string }[] = [
  { value: 'cuttingSpeed', label: 'Vc' },
  { value: 'feed', label: 'f' },
  { value: 'depthOfCut', label: 'ap' },
];

const COLOR_MODE_OPTIONS: { value: ScatterColorMode; label: string }[] = [
  { value: 'chatter', label: 'びびり有無' },
  { value: 'toolWear', label: '工具摩耗 VB' },
  { value: 'surfaceRoughness', label: '表面粗さ Ra' },
];

export const CuttingConditionsExplorerPage = () => {
  const [materialId, setMaterialId] = useState<string | ''>('');
  const [opSet, setOpSet] = useState<Set<MachiningOperation>>(new Set());
  const [toolTypeSet, setToolTypeSet] = useState<Set<ToolType>>(new Set());
  const [chatter, setChatter] = useState<ChatterFilter>('any');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [xAxisKey, setXAxisKey] = useState<ScatterAxisKey>('cuttingSpeed');
  const [yAxisKey, setYAxisKey] = useState<ScatterAxisKey>('feed');
  const [colorMode, setColorMode] = useState<ScatterColorMode>('chatter');

  const query = useMemo<CuttingProcessQuery>(() => {
    const filter: CuttingProcessQuery['filter'] = {};
    if (materialId) filter.materialId = materialId;
    if (opSet.size > 0) filter.operations = Array.from(opSet);
    if (chatter === 'chatter') filter.chatterDetected = true;
    if (chatter === 'stable') filter.chatterDetected = false;
    // 全件俯瞰用途のため、fixture 規模 (1,300 件超) を余裕をもって超える上限を指定する
    return { filter, pageSize: 2000 };
  }, [materialId, opSet, chatter]);

  const {
    data: processesData,
    isLoading: processesLoading,
    isError: processesError,
  } = useCuttingProcesses(query);
  const {
    data: materialsData,
    isLoading: materialsLoading,
    isError: materialsError,
  } = useCuttingMaterials();
  // 工具マスタは pageSize を大きめに取り、クライアント側 in-memory フィルタが取り漏らさないようにする
  const {
    data: toolsData,
    isLoading: toolsLoading,
    isError: toolsError,
  } = useTools({ pageSize: 500 });

  // 工具種別フィルタはクライアント側（Repository インターフェースが ToolType
  // 配列を受けていないため、PR-1 との互換のため in-memory で絞る）
  const filteredProcesses = useMemo(() => {
    if (!processesData || !toolsData) return [];
    if (toolTypeSet.size === 0) return processesData.items;
    const toolById = new Map(toolsData.items.map((t) => [t.id, t]));
    return processesData.items.filter((p) => {
      const tool = toolById.get(p.toolId);
      return tool ? toolTypeSet.has(tool.type) : false;
    });
  }, [processesData, toolsData, toolTypeSet]);

  const chatterCount = useMemo(
    () => filteredProcesses.filter((p) => p.chatterDetected === true).length,
    [filteredProcesses]
  );

  const selected = selectedId
    ? filteredProcesses.find((p) => p.id === selectedId) ?? null
    : null;
  const selectedTool = selected && toolsData
    ? toolsData.items.find((t) => t.id === selected.toolId) ?? null
    : null;
  const selectedMaterial = selected && materialsData
    ? materialsData.find((m) => m.id === selected.materialId) ?? null
    : null;
  const { data: waveforms } = useProcessWaveforms(selectedId);

  const toggleOp = (op: MachiningOperation) => {
    setOpSet((prev) => {
      const next = new Set(prev);
      if (next.has(op)) next.delete(op);
      else next.add(op);
      return next;
    });
    setSelectedId(null);
  };

  const toggleToolType = (tt: ToolType) => {
    setToolTypeSet((prev) => {
      const next = new Set(prev);
      if (next.has(tt)) next.delete(tt);
      else next.add(tt);
      return next;
    });
    setSelectedId(null);
  };

  if (processesError || materialsError || toolsError) {
    return (
      <div className="p-6 text-[var(--err,#dc2626)]">
        切削条件の読み込みに失敗しました。時間をおいて再度お試しください。
      </div>
    );
  }

  if (processesLoading || materialsLoading || toolsLoading || !processesData) {
    return (
      <div className="p-6">
        <div className="text-[var(--text-lo)]">切削条件を読み込んでいます…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <h1 className="text-xl font-bold">切削条件エクスプローラ</h1>
        <p className="text-[13px] text-[var(--text-lo)] mt-1">
          過去の切削加工を 切削速度 × 送り の散布図で俯瞰し、びびり発生点・安定点を見比べながら次条件の当たりをつけます。
        </p>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* 左: フィルタ */}
        <aside
          className="w-56 border-r border-[var(--border-faint)] p-4 overflow-auto bg-[var(--bg-raised)]"
          aria-label="切削条件フィルタ"
        >
          <div className="flex flex-col gap-4 text-[13px]">
            <div>
              <div className="text-[11px] font-semibold text-[var(--text-lo)] mb-1">
                母材
              </div>
              <select
                value={materialId}
                onChange={(e) => {
                  setMaterialId(e.target.value);
                  setSelectedId(null);
                }}
                className="w-full px-2 py-1.5 rounded border border-[var(--border-faint)] bg-transparent text-[13px]"
              >
                <option value="">すべて</option>
                {materialsData?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.designation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-[var(--text-lo)] mb-1">
                加工種別
              </div>
              <div className="flex flex-col gap-1">
                {OPERATION_OPTIONS.map((op) => (
                  <label
                    key={op.value}
                    className="flex items-center gap-2 text-[12px]"
                  >
                    <input
                      type="checkbox"
                      checked={opSet.has(op.value)}
                      onChange={() => toggleOp(op.value)}
                    />
                    {op.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-[var(--text-lo)] mb-1">
                工具種別
              </div>
              <div className="flex flex-col gap-1">
                {TOOL_TYPE_OPTIONS.map((tt) => (
                  <label
                    key={tt.value}
                    className="flex items-center gap-2 text-[12px]"
                  >
                    <input
                      type="checkbox"
                      checked={toolTypeSet.has(tt.value)}
                      onChange={() => toggleToolType(tt.value)}
                    />
                    {tt.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-[var(--text-lo)] mb-1">
                びびり振動
              </div>
              <div className="flex flex-col gap-1">
                {(
                  [
                    { v: 'any', l: 'すべて' },
                    { v: 'chatter', l: 'びびり検出のみ' },
                    { v: 'stable', l: '安定のみ' },
                  ] as { v: ChatterFilter; l: string }[]
                ).map((o) => (
                  <label
                    key={o.v}
                    className="flex items-center gap-2 text-[12px]"
                  >
                    <input
                      type="radio"
                      name="chatter"
                      checked={chatter === o.v}
                      onChange={() => {
                        setChatter(o.v);
                        setSelectedId(null);
                      }}
                    />
                    {o.l}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* 中央: 散布図 */}
        <section className="flex-1 overflow-auto p-4" aria-label="散布図">
          <div className="mb-3 flex items-center gap-3 flex-wrap text-[12px] text-[var(--text-lo)]">
            <span>
              表示中 {filteredProcesses.length} 件 / びびり {chatterCount} 件
            </span>
            <div className="flex items-center gap-1">
              <span>X 軸:</span>
              <select
                value={xAxisKey}
                onChange={(e) => setXAxisKey(e.target.value as ScatterAxisKey)}
                aria-label="散布図 X 軸"
                className="px-1.5 py-0.5 rounded border border-[var(--border-faint)] bg-transparent"
              >
                {AXIS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span>Y 軸:</span>
              <select
                value={yAxisKey}
                onChange={(e) => setYAxisKey(e.target.value as ScatterAxisKey)}
                aria-label="散布図 Y 軸"
                className="px-1.5 py-0.5 rounded border border-[var(--border-faint)] bg-transparent"
              >
                {AXIS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span>色分け:</span>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as ScatterColorMode)}
                aria-label="散布図 色分けモード"
                className="px-1.5 py-0.5 rounded border border-[var(--border-faint)] bg-transparent"
              >
                {COLOR_MODE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {selected && (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="underline"
              >
                選択を解除
              </button>
            )}
          </div>
          {filteredProcesses.length === 0 ? (
            <div className="text-[var(--text-lo)] p-6">
              該当する加工プロセスがありません。フィルタを緩めてください。
            </div>
          ) : (
            <ConditionScatter
              processes={filteredProcesses}
              selectedId={selectedId}
              onSelect={setSelectedId}
              xAxisKey={xAxisKey}
              yAxisKey={yAxisKey}
              colorMode={colorMode}
            />
          )}
        </section>

        {/* 右: 詳細 */}
        <aside
          className="w-80 border-l border-[var(--border-faint)] p-4 overflow-auto bg-[var(--bg-raised)]"
          aria-label="選択プロセス詳細"
        >
          {!selected ? (
            <div className="text-[13px] text-[var(--text-lo)]">
              散布図から点を選ぶと、工具・条件・代表値の詳細が表示されます。
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-[13px]">
              <div>
                <div className="text-[11px] text-[var(--text-lo)]">工程</div>
                <div className="font-mono font-semibold">{selected.code}</div>
                <div className="text-[11px] text-[var(--text-lo)]">
                  {selected.operation}
                </div>
              </div>

              {selectedTool && (
                <div>
                  <div className="text-[11px] text-[var(--text-lo)]">工具</div>
                  <div className="font-medium">{selectedTool.name}</div>
                  <div className="text-[11px] text-[var(--text-lo)]">
                    {selectedTool.code} / φ{selectedTool.diameter} /{' '}
                    {selectedTool.material}
                    {selectedTool.coating ? ` / ${selectedTool.coating}` : ''}
                  </div>
                </div>
              )}

              {selectedMaterial && (
                <div>
                  <div className="text-[11px] text-[var(--text-lo)]">母材</div>
                  <div className="font-mono">{selectedMaterial.designation}</div>
                </div>
              )}

              <div className="border-t border-[var(--border-faint)] pt-3">
                <div className="text-[11px] text-[var(--text-lo)] mb-1">
                  切削条件
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
                  <dt className="text-[var(--text-lo)]">Vc</dt>
                  <dd className="font-mono text-right">
                    {selected.condition.cuttingSpeed.toFixed(1)} m/min
                  </dd>
                  <dt className="text-[var(--text-lo)]">送り f</dt>
                  <dd className="font-mono text-right">
                    {selected.condition.feed.toFixed(3)}{' '}
                    {selected.condition.feedUnit}
                  </dd>
                  <dt className="text-[var(--text-lo)]">切込 ap</dt>
                  <dd className="font-mono text-right">
                    {selected.condition.depthOfCut.toFixed(2)} mm
                  </dd>
                  {selected.condition.widthOfCut !== null && (
                    <>
                      <dt className="text-[var(--text-lo)]">切削幅 ae</dt>
                      <dd className="font-mono text-right">
                        {selected.condition.widthOfCut.toFixed(2)} mm
                      </dd>
                    </>
                  )}
                  <dt className="text-[var(--text-lo)]">主軸</dt>
                  <dd className="font-mono text-right">
                    {selected.condition.spindleSpeed} rpm
                  </dd>
                  <dt className="text-[var(--text-lo)]">冷却</dt>
                  <dd className="font-mono text-right">
                    {selected.condition.coolant}
                  </dd>
                </dl>
              </div>

              <div className="border-t border-[var(--border-faint)] pt-3">
                <div className="text-[11px] text-[var(--text-lo)] mb-1">
                  代表値
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
                  {selected.cuttingForceFc !== null && (
                    <>
                      <dt className="text-[var(--text-lo)]">切削抵抗 Fc</dt>
                      <dd className="font-mono text-right">
                        {selected.cuttingForceFc.toFixed(1)} N
                      </dd>
                    </>
                  )}
                  {selected.cuttingTemperatureC !== null && (
                    <>
                      <dt className="text-[var(--text-lo)]">切削温度</dt>
                      <dd className="font-mono text-right">
                        {selected.cuttingTemperatureC.toFixed(1)} ℃
                      </dd>
                    </>
                  )}
                  {selected.surfaceRoughnessRa !== null && (
                    <>
                      <dt className="text-[var(--text-lo)]">表面粗さ Ra</dt>
                      <dd className="font-mono text-right">
                        {selected.surfaceRoughnessRa.toFixed(3)} µm
                      </dd>
                    </>
                  )}
                  {selected.toolWearVB !== null && (
                    <>
                      <dt className="text-[var(--text-lo)]">工具摩耗 VB</dt>
                      <dd className="font-mono text-right">
                        {selected.toolWearVB.toFixed(3)} mm
                      </dd>
                    </>
                  )}
                  <dt className="text-[var(--text-lo)]">加工時間</dt>
                  <dd className="font-mono text-right">
                    {selected.machiningTimeSec} s
                  </dd>
                  <dt className="text-[var(--text-lo)]">切削距離</dt>
                  <dd className="font-mono text-right">
                    {selected.cuttingDistanceMm.toLocaleString()} mm
                  </dd>
                </dl>
                {selected.chatterDetected === true && (
                  <div className="mt-2 px-2 py-1 rounded bg-[rgba(239,68,68,0.14)] text-[12px] text-[var(--err,#dc2626)]">
                    この条件ではびびり振動が検出されました。
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--border-faint)] pt-3">
                <div className="text-[11px] text-[var(--text-lo)] mb-2">
                  Kienzle 切削抵抗モデル見積
                </div>
                <KcEstimatePanel process={selected} tool={selectedTool} />
              </div>

              <div className="border-t border-[var(--border-faint)] pt-3">
                <div className="text-[11px] text-[var(--text-lo)] mb-2">
                  Stability Lobe (Altintas 2012 近似)
                </div>
                <StabilityLobePanel process={selected} tool={selectedTool} />
              </div>

              {waveforms && waveforms.length > 0 && (
                <div className="border-t border-[var(--border-faint)] pt-3">
                  <div className="text-[11px] text-[var(--text-lo)] mb-2">
                    波形サンプル ({waveforms.length} ch)
                  </div>
                  <WaveformViewer samples={waveforms} />
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
