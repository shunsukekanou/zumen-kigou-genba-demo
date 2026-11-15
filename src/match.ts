// 端末の中だけで動く、記号の形の照合。画像は、どこにも送らない（通信のコードを持たない）。
// 手順：①囲んだ範囲を白黒にする ②枠線など、範囲のふちにつながった線を消す ③残った線を一定の大きさにそろえ、ぼかす
//       ④収録した記号の「見本の型」と、形の似かたを比べる
import { GLYPHS, glyphSvg } from './glyphs'
import { GLYPH_ENTRIES } from './data'

const N = 32 // 型の大きさ
const INNER = 28

export interface Box { x: number; y: number; w: number; h: number }

function otsu(gray: Uint8ClampedArray): number {
  const hist = new Array(256).fill(0)
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++
  const total = gray.length
  let sum = 0
  for (let t = 0; t < 256; t++) sum += t * hist[t]
  let sumB = 0, wB = 0, best = 0, thr = 128
  for (let t = 0; t < 256; t++) {
    wB += hist[t]
    if (!wB) continue
    const wF = total - wB
    if (!wF) break
    sumB += t * hist[t]
    const mB = sumB / wB, mF = (sum - sumB) / wF
    const v = wB * wF * (mB - mF) * (mB - mF)
    if (v > best) { best = v; thr = t }
  }
  return thr
}

/** 白黒（true＝線）にする。線のほうが少ない前提で、多いほうを背景にする */
function binarize(img: ImageData): { ink: Uint8Array; w: number; h: number } {
  const { width: w, height: h, data } = img
  const gray = new Uint8ClampedArray(w * h)
  for (let i = 0; i < w * h; i++) gray[i] = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) | 0
  const thr = otsu(gray)
  const ink = new Uint8Array(w * h)
  let dark = 0
  for (let i = 0; i < w * h; i++) if (gray[i] <= thr) { ink[i] = 1; dark++ }
  if (dark > (w * h) / 2) for (let i = 0; i < w * h; i++) ink[i] = ink[i] ? 0 : 1
  return { ink, w, h }
}

/** つながった線のかたまり（8近傍）に分け、範囲のふちに触れるもの・ごく小さいもの（ごみ）を消す */
function cleanup(ink: Uint8Array, w: number, h: number, dropEdge: boolean): Uint8Array {
  const label = new Int32Array(w * h)
  const comps: { px: number[]; edge: boolean }[] = []
  for (let s = 0; s < w * h; s++) {
    if (!ink[s] || label[s]) continue
    const id = comps.length + 1
    const stack = [s]
    label[s] = id
    const px: number[] = []
    let edge = false
    while (stack.length) {
      const p = stack.pop()!
      px.push(p)
      const x = p % w, y = (p / w) | 0
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const q = ny * w + nx
        if (ink[q] && !label[q]) { label[q] = id; stack.push(q) }
      }
    }
    comps.push({ px, edge })
  }
  const keep = comps.filter((c) => !(dropEdge && c.edge))
  const maxA = Math.max(0, ...keep.map((c) => c.px.length))
  const out = new Uint8Array(w * h)
  for (const c of keep) if (c.px.length >= Math.max(4, maxA * 0.06)) for (const p of c.px) out[p] = 1
  return out
}

/** 線の外側の枠（外接の四角）で切り出し、N×N にそろえて、ぼかした数値の並びにする */
function normalize(ink: Uint8Array, w: number, h: number): Float32Array | null {
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (ink[y * w + x]) {
    if (x < x0) x0 = x
    if (x > x1) x1 = x
    if (y < y0) y0 = y
    if (y > y1) y1 = y
  }
  if (x1 < 0) return null
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1
  const scale = INNER / Math.max(bw, bh)
  const ow = Math.max(1, Math.round(bw * scale)), oh = Math.max(1, Math.round(bh * scale))
  const grid = new Float32Array(N * N)
  const ox = ((N - ow) / 2) | 0, oy = ((N - oh) / 2) | 0
  // 面積の平均で縮める
  for (let gy = 0; gy < oh; gy++) for (let gx = 0; gx < ow; gx++) {
    const sx0 = x0 + gx / scale, sx1 = x0 + (gx + 1) / scale
    const sy0 = y0 + gy / scale, sy1 = y0 + (gy + 1) / scale
    let s = 0, c = 0
    for (let yy = Math.floor(sy0); yy < Math.ceil(sy1) && yy < h; yy++) for (let xx = Math.floor(sx0); xx < Math.ceil(sx1) && xx < w; xx++) { s += ink[yy * w + xx]; c++ }
    grid[(oy + gy) * N + ox + gx] = c ? Math.min(1, (s / c) * 2.2) : 0
  }
  // 太さの違いをならすため、2回ぼかす（3×3の平均）
  let cur = grid
  for (let r = 0; r < 2; r++) {
    const nxt = new Float32Array(N * N)
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let s = 0
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && ny >= 0 && nx < N && ny < N) s += cur[ny * N + nx]
      }
      nxt[y * N + x] = s / 9
    }
    cur = nxt
  }
  // 平均を引いて、長さを1にする（形の似かたを、内積で比べる）
  let mean = 0
  for (const v of cur) mean += v
  mean /= cur.length
  let norm = 0
  for (let i = 0; i < cur.length; i++) { cur[i] -= mean; norm += cur[i] * cur[i] }
  norm = Math.sqrt(norm) || 1
  for (let i = 0; i < cur.length; i++) cur[i] /= norm
  return cur
}

let templates: Map<string, Float32Array> | null = null

function loadSvg(svg: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = () => rej(new Error('svg'))
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  })
}

/** 収録した記号の「見本の型」を、描いて作る（最初の1回だけ） */
export async function buildTemplates(): Promise<Map<string, Float32Array>> {
  if (templates) return templates
  const m = new Map<string, Float32Array>()
  const S = 160
  for (const id of Object.keys(GLYPHS)) {
    const img = await loadSvg(glyphSvg(id, { size: S, color: '#000', sw: 7 }))
    const c = document.createElement('canvas')
    c.width = c.height = S
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, S, S)
    ctx.drawImage(img, 0, 0, S, S)
    const { ink, w, h } = binarize(ctx.getImageData(0, 0, S, S))
    const v = normalize(ink, w, h)
    if (v) m.set(id, v)
  }
  templates = m
  return m
}

export interface Hit { id: string; score: number }

/** 画像の中の囲んだ範囲を調べ、似ている順に並べる。tags があれば、その特徴を持つ記号に絞る */
export async function search(source: CanvasImageSource, box: Box, tags: string[]): Promise<{ hits: Hit[]; ok: boolean }> {
  const tpl = await buildTemplates()
  const bw = Math.max(8, Math.round(box.w)), bh = Math.max(8, Math.round(box.h))
  // 大きすぎる範囲は、計算を軽くするため縮める
  const k = Math.min(1, 120 / Math.max(bw, bh))
  const cw = Math.max(8, Math.round(bw * k)), ch = Math.max(8, Math.round(bh * k))
  const c = document.createElement('canvas')
  c.width = cw
  c.height = ch
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, cw, ch)
  ctx.drawImage(source, box.x, box.y, box.w, box.h, 0, 0, cw, ch)
  const b = binarize(ctx.getImageData(0, 0, cw, ch))
  const clean = cleanup(b.ink, b.w, b.h, true)
  const q = normalize(clean, b.w, b.h)
  if (!q) return { hits: [], ok: false }
  const hits: Hit[] = []
  for (const e of GLYPH_ENTRIES) {
    if (tags.length && !tags.every((t) => e.tags?.includes(t))) continue
    const t = tpl.get(e.glyph!)
    if (!t) continue
    let s = 0
    for (let i = 0; i < t.length; i++) s += t[i] * q[i]
    hits.push({ id: e.id, score: s })
  }
  hits.sort((a, b2) => b2.score - a.score)
  return { hits, ok: true }
}
