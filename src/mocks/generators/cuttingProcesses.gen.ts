// 切削プロセス generator
// specimen を「どう切り出したか」の加工履歴を決定論的に生成する。
// 波形サンプルは可視化用途のみ想定。1 プロセス 0〜1 本、各 128 点に抑えバンドルを肥大化させない。

import type {
  CuttingCondition,
  CuttingProcess,
  MachiningOperation,
  Specimen,
  Tool,
  User,
  WaveformSample,
} from '@/domain/types';
import { createSeededFaker } from './seededFaker';

export interface GenerateCuttingProcessesInput {
  specimens: Specimen[];
  tools: Tool[];
  users: User[];
  /** specimen ごとに紐づける加工工程数の範囲 */
  perSpecimen?: [number, number];
  /** 波形を付与する確率（0-1） */
  waveformProbability?: number;
  seed?: number;
}

export interface GenerateCuttingProcessesOutput {
  processes: CuttingProcess[];
  waveforms: WaveformSample[];
}

const OPERATIONS: MachiningOperation[] = [
  'turning',
  'milling_face',
  'milling_peripheral',
  'milling_5axis',
  'drilling',
];

// 工具種別ごとに対応する加工種別を絞るヘルパ
const operationsForTool = (tool: Tool): MachiningOperation[] => {
  switch (tool.type) {
    case 'insert_turning':
      return ['turning'];
    case 'face_mill':
      return ['milling_face'];
    case 'insert_milling':
      return ['milling_face', 'milling_peripheral'];
    case 'end_mill':
      return ['milling_peripheral', 'milling_face'];
    case 'ball_mill':
      return ['milling_5axis'];
    case 'drill':
      return ['drilling'];
    case 'reamer':
      return ['reaming'];
    case 'tap':
      return ['tapping'];
    default:
      return OPERATIONS;
  }
};

// 代表的な切削条件レンジ（現実的な一次近似）
const conditionRangeForTool = (
  tool: Tool,
  materialId: string
): { Vc: [number, number]; fz: [number, number]; ap: [number, number] } => {
  // Ti-6Al-4V / Inconel は Vc を下げる
  const hardMat = materialId === 'mat_ti6al4v' || materialId === 'mat_inconel718';
  if (tool.type === 'insert_turning') {
    return hardMat ? { Vc: [40, 100], fz: [0.1, 0.3], ap: [0.5, 2.0] } : { Vc: [120, 320], fz: [0.1, 0.4], ap: [1.0, 3.0] };
  }
  if (tool.type === 'drill') {
    return hardMat ? { Vc: [10, 30], fz: [0.05, 0.15], ap: [1, 20] } : { Vc: [40, 90], fz: [0.1, 0.25], ap: [1, 30] };
  }
  // milling 系
  return hardMat ? { Vc: [30, 80], fz: [0.05, 0.15], ap: [0.5, 3] } : { Vc: [100, 250], fz: [0.1, 0.25], ap: [1, 6] };
};

const pickToolForMaterial = (tools: Tool[], materialId: string): Tool => {
  const matching = tools.filter((t) => t.applicableMaterials.includes(materialId));
  return matching.length > 0 ? matching[0]! : tools[0]!;
};

export const generateCuttingProcesses = (
  input: GenerateCuttingProcessesInput
): GenerateCuttingProcessesOutput => {
  const {
    specimens,
    tools,
    users,
    perSpecimen = [1, 3],
    waveformProbability = 0.25,
    seed = 20260419,
  } = input;
  const faker = createSeededFaker(seed);
  const operators = users.filter((u) => u.role === 'operator' || u.role === 'engineer');
  if (operators.length === 0) throw new Error('operator users required');
  if (tools.length === 0) throw new Error('tools required');

  const processes: CuttingProcess[] = [];
  const waveforms: WaveformSample[] = [];
  let running = 1;

  for (const specimen of specimens) {
    const count = faker.number.int({ min: perSpecimen[0], max: perSpecimen[1] });
    // 加工日時は受入日 + 1〜5 日後として決定論的に
    const baseParsed = new Date(specimen.receivedAt).getTime();
    const baseTime = Number.isFinite(baseParsed)
      ? baseParsed
      : new Date(`${specimen.receivedAt}T08:00:00+09:00`).getTime();

    for (let i = 0; i < count; i++) {
      const tool = pickToolForMaterial(tools, specimen.materialId);
      const ops = operationsForTool(tool);
      const operation = faker.helpers.arrayElement(ops);
      const operator = faker.helpers.arrayElement(operators);
      const range = conditionRangeForTool(tool, specimen.materialId);

      const cuttingSpeed = faker.number.float({
        min: range.Vc[0],
        max: range.Vc[1],
        fractionDigits: 1,
      });
      const feed = faker.number.float({
        min: range.fz[0],
        max: range.fz[1],
        fractionDigits: 3,
      });
      const depthOfCut = faker.number.float({
        min: range.ap[0],
        max: range.ap[1],
        fractionDigits: 2,
      });
      // Vc = π D N / 1000 → N = 1000 Vc / (π D)
      // NOTE: 旋削ではワークピース径、ミーリングでは有効径を使うのが本来の挙動。
      // 本モックでは簡易的に tool.diameter を代表寸法として使用し、モック用途として
      // 現実的なオーダーに収める。実バックエンドでは CuttingCondition に参照径を
      // 明示するフィールド拡張を検討する。
      const spindleSpeed = Math.round((1000 * cuttingSpeed) / (Math.PI * tool.diameter));
      const widthOfCut =
        operation === 'turning' || operation === 'drilling'
          ? null
          : Number(faker.number.float({ min: tool.diameter * 0.3, max: tool.diameter * 0.8, fractionDigits: 2 }));

      // 旋削・ドリル・リーマ・タップは 1 回転あたりの送り (mm/rev) で表現するのが慣例。
      // エンドミル / フライス系は 1 刃あたり (mm/tooth) を使う。
      const feedUnit: CuttingCondition['feedUnit'] =
        tool.type === 'insert_turning' ||
        tool.type === 'drill' ||
        tool.type === 'reamer' ||
        tool.type === 'tap'
          ? 'mm/rev'
          : 'mm/tooth';

      const condition: CuttingCondition = {
        cuttingSpeed,
        feed,
        feedUnit,
        depthOfCut,
        widthOfCut,
        spindleSpeed,
        coolant: faker.helpers.arrayElement(['flood', 'MQL', 'dry'] as const),
        notes: null,
      };

      const processId = `cut_${String(running).padStart(6, '0')}`;
      const performedOffsetMs = faker.number.int({ min: 1, max: 5 }) * 24 * 60 * 60 * 1000;
      const performedAt = new Date(baseTime + performedOffsetMs).toISOString();

      // 時系列波形（一部のプロセスのみ付与、バンドル肥大防止）
      const addWaveform = faker.number.float({ min: 0, max: 1 }) < waveformProbability;
      const waveformIds: string[] = [];
      if (addWaveform) {
        const waveId = `wave_${processId}_fz`;
        waveforms.push({
          id: waveId,
          processId,
          channel: 'force_z',
          unit: 'N',
          sampleRateHz: 10000,
          // 128 点の擬似切削抵抗波形（平均 + サイン + ノイズ）
          values: Array.from({ length: 128 }, (_, k) => {
            const base = 100 + depthOfCut * 40;
            const wave = 30 * Math.sin((k / 128) * 2 * Math.PI * 8);
            const noise = (faker.number.float({ min: -1, max: 1, fractionDigits: 3 })) * 15;
            return Number((base + wave + noise).toFixed(2));
          }),
          startedAt: performedAt,
        });
        waveformIds.push(waveId);
      }

      // 工具摩耗 VB は加工距離に Taylor 的に緩やかに増加させる。
      // cuttingSpeed [m/min] × 1000 = [mm/min] に machiningDurationMin を掛けて mm を算出。
      // machiningTimeSec も同じ durationMin から導出することで物理的整合を保つ。
      const machiningDurationMin = faker.number.float({ min: 0.5, max: 3, fractionDigits: 2 });
      const cuttingDistanceMm = Math.round(cuttingSpeed * 1000 * machiningDurationMin);
      const toolWearVB = Number(
        Math.min(
          0.4,
          0.02 + cuttingDistanceMm / 1_200_000 + faker.number.float({ min: 0, max: 0.05, fractionDigits: 3 })
        ).toFixed(3)
      );
      const chatterDetected = depthOfCut / tool.diameter > 0.5 && faker.number.float({ min: 0, max: 1 }) < 0.4;
      const cuttingForceFc = Number((80 + depthOfCut * 50 + faker.number.float({ min: -10, max: 20 })).toFixed(1));
      const cuttingTemperatureC = Number(
        (80 + cuttingSpeed * 0.8 + faker.number.float({ min: -15, max: 25 })).toFixed(1)
      );
      const surfaceRoughnessRa = Number(
        (0.4 + feed * 4 + (chatterDetected ? 1.0 : 0)).toFixed(3)
      );

      processes.push({
        id: processId,
        code: `CUT-${new Date(performedAt).getFullYear()}-${String(running).padStart(4, '0')}`,
        specimenId: specimen.id,
        materialId: specimen.materialId,
        toolId: tool.id,
        operation,
        condition,
        machiningTimeSec: Math.round(machiningDurationMin * 60),
        cuttingDistanceMm,
        surfaceRoughnessRa,
        toolWearVB,
        chatterDetected,
        cuttingForceFc,
        cuttingTemperatureC,
        waveformIds,
        operatorId: operator.id,
        machine: faker.helpers.arrayElement(['MC-01', 'MC-02', 'Lathe-01', 'MC5X-01']),
        performedAt,
        createdAt: performedAt,
        updatedAt: performedAt,
        createdBy: operator.id,
        updatedBy: operator.id,
        notes: null,
      });
      running++;
    }
  }

  return { processes, waveforms };
};
