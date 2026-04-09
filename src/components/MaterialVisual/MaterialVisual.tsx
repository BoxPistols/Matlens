import { useMemo } from 'react';

// ============================================================
// Material-specific visual database
// Real-world color/texture references for each material type
// ============================================================

interface MatVisualDef {
  bg: string;          // Main background gradient
  overlay?: string;    // Secondary overlay effect
  shape?: string;      // border-radius style
  symbol?: string;     // Representative symbol/emoji
  grain?: number;      // Noise grain opacity
  borderHue?: string;  // Border accent color
}

// Material name → specific visual appearance based on real-world look
const MATERIAL_VISUALS: Record<string, MatVisualDef> = {
  // === Steels — silver/dark grey metallic ===
  'SS400':    { bg: 'linear-gradient(145deg, #8a8d92, #b0b3b8, #6e7075)', symbol: 'Fe', grain: 0.06, borderHue: '#9a9da2' },
  'S45C':     { bg: 'linear-gradient(135deg, #7a7d82, #a0a3a8, #656770)', symbol: 'Fe-C', grain: 0.07, borderHue: '#8a8d92' },
  'SCM435':   { bg: 'linear-gradient(150deg, #5a5d62, #888b90, #4a4d52)', symbol: 'Cr-Mo', grain: 0.05, borderHue: '#707378' },
  'SKD11':    { bg: 'linear-gradient(140deg, #404348, #606368, #2e3035)', symbol: 'SKD', grain: 0.04, borderHue: '#505358' },
  'SKH51':    { bg: 'linear-gradient(135deg, #484b50, #6a6d72, #383b40)', symbol: 'HSS', grain: 0.03, borderHue: '#585b60' },
  'SUJ2':     { bg: 'linear-gradient(155deg, #555860, #7a7d85, #454850)', symbol: 'SUJ', grain: 0.04, borderHue: '#656870' },

  // === Stainless steels — bright silver, slight blue tint ===
  'SUS304':   { bg: 'linear-gradient(140deg, #b8bcc5, #d0d4dd, #9a9ea8)', symbol: '304', grain: 0.03, borderHue: '#c0c4cc' },
  'SUS316L':  { bg: 'linear-gradient(135deg, #bcc0ca, #d4d8e2, #a0a4ae)', symbol: '316L', grain: 0.03, borderHue: '#c4c8d0' },
  'SUS430':   { bg: 'linear-gradient(145deg, #a8acb5, #c8ccd5, #8a8e98)', symbol: '430', grain: 0.04, borderHue: '#b0b4bc' },
  'SUS630':   { bg: 'linear-gradient(130deg, #9098a5, #b8c0cd, #7880a0)', symbol: '630', grain: 0.03, borderHue: '#a0a8b5' },
  'SUS329':   { bg: 'linear-gradient(150deg, #a0a8b8, #c0c8d8, #8890a0)', symbol: 'DSS', grain: 0.03, borderHue: '#b0b8c8' },

  // === Aluminum — light silver, warm undertone ===
  'A1050':    { bg: 'linear-gradient(135deg, #d8dce0, #eef0f2, #c0c4c8)', symbol: 'Al', grain: 0.02, borderHue: '#d0d4d8' },
  'A2024':    { bg: 'linear-gradient(140deg, #c8ccd2, #e0e4e8, #b0b4ba)', symbol: 'Al-Cu', grain: 0.03, borderHue: '#c0c4ca' },
  'A5052':    { bg: 'linear-gradient(130deg, #ccd0d6, #e4e8ec, #b4b8be)', symbol: 'Al-Mg', grain: 0.03, borderHue: '#c4c8ce' },
  'A6061':    { bg: 'linear-gradient(145deg, #c4c8d0, #dce0e8, #acb0b8)', symbol: '6061', grain: 0.03, borderHue: '#bcc0c8' },
  'A7075':    { bg: 'linear-gradient(135deg, #b0b4bc, #ccd0d8, #989ca4)', symbol: '7075', grain: 0.04, borderHue: '#b8bcc4' },

  // === Titanium — dark silver, slight warm tone ===
  'Ti':       { bg: 'linear-gradient(140deg, #8a8e96, #b0b4bc, #6a6e76)', symbol: 'Ti', grain: 0.04, borderHue: '#9a9ea6' },
  'Ti-6Al':   { bg: 'linear-gradient(135deg, #7a808a, #a0a6b0, #5a606a)', symbol: 'Ti-64', grain: 0.04, borderHue: '#8a90a0' },

  // === Copper — warm orange/red/gold ===
  'C1020':    { bg: 'linear-gradient(140deg, #c87040, #e8a060, #b06030)', symbol: 'Cu', grain: 0.03, borderHue: '#d08050' },
  'C2600':    { bg: 'linear-gradient(135deg, #c8a040, #e8c860, #b09030)', symbol: 'CuZn', grain: 0.04, borderHue: '#d0b050' },
  'C5210':    { bg: 'linear-gradient(145deg, #a08050, #c0a070, #806040)', symbol: 'CuSn', grain: 0.04, borderHue: '#b09060' },
  'BeCu':     { bg: 'linear-gradient(130deg, #b09060, #d0b080, #907040)', symbol: 'CuBe', grain: 0.03, borderHue: '#c0a070' },

  // === Nickel superalloys — dark metallic, slight green/grey ===
  'Inconel':  { bg: 'linear-gradient(140deg, #6a7078, #8a9098, #505860)', symbol: 'Ni', grain: 0.04, borderHue: '#7a8088' },
  'Hastelloy':{ bg: 'linear-gradient(135deg, #607068, #809088, #506058)', symbol: 'NiMo', grain: 0.05, borderHue: '#708078' },
  'Monel':    { bg: 'linear-gradient(150deg, #7a8080, #9aa0a0, #5a6060)', symbol: 'NiCu', grain: 0.04, borderHue: '#8a9090' },

  // === Special metals ===
  'AZ31':     { bg: 'linear-gradient(135deg, #c0c8d0, #e0e8f0, #a0a8b0)', symbol: 'Mg', grain: 0.03, borderHue: '#c8d0d8' },
  'WC':       { bg: 'linear-gradient(140deg, #383c40, #585c60, #282c30)', symbol: 'WC', grain: 0.03, borderHue: '#484c50' },
  'W ':       { bg: 'linear-gradient(135deg, #505458, #707478, #404448)', symbol: 'W', grain: 0.04, borderHue: '#606468' },
  'Kovar':    { bg: 'linear-gradient(145deg, #6a6e72, #8a8e92, #4a4e52)', symbol: 'FeNi', grain: 0.04, borderHue: '#7a7e82' },

  // === Ceramics — pale/white/earthy/colored ===
  'Al2O3':    { bg: 'linear-gradient(135deg, #f0ece0, #faf8f0, #e0dcd0)', symbol: 'Al2O3', grain: 0.02, borderHue: '#e8e4d8', shape: 'rounded-sm' },
  'ZrO2':     { bg: 'linear-gradient(140deg, #f8f4f0, #fffef8, #eae6e0)', symbol: 'ZrO2', grain: 0.02, borderHue: '#f0ece6', shape: 'rounded-sm' },
  'Si3N4':    { bg: 'linear-gradient(130deg, #505860, #707880, #3a4248)', symbol: 'Si3N4', grain: 0.05, borderHue: '#606870', shape: 'rounded-sm' },
  'SiC':      { bg: 'linear-gradient(145deg, #2a3038, #4a5058, #1a2028)', symbol: 'SiC', grain: 0.04, borderHue: '#3a4048', shape: 'rounded-sm' },
  'BN':       { bg: 'linear-gradient(135deg, #f0f0f0, #ffffff, #e0e0e0)', symbol: 'h-BN', grain: 0.01, borderHue: '#e8e8e8', shape: 'rounded-sm' },
  'cBN':      { bg: 'linear-gradient(140deg, #e8c050, #f8e070, #d0a830)', symbol: 'cBN', grain: 0.03, borderHue: '#e0c860', shape: 'rounded-sm' },
  'PZT':      { bg: 'linear-gradient(135deg, #c0b8a0, #e0d8c0, #a09880)', symbol: 'PZT', grain: 0.04, borderHue: '#d0c8b0', shape: 'rounded-sm' },
  'HA':       { bg: 'linear-gradient(145deg, #f4f0e8, #fcfaf4, #e8e4dc)', symbol: 'HAp', grain: 0.02, borderHue: '#f0ece4', shape: 'rounded-sm' },
  'MgO':      { bg: 'linear-gradient(130deg, #f0ece4, #faf6f0, #e0dcd4)', symbol: 'MgO', grain: 0.02, borderHue: '#e8e4dc', shape: 'rounded-sm' },
  'BaTiO3':   { bg: 'linear-gradient(135deg, #d8d0b8, #f0e8d0, #c0b8a0)', symbol: 'BTO', grain: 0.03, borderHue: '#e0d8c0', shape: 'rounded-sm' },
  'コーディエライト': { bg: 'linear-gradient(140deg, #e8e0d0, #f8f0e0, #d0c8b8)', symbol: 'Cord', grain: 0.03, borderHue: '#e0d8c8', shape: 'rounded-sm' },
  'AlN':      { bg: 'linear-gradient(135deg, #e0dcd0, #f0ece0, #d0ccc0)', symbol: 'AlN', grain: 0.02, borderHue: '#e8e4d8', shape: 'rounded-sm' },

  // === Polymers — vibrant, saturated ===
  'PE':       { bg: 'linear-gradient(135deg, #e8e8e8, #f8f8f8, #d0d0d0)', symbol: 'PE', grain: 0.01, borderHue: '#e0e0e0', shape: 'rounded-full' },
  'PP':       { bg: 'linear-gradient(140deg, #dce8f0, #ecf4fc, #c4d4e0)', symbol: 'PP', grain: 0.01, borderHue: '#d4e0ec', shape: 'rounded-full' },
  'PET':      { bg: 'linear-gradient(135deg, #c0e0e8, #d8f0f8, #a8d0d8)', symbol: 'PET', grain: 0.01, borderHue: '#b8d8e0', shape: 'rounded-full' },
  'PA66':     { bg: 'linear-gradient(145deg, #e8dcc8, #f8f0e0, #d0c4b0)', symbol: 'PA', grain: 0.02, borderHue: '#e0d4c0', shape: 'rounded-full' },
  'POM':      { bg: 'linear-gradient(130deg, #f0ece0, #faf8f0, #e0dcd0)', symbol: 'POM', grain: 0.02, borderHue: '#e8e4d8', shape: 'rounded-full' },
  'ABS':      { bg: 'linear-gradient(135deg, #f0e8d0, #faf4e4, #e0d8c0)', symbol: 'ABS', grain: 0.02, borderHue: '#e8e0d0', shape: 'rounded-full' },
  'PC':       { bg: 'linear-gradient(140deg, #d0e0f0, #e0f0ff, #b8d0e8)', symbol: 'PC', grain: 0.01, borderHue: '#c8d8f0', shape: 'rounded-full' },
  'PMMA':     { bg: 'linear-gradient(135deg, #d8e8f8, #e8f4ff, #c0d8f0)', symbol: 'PMMA', grain: 0.01, borderHue: '#d0e0f8', shape: 'rounded-full' },
  'PEEK':     { bg: 'linear-gradient(145deg, #a09078, #c0b098, #807060)', symbol: 'PEEK', grain: 0.03, borderHue: '#b0a088', shape: 'rounded-full' },
  'PPS':      { bg: 'linear-gradient(130deg, #605040, #806860, #483830)', symbol: 'PPS', grain: 0.04, borderHue: '#706050', shape: 'rounded-full' },
  'PI':       { bg: 'linear-gradient(135deg, #d08020, #f0a040, #b06010)', symbol: 'PI', grain: 0.03, borderHue: '#e09030', shape: 'rounded-full' },
  'PTFE':     { bg: 'linear-gradient(140deg, #f0f0f0, #ffffff, #e8e8e8)', symbol: 'PTFE', grain: 0.01, borderHue: '#f0f0f0', shape: 'rounded-full' },
  'シリコーン':  { bg: 'linear-gradient(135deg, #d0c8c0, #e8e0d8, #b8b0a8)', symbol: 'PDMS', grain: 0.02, borderHue: '#d8d0c8', shape: 'rounded-full' },
  'エポキシ':   { bg: 'linear-gradient(145deg, #c8b040, #e0c860, #b09830)', symbol: 'Epoxy', grain: 0.03, borderHue: '#d0b848', shape: 'rounded-full' },

  // === Composites — layered/textured ===
  'CFRP':     { bg: 'repeating-linear-gradient(45deg, #1a1e22 0px, #1a1e22 2px, #282c30 2px, #282c30 4px)', symbol: 'CF', grain: 0.06, borderHue: '#2a2e32' },
  'GFRP':     { bg: 'repeating-linear-gradient(45deg, #c8d0b8 0px, #c8d0b8 2px, #d8e0c8 2px, #d8e0c8 4px)', symbol: 'GF', grain: 0.04, borderHue: '#c0c8b0' },
  'アラミド':   { bg: 'repeating-linear-gradient(30deg, #c8b840 0px, #c8b840 2px, #d8c850 2px, #d8c850 4px)', symbol: 'Ar', grain: 0.05, borderHue: '#d0c048' },
  'SiC/SiC':  { bg: 'repeating-linear-gradient(60deg, #2a3038 0px, #2a3038 3px, #3a4048 3px, #3a4048 6px)', symbol: 'CMC', grain: 0.05, borderHue: '#3a4248' },
  'C/C':      { bg: 'repeating-linear-gradient(45deg, #181c20 0px, #181c20 2px, #282c30 2px, #282c30 4px)', symbol: 'C/C', grain: 0.06, borderHue: '#202428' },
  'サーメット':  { bg: 'linear-gradient(135deg, #505860, #707880, #404850)', symbol: 'TiC', grain: 0.04, borderHue: '#606870' },
  'Al-SiC':   { bg: 'linear-gradient(140deg, #a0a8b0, #c0c8d0, #808890)', symbol: 'MMC', grain: 0.04, borderHue: '#b0b8c0' },
  'サンドイッチ': { bg: 'repeating-linear-gradient(0deg, #c8ccd0 0px, #c8ccd0 6px, #e0e4e8 6px, #e0e4e8 12px, #c8ccd0 12px, #c8ccd0 18px)', symbol: 'HC', grain: 0.03, borderHue: '#d0d4d8' },
  'GLARE':    { bg: 'repeating-linear-gradient(0deg, #b0b8c0 0px, #b0b8c0 3px, #d0d8e0 3px, #d0d8e0 6px)', symbol: 'FML', grain: 0.03, borderHue: '#c0c8d0' },
  'FRM':      { bg: 'repeating-linear-gradient(60deg, #6a7078 0px, #6a7078 2px, #8a9098 2px, #8a9098 4px)', symbol: 'Ti-F', grain: 0.04, borderHue: '#7a8088' },
};

// Match material name to visual definition (partial match)
function findVisual(name: string): MatVisualDef | null {
  for (const [key, def] of Object.entries(MATERIAL_VISUALS)) {
    if (name.includes(key)) return def;
  }
  return null;
}

// Fallback: generate from category + properties
function fallbackVisual(cat: string, hv: number): MatVisualDef {
  const hvN = Math.min(hv / 3000, 1);
  switch (cat) {
    case '金属合金':
      return { bg: `linear-gradient(135deg, hsl(215,15%,${50 + hvN * 20}%), hsl(220,20%,${60 + hvN * 15}%), hsl(210,15%,${40 + hvN * 15}%))`, symbol: 'M', grain: 0.05, borderHue: `hsl(215,15%,${55 + hvN * 15}%)` };
    case 'セラミクス':
      return { bg: `linear-gradient(135deg, hsl(35,15%,${75 + hvN * 10}%), hsl(30,20%,${85 + hvN * 5}%), hsl(40,15%,${65 + hvN * 10}%))`, symbol: 'Ox', grain: 0.03, borderHue: `hsl(35,15%,${70 + hvN * 10}%)`, shape: 'rounded-sm' };
    case 'ポリマー':
      return { bg: `linear-gradient(135deg, hsl(200,30%,80%), hsl(210,35%,88%), hsl(195,25%,72%))`, symbol: 'Pm', grain: 0.02, borderHue: 'hsl(200,30%,78%)', shape: 'rounded-full' };
    case '複合材料':
      return { bg: `repeating-linear-gradient(45deg, hsl(215,15%,35%) 0px, hsl(215,15%,35%) 2px, hsl(215,15%,45%) 2px, hsl(215,15%,45%) 4px)`, symbol: 'Cp', grain: 0.05, borderHue: 'hsl(215,15%,40%)' };
    default:
      return { bg: 'linear-gradient(135deg, #888, #aaa, #777)', symbol: '--', grain: 0.03, borderHue: '#999' };
  }
}

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

interface MaterialVisualProps {
  name: string;
  cat: string;
  hv: number;
  ts?: number;
  el?: number;
  dn?: number;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export const MaterialVisual = ({ name, cat, hv, size = 160, className = '', showLabel = false }: MaterialVisualProps) => {
  const visual = useMemo(() => findVisual(name) || fallbackVisual(cat, hv), [name, cat, hv]);
  const borderRadius = visual.shape === 'rounded-full' ? size / 2 : visual.shape === 'rounded-sm' ? 4 : 8;

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{
        width: size, height: size,
        borderRadius,
        background: visual.bg,
        border: `1px solid ${visual.borderHue || '#888'}`,
      }}
    >
      {/* Grain texture */}
      <div className="absolute inset-0" style={{ backgroundImage: GRAIN_SVG, backgroundSize: '128px 128px', opacity: visual.grain || 0.03, mixBlendMode: 'overlay' }} />

      {/* Reflection highlight */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.15) 0%, transparent 55%)' }} />

      {/* Chemical symbol */}
      <span className="font-mono font-bold select-none" style={{
        fontSize: Math.max(size * 0.18, 10),
        lineHeight: 1,
        color: 'rgba(255,255,255,0.55)',
        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
        letterSpacing: '-0.02em',
      }}>
        {visual.symbol || '--'}
      </span>

      {/* Label overlay */}
      {showLabel && (
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-center" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }}>
          <div className="text-white text-[10px] font-bold truncate" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{name}</div>
        </div>
      )}
    </div>
  );
};

export const MaterialThumbnail = ({ name, cat, hv, className = '' }: Omit<MaterialVisualProps, 'size'>) => (
  <MaterialVisual name={name} cat={cat} hv={hv} size={48} className={className} />
);
