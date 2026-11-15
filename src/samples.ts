// 「見本の図面記号カード」で撮影する体験用の画像を、その場で描く（実際の図面ではない・架空）。
// 紙を斜めから撮ったような、少しの傾き・ざらつき・ぼかしを足す。照合のしくみは、実際の写真と同じものを通す。
import { glyphSvg } from './glyphs'
import type { Box } from './match'

export interface SampleCard { id: string; label: string; entryId: string; value: string; datum: string }
export const SAMPLE_CARDS: SampleCard[] = [
  { id: 'c1', label: '見本カード①（平行度の枠）', entryId: 'parallel', value: '0.02', datum: 'A' },
  { id: 'c2', label: '見本カード②（同軸度の枠）', entryId: 'coaxial', value: 'φ0.01', datum: 'B' },
  { id: 'c3', label: '見本カード③（円周振れの枠）', entryId: 'runout', value: '0.03', datum: 'A' },
  { id: 'c4', label: '見本カード④（位置度の枠）', entryId: 'position', value: 'φ0.1', datum: 'A' },
]

const GL: Record<string, string> = { parallel: 'parallel', coaxial: 'coaxial', runout: 'runout', position: 'position' }

function loadSvg(svg: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = () => rej(new Error('svg'))
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  })
}

export async function makeSample(card: SampleCard, seed = 1): Promise<{ canvas: HTMLCanvasElement; box: Box }> {
  const W = 640, H = 420
  const base = document.createElement('canvas')
  base.width = W
  base.height = H
  const g = base.getContext('2d')!
  g.fillStyle = '#f4f0e4'
  g.fillRect(0, 0, W, H)
  g.strokeStyle = 'rgba(80,100,140,0.12)'
  g.lineWidth = 1
  for (let x = 0; x < W; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke() }
  for (let y = 0; y < H; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke() }
  g.strokeStyle = '#222'
  g.fillStyle = '#222'
  g.lineWidth = 2.5
  // 部品の外形（階段状の軸。架空）
  g.strokeRect(70, 190, 120, 70)
  g.strokeRect(190, 170, 180, 110)
  g.strokeRect(370, 190, 120, 70)
  g.setLineDash([14, 4, 3, 4])
  g.lineWidth = 1.5
  g.beginPath(); g.moveTo(50, 225); g.lineTo(520, 225); g.stroke()
  g.setLineDash([])
  // 寸法線
  g.lineWidth = 1.5
  g.beginPath(); g.moveTo(190, 310); g.lineTo(370, 310); g.stroke()
  g.beginPath(); g.moveTo(190, 285); g.lineTo(190, 318); g.moveTo(370, 285); g.lineTo(370, 318); g.stroke()
  g.font = '20px sans-serif'
  g.fillText('60', 268, 336)
  // 公差記入枠：［記号｜値｜基準］
  const fx = 110, fy = 70, cell = 56
  const wVal = 96
  g.lineWidth = 2.5
  g.strokeRect(fx, fy, cell, cell)
  g.strokeRect(fx + cell, fy, wVal, cell)
  g.strokeRect(fx + cell + wVal, fy, cell, cell)
  const img = await loadSvg(glyphSvg(GL[card.entryId] ?? card.entryId, { size: 100, color: '#222', sw: 5 }))
  const gs = cell - 14
  g.drawImage(img, fx + 7, fy + 7, gs, gs)
  g.font = 'bold 26px sans-serif'
  g.textBaseline = 'middle'
  g.textAlign = 'center'
  g.fillText(card.value, fx + cell + wVal / 2, fy + cell / 2)
  g.fillText(card.datum, fx + cell + wVal + cell / 2, fy + cell / 2)
  g.textAlign = 'left'
  // 指示線（枠から品物の面へ）
  g.lineWidth = 2
  g.beginPath(); g.moveTo(fx + 20, fy + cell); g.lineTo(250, 170); g.stroke()
  g.beginPath(); g.moveTo(250, 170); g.lineTo(240, 178); g.lineTo(256, 180); g.closePath(); g.fill()
  g.font = '16px sans-serif'
  g.textBaseline = 'alphabetic'
  g.fillStyle = '#555'
  g.fillText('見本図面（架空・練習用）', 24, 396)
  // 撮影した写真のような見た目：少し傾ける・ざらつき・ぼかし・端の暗がり
  const out = document.createElement('canvas')
  out.width = W
  out.height = H
  const o = out.getContext('2d', { willReadFrequently: true })!
  const ang = ((seed % 3) - 1) * 0.018 + 0.012
  o.fillStyle = '#d9d4c4'
  o.fillRect(0, 0, W, H)
  o.save()
  o.translate(W / 2, H / 2)
  o.rotate(ang)
  o.filter = 'blur(0.7px)'
  o.drawImage(base, -W / 2, -H / 2)
  o.restore()
  o.filter = 'none'
  const grad = o.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.65)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,0.22)')
  o.fillStyle = grad
  o.fillRect(0, 0, W, H)
  const id = o.getImageData(0, 0, W, H)
  let s = seed * 9301 + 49297
  for (let i = 0; i < id.data.length; i += 4) {
    s = (s * 9301 + 49297) % 233280
    const n = (s / 233280 - 0.5) * 26
    id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n
  }
  o.putImageData(id, 0, 0)
  // 枠の記号の格のまわりに、少し余白を持たせて囲む（枠の線は含めない）
  const cx = fx + cell / 2 - W / 2, cy = fy + cell / 2 - H / 2
  const rx = cx * Math.cos(ang) - cy * Math.sin(ang) + W / 2
  const ry = cx * Math.sin(ang) + cy * Math.cos(ang) + H / 2
  const half = cell / 2 - 3
  return { canvas: out, box: { x: rx - half, y: ry - half, w: half * 2, h: half * 2 } }
}
