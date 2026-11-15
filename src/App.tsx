import { useState } from 'react'
import ListView from './ListView'
import SearchView from './SearchView'
import { ENTRIES, SOURCES } from './data'

type Tab = 'list' | 'search' | 'about'

export default function App() {
  const [tab, setTab] = useState<Tab>('list')
  const n = ENTRIES.length
  return (
    <div className="app">
      <header className="top">
        <div className="top-in">
          <h1>図面記号 現場翻訳</h1>
          <p>JISの図面記号を、「品物のどこの、何の精度か」に言い換える。一覧表と、写真から探す端末内の検索。</p>
        </div>
      </header>
      <nav className="tabs" role="tablist" aria-label="画面の切り替え">
        <button role="tab" aria-selected={tab === 'list'} className={tab === 'list' ? 'on' : ''} onClick={() => setTab('list')}>📋 一覧表<small>{n}件</small></button>
        <button role="tab" aria-selected={tab === 'search'} className={tab === 'search' ? 'on' : ''} onClick={() => setTab('search')}>📷 記号検索<small>撮影・画像</small></button>
        <button role="tab" aria-selected={tab === 'about'} className={tab === 'about' ? 'on' : ''} onClick={() => setTab('about')}>ℹ 出典・注意<small>確認の範囲</small></button>
      </nav>
      <main>
        {tab === 'list' && <ListView />}
        {tab === 'search' && <SearchView />}
        {tab === 'about' && <About />}
      </main>
      <footer>図面記号 現場翻訳 ｜ データはこの端末の中だけ・外部送信なし</footer>
    </div>
  )
}

function About() {
  return (
    <section className="panel" aria-label="出典・注意">
      <h2>出典と、確認できた範囲</h2>
      <p className="lead">このアプリは、規格票の転載ではなく、現場向けに言い換えた要約です。最後は、必ず自社の規格票と図面の凡例で確かめてください。</p>
      <h3>公開資料で確認したこと</h3>
      <ul className="src">
        {SOURCES.map((s) => (<li key={s.label}><b>{s.label}</b><br /><span className="muted">{s.note}</span></li>))}
      </ul>
      <h3>確認できていないこと（正直に）</h3>
      <ul className="src">
        <li>各記号の意味・測り方・加工時の注意の文は、一般的な解説にもとづく言い換えです。規格票の本文では、1つずつ確かめていません。</li>
        <li>旧い三角記号（▽）と Ra の対応は、資料によって区切りが違い、原文では確認していません（目安）。</li>
        <li>溶接記号の「矢の側・反対側」の書き方、記号の細かい寸法の指示は、原文では確認していません。</li>
        <li>画像検索は、形の似かたで候補を並べる仕組みです。実際の図面の写真で、どれだけ当たるかは確かめていません（見本カードでは確認）。</li>
        <li>材質の規格番号のうち、一部は、販売会社の資料や一般知識によります（画面に「要原文確認」と表示）。</li>
      </ul>
      <h3>画像の扱い</h3>
      <p>撮影・選んだ画像は、この端末のブラウザの中だけで調べます。外部のAIやサーバーに送る仕組みを、アプリは持っていません。画像は保存もしません（画面を閉じると消えます）。</p>
    </section>
  )
}
