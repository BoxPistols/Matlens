import { useState, useEffect, useRef, useCallback, useContext, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Icon, type IconName } from '../../components/Icon';
import { Badge } from '../../components/atoms';
import { AppCtx } from '../../context/AppContext';
import type { Experiment, ExperimentAlert, AppContextValue } from '../../types';
import { MOCK_EXPERIMENTS, createExperimentSimulation } from '../../data/experimentMock';

Chart.register(...registerables, zoomPlugin);

// ─── 定数 ───

const STATUS_MAP: Record<string, { label: string; labelEn: string; variant: string; icon: string }> = {
  planned:     { label: '計画中',   labelEn: 'Planned',     variant: 'gray',  icon: 'info' },
  in_progress: { label: '加工中',   labelEn: 'In Progress', variant: 'warn',  icon: 'workflow' },
  completed:   { label: '完了',     labelEn: 'Completed',   variant: 'ok',    icon: 'check' },
  aborted:     { label: '中断',     labelEn: 'Aborted',     variant: 'err',   icon: 'warning' },
};

const ALERT_STYLE: Record<string, { color: string; bg: string; label: string; labelEn: string }> = {
  absolute: { color: 'var(--err)',  bg: 'var(--err-dim)',  label: '絶対値超過',     labelEn: 'Threshold' },
  spike:    { color: 'var(--warn)', bg: 'var(--warn-dim)', label: '突発的変化',     labelEn: 'Spike' },
  baseline: { color: 'var(--accent)', bg: 'var(--accent-dim)', label: 'ベースライン乖離', labelEn: 'Drift' },
};

const SEVERITY_ICON: Record<string, string> = {
  critical: 'warning',
  warning: 'info',
  info: 'help',
};

// ─── メインコンポーネント ───

interface Props {
  onNav: (page: string) => void;
}

export const ExperimentDashPage = (_props: Props) => {
  const { t } = useContext(AppCtx) as AppContextValue;

  const firstExp = MOCK_EXPERIMENTS[0]!;
  const [selectedExpId, setSelectedExpId] = useState(firstExp.experimentId);
  const selectedExp = MOCK_EXPERIMENTS.find(e => e.experimentId === selectedExpId) ?? firstExp;

  const sim = useMemo(() => createExperimentSimulation(), []);

  const MAX_VISIBLE_POINTS = 120;

  const [streamIndex, setStreamIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number>(0);
  const pendingIndex = useRef(0);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const [collapsedPhases, setCollapsedPhases] = useState<Set<number>>(new Set());
  const togglePhase = useCallback((n: number) => {
    setCollapsedPhases(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
  }, []);

  const [highlightedAlertId, setHighlightedAlertId] = useState<string | null>(null);

  const isStreaming = selectedExp.status === 'in_progress';
  const isLive = isStreaming && streamIndex < sim.downsampled.length && !paused;

  // ── ストリーミング制御 ──
  const startStream = useCallback(() => {
    streamTimerRef.current = setInterval(() => {
      pendingIndex.current = Math.min(pendingIndex.current + 1, sim.downsampled.length);
    }, 800);
    const tick = () => {
      setStreamIndex(prev => {
        if (prev >= sim.downsampled.length) {
          if (streamTimerRef.current) clearInterval(streamTimerRef.current);
          return prev;
        }
        return pendingIndex.current;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [sim.downsampled.length]);

  const stopStream = useCallback(() => {
    if (streamTimerRef.current) { clearInterval(streamTimerRef.current); streamTimerRef.current = null; }
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (!isStreaming) {
      setStreamIndex(sim.downsampled.length);
      return;
    }
    setStreamIndex(0);
    pendingIndex.current = 0;
    startStream();
    return stopStream;
  }, [isStreaming, sim.downsampled.length, startStream, stopStream]);

  const streamDone = streamIndex >= sim.downsampled.length;
  useEffect(() => {
    if (paused) {
      stopStream();
    } else if (isStreaming && !streamDone) {
      startStream();
    }
    return stopStream;
  }, [paused, isStreaming, streamDone, startStream, stopStream]);

  // ── 描画データ ──
  const chartData = useMemo(() => {
    const end = streamIndex;
    const start = Math.max(0, end - MAX_VISIBLE_POINTS);
    const visibleData = sim.downsampled.slice(start, end);
    const visibleBaseline = sim.baseline.slice(start, end);

    return {
      labels: visibleData.map(p => `${p.t.toFixed(0)}s`),
      forceRms: visibleData.map(p => p.forceRms),
      forcePeak: visibleData.map(p => p.forcePeak),
      baselineRms: visibleBaseline.map(p => p.forceRms),
      alertPoints: visibleData.map(p => p.alertId ? p.forcePeak : null) as (number | null)[],
      alertRadii: visibleData.map(p => p.alertId ? 6 : 0),
      alertIds: visibleData.map(p => p.alertId ?? null),
      total: sim.downsampled.length,
    };
  }, [streamIndex, sim]);

  const alertHighlightRadii = useMemo(() => {
    if (!highlightedAlertId) return chartData.alertRadii;
    return chartData.alertIds.map((id, i) => {
      if (id === highlightedAlertId) return 12;
      return chartData.alertRadii[i] ?? 0;
    });
  }, [highlightedAlertId, chartData]);

  // ── Chart.js ──
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      const chart = chartInstance.current;
      chart.data.labels = chartData.labels;
      if (chart.data.datasets[0]) chart.data.datasets[0].data = chartData.forceRms;
      if (chart.data.datasets[1]) chart.data.datasets[1].data = chartData.forcePeak;
      if (chart.data.datasets[2]) chart.data.datasets[2].data = chartData.baselineRms;
      if (chart.data.datasets[3]) {
        chart.data.datasets[3].data = chartData.alertPoints;
        (chart.data.datasets[3] as unknown as Record<string, unknown>).pointRadius = alertHighlightRadii;
      }
      chart.update('none');
      return;
    }

    const getV = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const accent = getV('--accent');
    const warn = getV('--warn');
    const err = getV('--err');
    const lo = getV('--text-lo');
    const bf = getV('--border-faint');

    Chart.defaults.color = lo;
    Chart.defaults.borderColor = bf;

    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: t('切削抵抗 RMS (N)', 'Cutting Force RMS (N)'),
            data: chartData.forceRms,
            borderColor: accent,
            backgroundColor: accent + '18',
            tension: 0.3,
            fill: false,
            pointRadius: 0,
            pointHitRadius: 8,
            borderWidth: 2,
            spanGaps: true,
          },
          {
            label: t('切削抵抗 Peak (N)', 'Cutting Force Peak (N)'),
            data: chartData.forcePeak,
            borderColor: warn,
            backgroundColor: 'transparent',
            tension: 0.3,
            fill: false,
            pointRadius: 0,
            borderWidth: 1.5,
            borderDash: [4, 3],
            spanGaps: true,
          },
          {
            label: t('ベースライン RMS (N)', 'Baseline RMS (N)'),
            data: chartData.baselineRms,
            borderColor: lo + '60',
            backgroundColor: lo + '10',
            tension: 0.3,
            fill: true,
            pointRadius: 0,
            borderWidth: 1,
            borderDash: [2, 2],
            spanGaps: true,
          },
          {
            label: t('アラート', 'Alert'),
            data: chartData.alertPoints,
            borderColor: 'transparent',
            backgroundColor: err,
            pointRadius: alertHighlightRadii,
            pointStyle: 'triangle',
            pointHoverRadius: 8,
            showLine: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        normalized: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 10, padding: 10, font: { size: 11 } } },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              afterBody: (items) => {
                const idx = items[0]?.dataIndex;
                if (idx == null) return '';
                const point = sim.downsampled[idx];
                if (!point?.alertId) return '';
                const alert = sim.alerts.find(a => a.id === point.alertId);
                return alert ? `⚠ ${alert.message}` : '';
              },
            },
          },
          decimation: { enabled: true, algorithm: 'lttb', samples: 80 },
          zoom: {
            pan: { enabled: true, mode: 'x' },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              drag: { enabled: true, backgroundColor: accent + '15', borderColor: accent + '60', borderWidth: 1 },
              mode: 'x',
            },
            limits: { x: { minRange: 5 } },
          },
        },
        scales: {
          y: { beginAtZero: false, grid: { color: bf }, title: { display: true, text: 'N' } },
          x: { grid: { display: false }, title: { display: true, text: t('経過時間', 'Elapsed Time') }, ticks: { maxTicksLimit: 12 } },
        },
        elements: { line: { cubicInterpolationMode: 'monotone' } },
      },
    });

    return () => {
      if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; }
    };
  }, [chartData, alertHighlightRadii, sim, t]);

  // ── アラートクリック ──
  const handleAlertClick = useCallback((alert: ExperimentAlert) => {
    setHighlightedAlertId(prev => prev === alert.id ? null : alert.id);
    if (chartInstance.current) chartInstance.current.resetZoom();
    chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleResetZoom = useCallback(() => {
    if (chartInstance.current) chartInstance.current.resetZoom();
  }, []);

  // Phase 3 D&D
  const [dragOver, setDragOver] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<string[]>([]);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setDroppedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files).map(f => f.name)]);
  }, []);

  // O(n) アラート可視判定: alertId → downsampled index のマップで高速化
  const visibleAlerts = useMemo(() => {
    const alertIndexMap = new Map<string, number>();
    for (let i = 0; i < sim.downsampled.length; i++) {
      const id = sim.downsampled[i]?.alertId;
      if (id) alertIndexMap.set(id, i);
    }
    return sim.alerts.filter(a => {
      const idx = alertIndexMap.get(a.id);
      return idx !== undefined && idx < streamIndex;
    });
  }, [sim, streamIndex]);

  const criticalCount = visibleAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = visibleAlerts.filter(a => a.severity === 'warning').length;

  // ── Phase 2: リアルタイム値 (ストリームに連動) ──
  const liveProcessData = useMemo(() => {
    if (!isLive || streamIndex === 0) {
      return {
        force: selectedExp.phase2Process.cuttingForceN,
        vibration: selectedExp.phase2Process.vibrationG,
        temperature: selectedExp.phase2Process.temperatureC,
        spindleLoad: selectedExp.phase2Process.spindleLoadPct,
      };
    }
    const point = sim.downsampled[Math.min(streamIndex - 1, sim.downsampled.length - 1)];
    if (!point) return {
      force: selectedExp.phase2Process.cuttingForceN,
      vibration: selectedExp.phase2Process.vibrationG,
      temperature: selectedExp.phase2Process.temperatureC,
      spindleLoad: selectedExp.phase2Process.spindleLoadPct,
    };
    return {
      force: point.forceRms,
      vibration: point.vibrationRms,
      temperature: point.temperatureAvg,
      spindleLoad: point.spindleLoadAvg,
    };
  }, [isLive, streamIndex, sim.downsampled, selectedExp]);

  return (
    <div className="space-y-5">
      {/* ── ヘッダー ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-text-hi tracking-tight">
            {t('加工実験ダッシュボード', 'Machining Experiment Dashboard')}
          </h1>
          <p className="text-[13px] text-text-lo mt-1">
            {t(
              'リアルタイム監視 · 3層アラート · インテリジェント・サンプリング',
              'Real-time Monitoring · 3-tier Alert · Intelligent Sampling',
            )}
          </p>
        </div>
        <select
          value={selectedExpId}
          onChange={e => setSelectedExpId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--border-default)] bg-surface text-text-hi text-[13px] font-mono cursor-pointer hover:border-[var(--accent)] transition-colors"
          aria-label={t('実験を選択', 'Select experiment')}
        >
          {MOCK_EXPERIMENTS.map(exp => (
            <option key={exp.experimentId} value={exp.experimentId}>
              {exp.experimentId} — {t(exp.experimentName, exp.experimentNameEn)}
            </option>
          ))}
        </select>
      </div>

      {/* ── 実験ステータスバー ── */}
      <ExperimentStatusBar experiment={selectedExp} t={t} />

      {/* ── メインレイアウト ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        {/* チャート領域 */}
        <div className="rounded-xl border border-[var(--border-default)] bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-faint)]">
            <h2 className="text-[14px] font-semibold text-text-hi">
              {t('切削抵抗モニター', 'Cutting Force Monitor')}
            </h2>
            <div className="flex items-center gap-2">
              {isStreaming && streamIndex < sim.downsampled.length && (
                <button
                  onClick={() => setPaused(p => !p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer ${
                    paused
                      ? 'bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'
                      : 'bg-[var(--warn-dim)] text-[var(--warn)] border border-transparent hover:border-[var(--warn)]'
                  }`}
                  aria-label={paused ? t('再開', 'Resume') : t('一時停止', 'Pause')}
                >
                  {paused ? (
                    <><Icon name="play" size={10} /> {t('再開', 'RESUME')}</>
                  ) : (
                    <><span className="w-2 h-2 rounded-full bg-[var(--warn)] motion-safe:animate-pulse" /> LIVE</>
                  )}
                </button>
              )}
              <button
                onClick={handleResetZoom}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-faint)] text-text-lo text-[11px] hover:text-text-hi hover:border-[var(--border-default)] hover:bg-hover transition-colors cursor-pointer"
                aria-label={t('ズームリセット', 'Reset zoom')}
                title={t('ドラッグ: ズーム / ホイール: 拡大縮小 / パン: 左右ドラッグ', 'Drag: zoom / Wheel: scale / Pan: drag')}
              >
                <Icon name="refresh" size={10} />
                {t('リセット', 'Reset')}
              </button>
            </div>
          </div>
          <div className="relative h-[420px] px-3 pt-2">
            <canvas ref={chartRef} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 border-t border-[var(--border-faint)] text-[11px] text-text-lo font-mono">
            <span>Sampling: 100Hz → 1Hz (RMS+Peak)</span>
            <span>Draw: {Math.min(streamIndex, MAX_VISIBLE_POINTS)}/{chartData.total}pts</span>
            <span className="hidden sm:inline">Zoom: drag | Wheel: scale</span>
          </div>
        </div>

        {/* アラートサイドバー */}
        <div className="rounded-xl border border-[var(--border-default)] bg-surface overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-faint)]">
            <h2 className="text-[14px] font-semibold text-text-hi">
              {t('アラート', 'Alerts')}
            </h2>
            <div className="flex items-center gap-1.5">
              {criticalCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--err-dim)] text-[var(--err)]">
                  {criticalCount} CRIT
                </span>
              )}
              {warningCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--warn-dim)] text-[var(--warn)]">
                  {warningCount} WARN
                </span>
              )}
              {visibleAlerts.length === 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--ok-dim)] text-[var(--ok)]">OK</span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[420px]">
            {visibleAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-lo">
                <Icon name="check" size={28} className="opacity-30 mb-2" />
                <p className="text-[13px]">{t('異常なし', 'All clear')}</p>
              </div>
            ) : (
              visibleAlerts.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  t={t}
                  isHighlighted={highlightedAlertId === alert.id}
                  onClick={() => handleAlertClick(alert)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Phase 1/2/3 パネル ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CollapsiblePhase
          num={1}
          title={t('① 条件設定', '① Setup')}
          subtitle={selectedExp.phase1Setup.material}
          collapsed={collapsedPhases.has(1)}
          onToggle={() => togglePhase(1)}
        >
          <dl className="space-y-2 text-[13px]">
            <DefItem label={t('材料', 'Material')} value={selectedExp.phase1Setup.material} />
            <DefItem label={t('工具', 'Tool')} value={t(selectedExp.phase1Setup.toolType, selectedExp.phase1Setup.toolTypeEn)} />
            <DefItem label={t('回転数', 'Spindle')} value={`${selectedExp.phase1Setup.spindleSpeedRpm.toLocaleString()} rpm`} mono />
            <DefItem label={t('送り速度', 'Feed')} value={`${selectedExp.phase1Setup.feedRateMmMin} mm/min`} mono />
            <DefItem label={t('切込み深さ', 'DOC')} value={`${selectedExp.phase1Setup.depthOfCutMm} mm`} mono />
            <DefItem label={t('冷却', 'Coolant')} value={t(selectedExp.phase1Setup.coolant, selectedExp.phase1Setup.coolantEn)} />
          </dl>
        </CollapsiblePhase>

        <CollapsiblePhase
          num={2}
          title={t('② 加工中データ', '② Process Data')}
          subtitle={isLive ? 'LIVE' : undefined}
          subtitleColor={isLive ? 'var(--warn)' : undefined}
          collapsed={collapsedPhases.has(2)}
          onToggle={() => togglePhase(2)}
        >
          <div className="grid grid-cols-2 gap-2.5">
            <MiniKpi label={t('切削抵抗', 'Force')} value={liveProcessData.force.toFixed(0)} unit="N" live={isLive} />
            <MiniKpi label={t('振動', 'Vibration')} value={liveProcessData.vibration.toFixed(1)} unit="G" live={isLive} />
            <MiniKpi label={t('温度', 'Temp')} value={liveProcessData.temperature.toFixed(0)} unit="°C" live={isLive} />
            <MiniKpi
              label={t('スピンドル負荷', 'Spindle Load')}
              value={liveProcessData.spindleLoad.toFixed(0)}
              unit="%"
              warn={liveProcessData.spindleLoad > 80}
              live={isLive}
            />
          </div>
        </CollapsiblePhase>

        <CollapsiblePhase
          num={3}
          title={t('③ 評価・分析', '③ Results')}
          subtitle={selectedExp.phase3Result.surfaceRoughnessUm !== null ? t('完了', 'Done') : t('待機中', 'Pending')}
          subtitleColor={selectedExp.phase3Result.surfaceRoughnessUm !== null ? 'var(--ok)' : undefined}
          collapsed={collapsedPhases.has(3)}
          onToggle={() => togglePhase(3)}
        >
          {selectedExp.phase3Result.surfaceRoughnessUm !== null ? (
            <div className="space-y-3">
              {/* 結果レポートヘッダー */}
              <ResultVerdict result={selectedExp.phase3Result} t={t} />
              {/* 測定値 */}
              <dl className="space-y-2 text-[13px]">
                <DefItem label={t('表面粗さ Ra', 'Surface Ra')} value={`${selectedExp.phase3Result.surfaceRoughnessUm} μm`} mono />
                {selectedExp.phase3Result.residualStressMpa !== null && (
                  <DefItem label={t('残留応力', 'Residual Stress')} value={`${selectedExp.phase3Result.residualStressMpa} MPa`} mono />
                )}
                {selectedExp.phase3Result.toolWearMm !== null && (
                  <DefItem label={t('工具摩耗', 'Tool Wear')} value={`${selectedExp.phase3Result.toolWearMm} mm`} mono />
                )}
              </dl>
              {selectedExp.phase3Result.notes && (
                <p className="text-[12px] text-text-lo pt-2 border-t border-[var(--border-faint)] leading-relaxed">
                  {selectedExp.phase3Result.notes}
                </p>
              )}
            </div>
          ) : (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors min-h-[120px] flex flex-col items-center justify-center gap-2 cursor-copy ${
                dragOver
                  ? 'border-[var(--accent)] bg-[var(--accent-dim)]'
                  : 'border-[var(--border-default)] text-text-lo hover:border-[var(--accent)] hover:bg-[var(--accent-dim)]'
              }`}
              role="region"
              aria-label={t('ファイルドロップゾーン', 'File drop zone')}
            >
              <Icon name="upload" size={22} className="opacity-50" />
              <p className="text-[12px]">
                {t('検査画像・測定データをドロップ', 'Drop inspection images / measurement data')}
              </p>
              {droppedFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 justify-center">
                  {droppedFiles.map((f, i) => (
                    <Badge key={i} variant="ok">{f}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CollapsiblePhase>
      </div>
    </div>
  );
};

// ─── サブコンポーネント ───

function CollapsiblePhase({
  num, title, subtitle, subtitleColor, collapsed, onToggle, children,
}: {
  num: number;
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-surface overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-hover transition-colors cursor-pointer"
        aria-expanded={!collapsed}
        aria-controls={`phase-panel-${num}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-semibold text-text-hi">{title}</span>
          {subtitle && (
            <span
              className="text-[10px] font-bold tracking-wide uppercase"
              style={{ color: subtitleColor ?? 'var(--text-lo)' }}
            >
              {subtitle}
            </span>
          )}
        </div>
        <Icon
          name={collapsed ? 'chevronRight' : 'chevronDown'}
          size={14}
          className="text-text-lo flex-shrink-0"
        />
      </button>
      {!collapsed && (
        <div id={`phase-panel-${num}`} className="px-4 pb-4 border-t border-[var(--border-faint)]">
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}

function ExperimentStatusBar({ experiment, t }: { experiment: Experiment; t: (ja: string, en: string) => string }) {
  const s = STATUS_MAP[experiment.status] ?? STATUS_MAP['planned']!;
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-surface overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Badge variant={s.variant as 'ok' | 'warn' | 'err' | 'gray'}>
            <Icon name={s.icon as IconName} size={12} />
            <span className="ml-1">{t(s.label, s.labelEn)}</span>
          </Badge>
          <span className="text-[15px] font-semibold text-text-hi truncate">
            {t(experiment.experimentName, experiment.experimentNameEn)}
          </span>
          <span className="text-[12px] text-text-lo font-mono hidden sm:inline">
            {experiment.experimentId}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[13px] font-bold font-mono text-text-hi tabular-nums">
            {experiment.progressPercentage}%
          </span>
          <div className="w-40 h-2.5 rounded-full bg-[var(--hover)] overflow-hidden">
            <div
              className="h-full rounded-full motion-safe:transition-all motion-safe:duration-500"
              style={{
                width: `${experiment.progressPercentage}%`,
                background: experiment.status === 'aborted' ? 'var(--err)' : 'var(--accent)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertCard({ alert, t, isHighlighted, onClick }: {
  alert: ExperimentAlert;
  t: (ja: string, en: string) => string;
  isHighlighted?: boolean;
  onClick?: () => void;
}) {
  const st = ALERT_STYLE[alert.type] ?? ALERT_STYLE['baseline']!;
  const time = new Date(alert.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const iconName = (SEVERITY_ICON[alert.severity] ?? 'info') as IconName;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex gap-2.5 p-3 rounded-lg border text-[12px] text-left transition-all cursor-pointer group ${
        isHighlighted
          ? 'ring-2 ring-[var(--accent)] shadow-md'
          : 'hover:shadow-sm hover:translate-y-[-1px]'
      }`}
      style={{
        borderColor: isHighlighted ? 'var(--accent)' : st.color + '30',
        background: isHighlighted ? st.bg : 'transparent',
      }}
      aria-pressed={isHighlighted}
      title={t('クリックでチャート上にハイライト', 'Click to highlight on chart')}
    >
      <span
        className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center"
        style={{ background: st.color + '18', color: st.color }}
      >
        <Icon name={iconName} size={13} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <Badge variant={alert.severity === 'critical' ? 'err' : alert.severity === 'warning' ? 'warn' : 'gray'}>
            {t(st.label, st.labelEn)}
          </Badge>
          <span className="text-text-lo font-mono text-[10px]">{time}</span>
        </div>
        <p className="text-text-hi leading-snug group-hover:text-text-hi">{t(alert.message, alert.messageEn)}</p>
      </div>
    </button>
  );
}

function DefItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-3">
      <dt className="text-text-lo flex-shrink-0">{label}</dt>
      <dd className={`text-text-hi font-medium text-right truncate ${mono ? 'font-mono tabular-nums' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

function MiniKpi({ label, value, unit, warn, live }: { label: string; value: string; unit: string; warn?: boolean; live?: boolean }) {
  return (
    <div className={`p-3 rounded-lg border text-center motion-safe:transition-colors ${
      warn
        ? 'border-[var(--warn)] bg-[var(--warn-dim)]'
        : 'border-[var(--border-faint)] bg-[var(--hover)]'
    }`}>
      <div className="flex items-center justify-center gap-1">
        <span className="text-[11px] text-text-lo leading-none">{label}</span>
        {live && <span className="w-1.5 h-1.5 rounded-full bg-[var(--warn)] motion-safe:animate-pulse" />}
      </div>
      <div className="mt-1.5 flex items-baseline justify-center gap-0.5">
        <span className={`text-[18px] font-bold font-mono tabular-nums leading-none motion-safe:transition-all ${
          warn ? 'text-[var(--warn)]' : 'text-text-hi'
        }`}>
          {value}
        </span>
        <span className={`text-[11px] font-medium ${warn ? 'text-[var(--warn)]' : 'text-text-lo'}`}>
          {unit}
        </span>
      </div>
    </div>
  );
}

/** Phase 3 結果レポート: 判定サマリー */
function ResultVerdict({ result, t }: {
  result: { surfaceRoughnessUm: number | null; residualStressMpa: number | null; toolWearMm: number | null };
  t: (ja: string, en: string) => string;
}) {
  const checks: { label: string; pass: boolean; detail: string }[] = [];

  if (result.surfaceRoughnessUm !== null) {
    const pass = result.surfaceRoughnessUm <= 1.0;
    checks.push({
      label: t('面粗さ', 'Surface'),
      pass,
      detail: pass
        ? t(`Ra ${result.surfaceRoughnessUm} μm — 基準 1.0μm 以下を達成`, `Ra ${result.surfaceRoughnessUm} μm — meets ≤1.0μm`)
        : t(`Ra ${result.surfaceRoughnessUm} μm — 基準 1.0μm 超過`, `Ra ${result.surfaceRoughnessUm} μm — exceeds 1.0μm`),
    });
  }
  if (result.toolWearMm !== null) {
    const pass = result.toolWearMm <= 0.3;
    checks.push({
      label: t('工具摩耗', 'Tool Wear'),
      pass,
      detail: pass
        ? t(`${result.toolWearMm} mm — 許容範囲内`, `${result.toolWearMm} mm — within limit`)
        : t(`${result.toolWearMm} mm — 交換推奨`, `${result.toolWearMm} mm — replacement recommended`),
    });
  }
  if (result.residualStressMpa !== null) {
    const compressive = result.residualStressMpa < 0;
    checks.push({
      label: t('残留応力', 'Residual Stress'),
      pass: compressive,
      detail: compressive
        ? t(`${result.residualStressMpa} MPa — 圧縮（良好）`, `${result.residualStressMpa} MPa — compressive (good)`)
        : t(`${result.residualStressMpa} MPa — 引張（注意）`, `${result.residualStressMpa} MPa — tensile (caution)`),
    });
  }

  const allPass = checks.every(c => c.pass);
  const failCount = checks.filter(c => !c.pass).length;

  return (
    <div className={`rounded-lg border p-3 ${
      allPass
        ? 'border-[var(--ok)]/40 bg-[var(--ok-dim)]'
        : 'border-[var(--warn)]/40 bg-[var(--warn-dim)]'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon name={allPass ? 'check' : 'warning'} size={14}
          className={allPass ? 'text-[var(--ok)]' : 'text-[var(--warn)]'} />
        <span className={`text-[12px] font-bold ${allPass ? 'text-[var(--ok)]' : 'text-[var(--warn)]'}`}>
          {allPass
            ? t('全項目合格', 'All Checks Passed')
            : t(`${failCount} 項目に注意`, `${failCount} item(s) need attention`)}
        </span>
      </div>
      <div className="space-y-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-start gap-1.5 text-[11px]">
            <span className={`mt-0.5 ${c.pass ? 'text-[var(--ok)]' : 'text-[var(--warn)]'}`}>
              {c.pass ? '✓' : '!'}
            </span>
            <span className="text-text-hi">{c.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
