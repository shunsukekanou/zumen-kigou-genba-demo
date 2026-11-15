import { useEffect, useRef, type ReactNode } from 'react'
import { GLYPHS, SCENES, glyphSvg } from './glyphs'
import type { Entry } from './data'

/** 項目を選んだとき、一覧の上に重ねて全画面で表示する層。「戻る」ボタン・Escキー・端末の戻る操作で閉じる */
export function Layer({ onClose, backLabel, children }: { onClose: () => void; backLabel: string; children: ReactNode }) {
  const btn = useRef<HTMLButtonElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    try { history.pushState({ layer: 1 }, '') } catch { /* 履歴が使えなくても、ボタンで閉じられる */ }
    const onPop = () => closeRef.current()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('popstate', onPop)
    window.addEventListener('keydown', onKey)
    btn.current?.focus()
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('keydown', onKey)
    }
  }, [])
  function close() {
    if (history.state?.layer) history.back() // 端末の「戻る」と同じ動き（popstate で閉じる）
    else closeRef.current()
  }
  return (
    <div className="layer" role="dialog" aria-modal="true" data-testid="layer">
      <div className="layer-bar">
        <button ref={btn} className="back" onClick={close} data-testid="back">← {backLabel}</button>
      </div>
      <div className="layer-body">{children}
        <button className="back bottom" onClick={close}>← {backLabel}</button>
      </div>
    </div>
  )
}

export function Glyph({ id, size = 56, color = '#14264d' }: { id: string; size?: number; color?: string }) {
  if (!GLYPHS[id]) return null
  return <span className="glyph" style={{ width: size, height: size }} aria-hidden dangerouslySetInnerHTML={{ __html: glyphSvg(id, { size, color, sw: 6 }) }} />
}

export function Scene({ id }: { id?: string }) {
  if (!id || !SCENES[id]) return null
  return (
    <svg className="scene" viewBox="0 0 200 110" role="img" aria-label="模式図" dangerouslySetInnerHTML={{ __html: SCENES[id] }} />
  )
}

export function CheckBadge({ check }: { check: Entry['check'] }) {
  return check === 'ok' ? (
    <span className="badge ok" title="規格の番号・版・名称を、公開資料で確認した">規格の版・名称：確認済み</span>
  ) : (
    <span className="badge gen" title="一般的な解説にもとづく。規格票の原文では確認していない">一般知識・要原文確認</span>
  )
}

export function Detail({ e, compact }: { e: Entry; compact?: boolean }) {
  return (
    <div className="detail">
      <div className="detail-head">
        {e.glyph && <Glyph id={e.glyph} size={compact ? 52 : 72} />}
        <div>
          <h3>{e.name}</h3>
          <div className="muted">{e.yomi}　｜　{e.cat}</div>
        </div>
      </div>
      <p className="meaning"><b>意味：</b>{e.meaning}</p>
      <Scene id={e.scene} />
      <dl>
        <dt>品物のどんな形状の、どの部分の精度か</dt>
        <dd>{e.shape}</dd>
        <dt>現場の言葉で言うと（例）</dt>
        <dd>{e.field}</dd>
        {e.measure !== '—' && (<><dt>測り方</dt><dd>{e.measure}</dd></>)}
        <dt>加工・扱うときの注意</dt>
        <dd>{e.caution}</dd>
        <dt>規格</dt>
        <dd>{e.std}　<CheckBadge check={e.check} /></dd>
      </dl>
    </div>
  )
}
