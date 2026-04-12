/**
 * 加工プロセス モックデータ — issue #2 加工プロセス・タイムライン用
 * Ti-6Al-4V の溶解→鍛造→機械加工→検査の時系列センサーデータ
 */
export type ProcessPhase = 'melting' | 'forging' | 'machining' | 'inspection'

export interface ProcessPoint {
  time: number
  temp: number
  vibration: number
  load: number
  phase: ProcessPhase
  anomaly?: {
    type: 'temp_spike' | 'vibration_peak' | 'load_surge' | 'tool_wear'
    severity: 'warn' | 'error'
    label: string
  }
}

const PHASE_RANGES: Record<ProcessPhase, [number, number]> = {
  melting:    [0,   120],
  forging:    [121, 300],
  machining:  [301, 600],
  inspection: [601, 720],
}

export const PHASE_LABELS: Record<ProcessPhase, string> = {
  melting:    '溶解',
  forging:    '鍛造',
  machining:  '機械加工',
  inspection: 'NDE 検査',
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function noise(seed: number, amplitude: number) {
  return (Math.sin(seed * 127.1 + 311.7) * Math.cos(seed * 269.5 + 183.3)) * amplitude
}

function generatePhaseData(
  phase: ProcessPhase,
  baseTempRange: [number, number],
  baseVibRange: [number, number],
  baseLoadRange: [number, number],
  step = 5,
): ProcessPoint[] {
  const [tStart, tEnd] = PHASE_RANGES[phase]
  const points: ProcessPoint[] = []
  for (let t = tStart; t <= tEnd; t += step) {
    const progress = (t - tStart) / (tEnd - tStart)
    const temp = lerp(baseTempRange[0], baseTempRange[1], progress) + noise(t, 30)
    const vibration = lerp(baseVibRange[0], baseVibRange[1], progress) + Math.abs(noise(t * 2, 2))
    const load = lerp(baseLoadRange[0], baseLoadRange[1], progress) + noise(t * 3, 50)
    points.push({ time: t, temp: Math.round(temp), vibration: +vibration.toFixed(2), load: Math.round(load), phase })
  }
  return points
}

function injectAnomaly(data: ProcessPoint[], time: number, anomaly: ProcessPoint['anomaly']): void {
  const closest = data.reduce((a, b) => Math.abs(a.time - time) < Math.abs(b.time - time) ? a : b)
  if (!closest) return
  closest.anomaly = anomaly
  if (anomaly?.type === 'temp_spike') closest.temp = Math.round(closest.temp * 1.35)
  if (anomaly?.type === 'vibration_peak') closest.vibration = +(closest.vibration * 3.2).toFixed(2)
  if (anomaly?.type === 'load_surge') closest.load = Math.round(closest.load * 2.1)
  if (anomaly?.type === 'tool_wear') { closest.vibration = +(closest.vibration * 1.8).toFixed(2); closest.load = Math.round(closest.load * 1.4) }
}

export function generateMockProcessData(): ProcessPoint[] {
  const melting    = generatePhaseData('melting',    [1600, 1680], [0.5, 1.2], [0, 0])
  const forging    = generatePhaseData('forging',    [900,  1100], [2.0, 8.0], [200, 800])
  const machining  = generatePhaseData('machining',  [200,  600],  [1.5, 3.5], [300, 600])
  const inspection = generatePhaseData('inspection', [20,   25],   [0.1, 0.3], [0, 0])

  injectAnomaly(melting, 60, { type: 'temp_spike', severity: 'warn', label: '温度スパイク: 溶湯温度が上限値を超過' })
  injectAnomaly(forging, 200, { type: 'vibration_peak', severity: 'error', label: '振動異常: 金型衝撃が設計値の 3 倍' })
  injectAnomaly(machining, 420, { type: 'tool_wear', severity: 'warn', label: '工具摩耗: Ra 1.6 μm を超過、工具交換推奨' })
  injectAnomaly(machining, 540, { type: 'load_surge', severity: 'error', label: '切削負荷急増: チッピング発生の可能性' })

  return [...melting, ...forging, ...machining, ...inspection]
}

export const MOCK_PROCESS_DATA = generateMockProcessData()
