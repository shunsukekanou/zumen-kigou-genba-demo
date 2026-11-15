import { useMemo, useState } from 'react'
import { CATS, CAT_NOTE, ENTRIES, type Cat, type Entry } from './data'
import { CheckBadge, Detail, Glyph, Layer } from './ui'

function norm(s: string): string {
  return s.toLowerCase().normalize('NFKC').replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60)).replace(/\s+/g, '')
}
function hay(e: Entry): string {
  return norm([e.name, e.yomi, e.cat, e.meaning, e.shape, e.field, e.std, ...e.keys].join(' '))
}

export default function ListView() {
  const [cat, setCat] = useState<Cat | 'すべて'>('すべて')
  const [q, setQ] = useState('')
  const [table, setTable] = useState(false)
  const [open, setOpen] = useState<string | null>(null)

  const list = useMemo(() => {
    const words = q.split(/[\s　]+/).map(norm).filter(Boolean)
    return ENTRIES.filter((e) => (cat === 'すべて' || e.cat === cat) && words.every((w) => hay(e).includes(w)))
  }, [cat, q])

  const opened = open ? ENTRIES.find((e) => e.id === open) : undefined

  return (
    <section className="panel" aria-label="JIS図面記号 一覧表">
      <h2>JIS図面記号 一覧表</h2>
      <p className="lead">カテゴリを選ぶか、言葉で探します。項目をタップすると、意味・「品物のどの形状のどの部分の精度か」・測り方の画面が重なって開き、「戻る」で選び直せます。</p>

      <div className="btn-row">
        <button className={'btn' + (table ? ' primary' : ' accent')} onClick={() => setTable(!table)} data-testid="table-btn" aria-pressed={table}>
          {table ? '▤ カードの表示に戻す' : '📋 一覧表をまるごと表示'}
        </button>
        {table && <button className="btn" onClick={() => window.print()}>🖨 A4で印刷・PDF保存</button>}
      </div>

      <input className="search" type="search" placeholder="言葉で探す（例：まるさ、平行、キー溝、SK3）" value={q} onChange={(e) => setQ(e.target.value)} aria-label="言葉で探す" data-testid="q" />
      <div className="chips" role="tablist" aria-label="カテゴリ">
        {(['すべて', ...CATS] as const).map((c) => (
          <button key={c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)} aria-pressed={cat === c}>{c}</button>
        ))}
      </div>
      {cat !== 'すべて' && <p className="muted small">{CAT_NOTE[cat]}</p>}
      <p className="muted small" data-testid="count">{list.length} 件</p>

      {table ? (
        <div className="tablewrap" data-testid="table">
          <table>
            <thead><tr><th>記号</th><th>名前</th><th>種類</th><th>意味</th><th>規格</th></tr></thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id} className="clickable" onClick={() => setOpen(e.id)}>
                  <td className="tg">{e.glyph ? <Glyph id={e.glyph} size={34} /> : '—'}</td>
                  <td><b>{e.name}</b><div className="muted small">{e.yomi}</div></td>
                  <td>{e.cat}</td>
                  <td>{e.meaning}</td>
                  <td className="small">{e.std}<br /><CheckBadge check={e.check} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="cards">
          {list.map((e) => (
            <li key={e.id} className="card">
              <button className="card-head" onClick={() => setOpen(e.id)} data-testid="card">
                {e.glyph ? <Glyph id={e.glyph} size={46} /> : <span className="glyph txt">{e.cat.slice(0, 2)}</span>}
                <span className="card-name"><b>{e.name}</b><small>{e.cat}　{e.yomi}</small></span>
                <span className="chev" aria-hidden>›</span>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="empty">見つかりません。言葉を短くするか、カテゴリを「すべて」にしてください。</li>}
        </ul>
      )}
      {opened && (
        <Layer onClose={() => setOpen(null)} backLabel="一覧に戻る">
          <Detail e={opened} />
        </Layer>
      )}
    </section>
  )
}
