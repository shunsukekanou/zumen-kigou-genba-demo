import { GLYPHS, SCENES, glyphSvg } from './glyphs'
import type { Entry } from './data'

export function Glyph({ id, size = 56, color = '#1d2b53' }: { id: string; size?: number; color?: string }) {
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
