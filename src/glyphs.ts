// 記号の図形（100×100 の枠。線だけで描く簡略図。規格の図そのものではない）
// 画面の表示と、画像検索の「見本の型」の両方に、同じ図形を使う。
export const GLYPHS: Record<string, string> = {
  // ── 幾何公差（JIS B 0021）
  straight: '<path d="M14 50H86"/>',
  flat: '<path d="M20 66H90L80 34H10Z"/>',
  round: '<circle cx="50" cy="50" r="28"/>',
  cylind: '<circle cx="50" cy="50" r="20"/><path d="M49.8 90.3L84.8 29.7M15.2 70.3L50.2 9.7"/>',
  lineprof: '<path d="M14 66A36 36 0 0 1 86 66"/>',
  surfprof: '<path d="M14 66A36 36 0 0 1 86 66Z"/>',
  parallel: '<path d="M22 80L52 22M48 80L78 22"/>',
  perpend: '<path d="M12 82H88M50 82V18"/>',
  angular: '<path d="M14 80H86M14 80L66 18"/>',
  position: '<circle cx="50" cy="50" r="22"/><path d="M50 8V92M8 50H92"/>',
  coaxial: '<circle cx="50" cy="50" r="16"/><circle cx="50" cy="50" r="31"/>',
  symmetry: '<path d="M20 32H80M20 68H80M10 50H90"/>',
  runout: '<path d="M20 80L78 22M52 22H78V48"/>',
  totalrun: '<path d="M10 82L58 34M36 34H58V56M38 82L86 34M64 34H86V56"/>',
  // ── 表面性状（JIS B 0031）
  s_any: '<path d="M20 52L40 86L74 14"/>',
  s_remove: '<path d="M20 52L40 86L74 14H18"/>',
  s_noremove: '<path d="M20 52L40 86L74 14"/><circle cx="40" cy="64" r="10" fill="none"/>',
  // ── 溶接記号（JIS Z 3021）基準線の上に立てた形
  w_I: '<path d="M42 86V46M58 86V46M4 88H96"/>',
  w_V: '<path d="M24 42L50 86L76 42M4 88H96"/>',
  w_bevel: '<path d="M34 44V86L70 44M4 88H96"/>',
  w_J: '<path d="M34 44V86M72 44Q72 86 34 86M4 88H96"/>',
  w_U: '<path d="M24 44Q24 86 50 86Q76 86 76 44M4 88H96"/>',
  w_fillet: '<path d="M30 86V46L70 86ZM4 88H96"/>',
  w_plug: '<path d="M26 50H74V86H26ZM4 88H96"/>',
  w_spot: '<circle cx="50" cy="70" r="16"/><path d="M4 88H96"/>',
}

export function glyphSvg(id: string, opt: { size?: number; color?: string; sw?: number } = {}): string {
  const { size = 100, color = '#000', sw = 6 } = opt
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[id] ?? ''}</svg>`
}

// ── 模式図（品物のどの形状・どの部分の精度か）。200×110 の枠。
// 青＝品物、オレンジ＝公差域（この中に入ればよい範囲）、緑＝基準（データム）
const P = 'fill="#dbe6f5" stroke="#1d2b53" stroke-width="2"'
const Z = 'fill="rgba(240,140,58,0.22)" stroke="#d9480f" stroke-width="1.6" stroke-dasharray="5 3"'
const D = 'fill="#cfe9dc" stroke="#0b7a4b" stroke-width="2"'
const T = 'font-size="9" fill="#1d2b53" font-family="sans-serif"'
const wave = (x0: number, x1: number, y: number, a: number) => {
  let d = `M${x0} ${y}`
  const n = 8
  for (let i = 1; i <= n; i++) d += ` L${x0 + ((x1 - x0) * i) / n} ${y + (i % 2 ? -a : a * 0.7)}`
  return d
}

export const SCENES: Record<string, string> = {
  straight: `<rect x="20" y="52" width="160" height="24" rx="3" ${P}/><rect x="20" y="40" width="160" height="12" ${Z}/><path d="${wave(20, 180, 50, 3)}" fill="none" stroke="#1d2b53" stroke-width="2"/><text x="24" y="26" ${T}>軸の表面の一本の線が、</text><text x="24" y="37" ${T}>この帯の中に入ればよい</text>`,
  flat: `<path d="M26 74L150 74L178 52L54 52Z" ${P}/><rect x="26" y="38" width="124" height="9" fill="rgba(240,140,58,0.22)" stroke="#d9480f" stroke-width="1.4" stroke-dasharray="5 3"/><rect x="26" y="52" width="124" height="9" fill="none"/><text x="26" y="22" ${T}>面全体が、すき間のある</text><text x="26" y="33" ${T}>2枚の平らな板の間に入る</text><path d="${wave(54, 150, 52, 2)}" fill="none" stroke="#d9480f" stroke-width="1"/>`,
  round: `<circle cx="100" cy="58" r="40" ${Z}/><circle cx="100" cy="58" r="31" fill="#fff" stroke="#d9480f" stroke-width="1.6" stroke-dasharray="5 3"/><path d="M69 58Q71 40 86 31Q100 26 114 32Q131 41 131 58Q131 76 114 84Q100 90 86 84Q71 76 69 58Z" fill="none" stroke="#1d2b53" stroke-width="2.2"/><text x="6" y="14" ${T}>輪切りにした断面の円が、</text><text x="6" y="25" ${T}>2つの同心円の間に入る</text>`,
  cylind: `<rect x="30" y="38" width="140" height="44" rx="4" ${P}/><rect x="30" y="34" width="140" height="52" rx="6" fill="none" stroke="#d9480f" stroke-width="1.6" stroke-dasharray="5 3"/><rect x="30" y="42" width="140" height="36" rx="4" fill="none" stroke="#d9480f" stroke-width="1.2" stroke-dasharray="5 3"/><text x="30" y="16" ${T}>円筒全体（長さ方向もふくむ）が、</text><text x="30" y="27" ${T}>2つの同軸の円筒の間に入る</text>`,
  lineprof: `<path d="M30 84Q60 20 100 30Q140 40 170 84" fill="none" stroke="#1d2b53" stroke-width="2.4"/><path d="M24 84Q58 12 100 22Q142 32 176 84" fill="none" stroke="#d9480f" stroke-width="1.4" stroke-dasharray="5 3"/><path d="M36 84Q62 28 100 38Q138 48 164 84" fill="none" stroke="#d9480f" stroke-width="1.4" stroke-dasharray="5 3"/><text x="6" y="12" ${T}>断面の曲線が、理想の曲線の両側の帯に入る</text>`,
  surfprof: `<path d="M20 88Q54 30 100 46Q146 62 180 88Z" ${P}/><path d="M14 84Q54 20 100 36Q146 52 186 84" fill="none" stroke="#d9480f" stroke-width="1.4" stroke-dasharray="5 3"/><path d="M26 90Q56 38 100 54Q144 70 174 90" fill="none" stroke="#d9480f" stroke-width="1.4" stroke-dasharray="5 3"/><text x="6" y="12" ${T}>曲面が、理想の曲面の両側の帯に入る</text>`,
  parallel: `<rect x="30" y="76" width="140" height="22" ${D}/><text x="34" y="90" ${T}>基準の面 A</text><rect x="30" y="38" width="140" height="22" ${P}/><rect x="30" y="30" width="140" height="8" ${Z}/><text x="34" y="52" ${T}>上の面</text><text x="6" y="14" ${T}>上の面が、基準Aに平行な2枚の板の間に入る</text>`,
  perpend: `<rect x="20" y="82" width="160" height="18" ${D}/><text x="24" y="95" ${T}>基準の面 A</text><rect x="44" y="26" width="26" height="56" ${P}/><rect x="70" y="26" width="8" height="56" ${Z}/><text x="88" y="46" ${T}>立っている面が、基準Aに</text><text x="88" y="57" ${T}>直角な2枚の板の間に入る</text>`,
  angular: `<path d="M20 90H180" stroke="#0b7a4b" stroke-width="3"/><path d="M40 90L120 30L150 52L80 90Z" ${P}/><path d="M122 22L158 48" stroke="#d9480f" stroke-width="1.6" stroke-dasharray="5 3"/><text x="104" y="102" ${T}>基準A</text><text x="6" y="14" ${T}>斜めの面が、指定した角度の2枚の板の間に入る</text>`,
  position: `<rect x="20" y="30" width="160" height="60" ${P}/><circle cx="60" cy="60" r="12" fill="#fff" stroke="#1d2b53" stroke-width="2"/><circle cx="60" cy="60" r="16" ${Z}/><path d="M60 40V80M40 60H80" stroke="#d9480f" stroke-width="1"/><circle cx="140" cy="60" r="12" fill="#fff" stroke="#1d2b53" stroke-width="2"/><circle cx="140" cy="60" r="16" ${Z}/><text x="20" y="18" ${T}>穴の中心が、理想の位置を中心にした円の中に入る</text>`,
  coaxial: `<rect x="20" y="42" width="52" height="30" ${P}/><rect x="72" y="34" width="60" height="46" ${P}/><rect x="132" y="42" width="48" height="30" ${P}/><path d="M12 57H188" stroke="#0b7a4b" stroke-width="1.6" stroke-dasharray="8 3 2 3"/><rect x="72" y="52" width="60" height="10" ${Z}/><text x="20" y="14" ${T}>太い部分の中心線が、基準の中心線</text><text x="20" y="24" ${T}>のまわりの細い円筒に入る</text>`,
  symmetry: `<rect x="30" y="30" width="140" height="56" ${P}/><rect x="86" y="30" width="28" height="56" fill="#fff" stroke="#1d2b53" stroke-width="2"/><path d="M100 22V94" stroke="#0b7a4b" stroke-width="1.6" stroke-dasharray="8 3 2 3"/><rect x="95" y="30" width="10" height="56" ${Z}/><text x="30" y="16" ${T}>溝の中心面が、基準の中心面をはさむ帯に入る</text>`,
  runout: `<rect x="30" y="38" width="120" height="34" ${P}/><path d="M16 55H164" stroke="#0b7a4b" stroke-width="1.6" stroke-dasharray="8 3 2 3"/><path d="M96 20V38" stroke="#d9480f" stroke-width="3"/><circle cx="96" cy="16" r="9" fill="#fff" stroke="#d9480f" stroke-width="2"/><path d="M160 38Q172 55 160 72" fill="none" stroke="#1d2b53" stroke-width="1.6"/><text x="108" y="14" ${T}>ダイヤルゲージを1か所に当て、</text><text x="108" y="25" ${T}>1回転して振れ幅を見る</text>`,
  totalrun: `<rect x="30" y="38" width="120" height="34" ${P}/><path d="M16 55H164" stroke="#0b7a4b" stroke-width="1.6" stroke-dasharray="8 3 2 3"/><path d="M40 20V38" stroke="#d9480f" stroke-width="3"/><circle cx="40" cy="16" r="9" fill="#fff" stroke="#d9480f" stroke-width="2"/><path d="M52 14H140" stroke="#d9480f" stroke-width="1.6"/><path d="M134 10L142 14L134 18" fill="none" stroke="#d9480f" stroke-width="1.6"/><text x="30" y="90" ${T}>回しながらゲージを端まで動かし、面全体の振れ幅を見る</text>`,
  fillet: `<path d="M30 80H170V92H30Z" ${P}/><path d="M60 80V28H72V80Z" ${P}/><path d="M72 80H108L72 52Z" fill="#f4b183" stroke="#d9480f" stroke-width="2"/><text x="90" y="40" ${T}>三角に盛った溶接部</text>`,
  groove: `<path d="M20 60H92L100 78L108 60H180V78H20Z" ${P}/><path d="M92 60L100 78L108 60Z" fill="#f4b183" stroke="#d9480f" stroke-width="2"/><text x="20" y="30" ${T}>2枚の板の端をななめに削った溝に溶接する</text>`,
  spot: `<rect x="40" y="52" width="120" height="14" ${P}/><rect x="40" y="66" width="120" height="14" ${P}/><ellipse cx="100" cy="66" rx="12" ry="6" fill="#f4b183" stroke="#d9480f" stroke-width="2"/><text x="40" y="34" ${T}>重ねた板を、点で溶かして止める</text>`,
  surface: `<path d="M16 80H184" stroke="#1d2b53" stroke-width="2"/><path d="M16 80${' L26 62 L34 80 L44 66 L52 80 L64 58 L72 80 L84 68 L92 80 L102 60 L110 80 L122 66 L130 80 L142 62 L150 80 L162 68 L170 80 L184 74'}" fill="rgba(240,140,58,0.25)" stroke="#d9480f" stroke-width="2"/><text x="16" y="30" ${T}>表面を拡大して見ると、細かい山と谷がある</text><text x="16" y="42" ${T}>この山谷の大きさを数字で決めるのが「粗さ」</text>`,
  none: '',
}
