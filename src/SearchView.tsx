import { useCallback, useEffect, useRef, useState } from 'react'
import { byId, TAGS } from './data'
import { search, type Box, type Hit } from './match'
import { SAMPLE_CARDS, makeSample } from './samples'
import { Detail, Glyph } from './ui'

const MAX_SIDE = 900

function fitLabel(s: number): { text: string; cls: string } {
  if (s >= 0.75) return { text: 'かなり似ています', cls: 'hi' }
  if (s >= 0.55) return { text: '似ています', cls: 'mid' }
  return { text: 'あまり似ていません', cls: 'lo' }
}

export default function SearchView() {
  const [src, setSrc] = useState<HTMLCanvasElement | null>(null)
  const [srcName, setSrcName] = useState('')
  const [box, setBox] = useState<Box | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [hits, setHits] = useState<Hit[] | null>(null)
  const [noInk, setNoInk] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sampleNo, setSampleNo] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)

  // 画像を表示用の canvas に描く
  useEffect(() => {
    const c = canvasRef.current
    if (!c || !src) return
    c.width = src.width
    c.height = src.height
    c.getContext('2d')!.drawImage(src, 0, 0)
  }, [src])

  // 囲んだ範囲か、特徴の選択が変わったら、調べ直す
  useEffect(() => {
    if (!src || !box) return
    let alive = true
    const t = setTimeout(async () => {
      setBusy(true)
      const r = await search(src, box, tags)
      if (!alive) return
      setNoInk(!r.ok)
      setHits(r.ok ? r.hits : [])
      setBusy(false)
    }, 120)
    return () => { alive = false; clearTimeout(t) }
  }, [src, box, tags])

  const setImage = useCallback((c: HTMLCanvasElement, name: string, b: Box) => {
    setSrc(c); setSrcName(name); setBox(b); setHits(null); setOpen(null); setNoInk(false)
  }, [])

  async function onFile(f: File | undefined) {
    if (!f) return
    const url = URL.createObjectURL(f)
    try {
      const img = new Image()
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('image')); img.src = url })
      const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
      const c = document.createElement('canvas')
      c.width = Math.round(img.naturalWidth * k)
      c.height = Math.round(img.naturalHeight * k)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      const s = Math.round(Math.min(c.width, c.height) * 0.22)
      setImage(c, f.name, { x: (c.width - s) / 2, y: (c.height - s) / 2, w: s, h: s })
    } catch {
      alert('画像を読み込めませんでした。写真（JPEG・PNG など）を選んでください。')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  async function trySample() {
    const card = SAMPLE_CARDS[sampleNo % SAMPLE_CARDS.length]
    const r = await makeSample(card, sampleNo + 1)
    setImage(r.canvas, card.label, r.box)
    setSampleNo(sampleNo + 1)
  }

  // 画像の上をなぞって、調べたい記号を四角で囲む
  function pos(ev: React.PointerEvent) {
    const r = wrapRef.current!.getBoundingClientRect()
    return { x: ((ev.clientX - r.left) / r.width) * src!.width, y: ((ev.clientY - r.top) / r.height) * src!.height }
  }
  function down(ev: React.PointerEvent) {
    if (!src) return
    ;(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId)
    drag.current = pos(ev)
  }
  function move(ev: React.PointerEvent) {
    if (!drag.current || !src) return
    const p = pos(ev)
    const s = drag.current
    setBox({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.max(10, Math.abs(p.x - s.x)), h: Math.max(10, Math.abs(p.y - s.y)) })
  }
  function up() { drag.current = null }

  const shown = hits ? hits.slice(0, 3) : []
  const css = box && src ? {
    left: `${(box.x / src.width) * 100}%`, top: `${(box.y / src.height) * 100}%`,
    width: `${(box.w / src.width) * 100}%`, height: `${(box.h / src.height) * 100}%`,
  } : undefined

  return (
    <section className="panel" aria-label="図面記号から検索">
      <h2>図面記号から検索</h2>
      <p className="lead">図面の記号を撮る（または画像を選ぶ）→ 調べたい記号を指でなぞって囲む → 候補と「何の精度か」が出ます。</p>
      <p className="privacy" data-testid="privacy">🔒 画像は、この端末の中だけで調べます。外部のAIやサーバーには送りません。</p>

      <div className="btn-row">
        <label className="btn primary">
          📷 撮影する
          <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
        </label>
        <label className="btn">
          🖼 画像を選ぶ
          <input type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
        </label>
        <button className="btn accent" onClick={trySample} data-testid="sample-btn">
          📄 見本の図面記号カードで撮影体験
        </button>
      </div>
      <p className="muted small">図面が手元にないときは、見本カードで試せます（押すたびに別の記号の枠。架空の練習用）。</p>

      {src ? (
        <>
          <div className="step"><span className="num">①</span>調べたい<b>記号だけ</b>を、指でなぞって囲みます（枠の線は入れず、記号の外に少し余白を）。</div>
          <div className="imgwrap" ref={wrapRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-testid="imgwrap">
            <canvas ref={canvasRef} className="srcimg" />
            {css && <div className="box" style={css} data-testid="box" />}
          </div>
          <p className="muted small">いまの画像：{srcName}</p>

          <div className="step"><span className="num">②</span>候補（似ている順）　<span className="muted small">形が合わないときは、下の「特徴を選ぶ」で絞れます</span></div>
          {busy && !hits && <p className="muted">調べています…</p>}
          {noInk && <p className="warn">囲んだ範囲に、線が見つかりません。記号がはっきり入るように、囲み直してください。</p>}
          <ol className="hits" data-testid="hits">
            {shown.map((h, i) => {
              const e = byId(h.id)!
              const f = fitLabel(h.score)
              const isOpen = open === h.id || (open === null && i === 0)
              return (
                <li key={h.id} className={'hit ' + f.cls}>
                  <button className="hit-head" onClick={() => setOpen(isOpen ? '' : h.id)} aria-expanded={isOpen}>
                    <span className="rank">{i + 1}</span>
                    {e.glyph && <Glyph id={e.glyph} size={44} />}
                    <span className="hit-name"><b>{e.name}</b><small>{e.cat}　{f.text}</small></span>
                    <span className="bar" aria-hidden><i style={{ width: `${Math.max(4, Math.min(100, h.score * 100))}%` }} /></span>
                  </button>
                  {isOpen && <Detail e={e} compact />}
                </li>
              )
            })}
          </ol>
          {hits && hits.length > 0 && <p className="muted small">※ 形の似かたで並べた候補です。最後は、図面の凡例や規格で確かめてください。</p>}
          {hits && hits.length === 0 && !noInk && <p className="warn">その特徴の記号は見つかりません。特徴の選択を減らしてください。</p>}
        </>
      ) : (
        <div className="empty">まだ画像がありません。上の3つのボタンのどれかを押してください。</div>
      )}

      <details className="assist">
        <summary>特徴を選んで絞る（形が合わないときの補助）</summary>
        <p className="muted small">記号に当てはまる特徴を、タップで選びます（複数OK）。選んだ特徴を、すべて持つ記号だけに絞ります。</p>
        <div className="chips">
          {TAGS.map((t) => (
            <button key={t.id} className={'chip' + (tags.includes(t.id) ? ' on' : '')} aria-pressed={tags.includes(t.id)} onClick={() => setTags(tags.includes(t.id) ? tags.filter((x) => x !== t.id) : [...tags, t.id])}>
              {t.label}
            </button>
          ))}
          {tags.length > 0 && <button className="chip clear" onClick={() => setTags([])}>選択をやめる</button>}
        </div>
      </details>
    </section>
  )
}
