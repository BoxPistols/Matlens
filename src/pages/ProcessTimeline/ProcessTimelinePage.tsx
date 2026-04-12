/**
 * ProcessTimelinePage — 加工プロセス・タイムライン (issue #2 ②)
 * Ti-6Al-4V のモック時系列データ (温度・振動・切削負荷) を Chart.js で表示。
 * シークバーで任意時刻を確認。異常検知ポイントにマーカーを表示。
 * ※ プロトタイプ: 全てモックデータ
 */
import { useRef, useEffect, useState, useMemo } from 'react'
import { Chart, registerables } from 'chart.js'
import { Card, Badge, SectionCard } from '../../components/atoms'
import { Icon } from '../../components/Icon'
import {
  MOCK_PROCESS_DATA,
  PHASE_LABELS,
  type ProcessPoint,
} from '../../data/mockProcessData'

Chart.register(...registerables)

const COLORS = { temp: '#f06060', vibration: '#5a9ae0', load: '#00c896' }

export const ProcessTimelinePage = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInst = useRef<Chart | null>(null)
  const [seekTime, setSeekTime] = useState(0)

  const data = MOCK_PROCESS_DATA
  const maxTime = data[data.length - 1]?.time ?? 720
  const anomalies = data.filter(p => p.anomaly)

  const currentPoint: ProcessPoint = useMemo(() =>
    data.reduce((a, b) => Math.abs(a.time - seekTime) < Math.abs(b.time - seekTime) ? a : b)
  , [data, seekTime])

  const nearbyAnomaly = anomalies.find(a => Math.abs(a.time - seekTime) < 15)

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null }

    const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
    const textLo = css('--text-lo') || '#888'
    const borderFaint = css('--border-faint') || '#ccc'

    const anomalyPlugin = {
      id: 'anomalyLines',
      afterDraw(chart: Chart) {
        const { ctx, chartArea, scales } = chart
        if (!scales['x']) return
        for (const a of anomalies) {
          const x = scales['x']!.getPixelForValue(a.time)
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(x, chartArea.top)
          ctx.lineTo(x, chartArea.bottom)
          ctx.strokeStyle = (a.anomaly?.severity === 'error' ? '#f06060' : '#f0b040') + 'cc'
          ctx.lineWidth = 2
          ctx.setLineDash([4, 3])
          ctx.stroke()
          ctx.restore()
        }
        const sx = scales['x']!.getPixelForValue(seekTime)
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(sx, chartArea.top)
        ctx.lineTo(sx, chartArea.bottom)
        ctx.strokeStyle = '#ffffff88'
        ctx.lineWidth = 2
        ctx.setLineDash([])
        ctx.stroke()
        ctx.restore()
      },
    }

    chartInst.current = new Chart(chartRef.current, {
      type: 'line',
      plugins: [anomalyPlugin],
      data: {
        labels: data.map(p => p.time),
        datasets: [
          { label: '温度 (°C)', data: data.map(p => p.temp), borderColor: COLORS.temp, pointRadius: 0, borderWidth: 2, tension: 0.3, yAxisID: 'yTemp' },
          { label: '振動 (m/s²)', data: data.map(p => p.vibration), borderColor: COLORS.vibration, pointRadius: 0, borderWidth: 2, tension: 0.3, yAxisID: 'yVib' },
          { label: '切削負荷 (N)', data: data.map(p => p.load), borderColor: COLORS.load, pointRadius: 0, borderWidth: 2, tension: 0.3, yAxisID: 'yLoad' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        scales: {
          x: { type: 'category', title: { display: true, text: '経過時間 (s)', color: textLo }, grid: { color: borderFaint }, ticks: { maxTicksLimit: 15, color: textLo, callback: (_, i) => data[i]?.time ?? '' } },
          yTemp: { type: 'linear', position: 'left', title: { display: true, text: '温度 (°C)', color: COLORS.temp }, grid: { color: borderFaint } },
          yVib: { type: 'linear', position: 'right', title: { display: true, text: '振動 (m/s²)', color: COLORS.vibration }, grid: { display: false } },
          yLoad: { type: 'linear', position: 'right', title: { display: true, text: '負荷 (N)', color: COLORS.load }, grid: { display: false }, offset: true },
        },
        plugins: { legend: { labels: { color: textLo, font: { size: 11 } } } },
        onClick(_, elements) {
          const idx = elements[0]?.index
          if (idx !== undefined) setSeekTime(data[idx]?.time ?? 0)
        },
      },
    })
    return () => { chartInst.current?.destroy(); chartInst.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => { chartInst.current?.update('none') }, [seekTime])

  const phaseColor: Record<string, string> = { melting: 'amber', forging: 'vec', machining: 'blue', inspection: 'green' }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[16px] font-bold text-text-hi flex items-center gap-2">
          <Icon name="info" size={16} />
          加工プロセス・タイムライン
        </h1>
        <p className="text-[12px] text-text-lo mt-0.5">
          Ti-6Al-4V の加工プロセス (溶解→鍛造→機械加工→検査) の時系列センサーデータ。
          シークバーで任意時刻を確認。赤/橙の縦線が異常検知ポイント。
          <Badge variant="amber" className="ml-2 text-[10px]">モックデータ</Badge>
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(PHASE_LABELS).map(([phase, label]) => (
          <Badge key={phase} variant={(phaseColor[phase] ?? 'gray') as 'amber' | 'vec' | 'blue' | 'green' | 'gray'}>{label}</Badge>
        ))}
        {anomalies.map(a => (
          <button key={a.time} onClick={() => setSeekTime(a.time)}
            className={`text-[11px] px-2 py-0.5 rounded border cursor-pointer transition-colors ${
              a.anomaly?.severity === 'error' ? 'border-[var(--err)] text-[var(--err)] hover:bg-[var(--err)]/10' : 'border-[var(--warn)] text-[var(--warn)] hover:bg-[var(--warn)]/10'
            }`}>
            ⚠ t={a.time}s
          </button>
        ))}
      </div>

      <Card className="p-4">
        <div style={{ height: 340 }}>
          <canvas ref={chartRef} role="img" aria-label="加工プロセス時系列グラフ" />
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-text-lo mb-1">
            <span>t = 0s</span>
            <span className="font-bold text-text-hi">現在: t = {seekTime}s ({PHASE_LABELS[currentPoint.phase]})</span>
            <span>t = {maxTime}s</span>
          </div>
          <input type="range" min={0} max={maxTime} step={5} value={seekTime} onChange={e => setSeekTime(+e.target.value)}
            className="w-full accent-[var(--accent)]" aria-label="タイムラインのシーク位置" />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SectionCard title={`t = ${seekTime}s の計測値`}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '温度', value: `${currentPoint.temp} °C`, color: COLORS.temp },
              { label: '振動', value: `${currentPoint.vibration} m/s²`, color: COLORS.vibration },
              { label: '切削負荷', value: `${currentPoint.load} N`, color: COLORS.load },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-raised border border-[var(--border-faint)] rounded-md p-2.5 text-center">
                <div className="text-[10px] text-text-lo mb-1">{label}</div>
                <div className="text-[13px] font-bold font-mono" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="異常検知ログ">
          <div className="flex flex-col gap-1">
            {anomalies.map(a => (
              <button key={a.time} onClick={() => setSeekTime(a.time)}
                className={`text-left p-2 rounded text-[11px] border transition-colors ${
                  nearbyAnomaly?.time === a.time ? 'border-[var(--accent)] bg-[var(--accent-dim)]' : 'border-[var(--border-faint)] hover:bg-hover'
                }`}>
                <span className={`font-bold mr-2 ${a.anomaly?.severity === 'error' ? 'text-[var(--err)]' : 'text-[var(--warn)]'}`}>
                  {a.anomaly?.severity === 'error' ? '🔴' : '🟡'} t={a.time}s
                </span>
                <span className="text-text-md">{a.anomaly?.label}</span>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <Card className="p-3 border-dashed" style={{ borderColor: 'var(--border-faint)' }}>
        <p className="text-[11px] text-text-lo">
          ※ プロトタイプ: 全てモックデータです。実運用では装置から MaiML 形式でリアルタイム計測値を取得し、
          異常検知アルゴリズム (3σ / EWMA 等) でマーカーを自動生成します。
        </p>
      </Card>
    </div>
  )
}
