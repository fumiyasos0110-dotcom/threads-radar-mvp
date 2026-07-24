'use client'
import { useEffect, useMemo, useState } from 'react'
import { CompetitorForm } from './CompetitorForm'
import type { AnalysisResult, Competitor } from '@/lib/types'

export function Dashboard() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [mode, setMode] = useState('mock')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
const [generatedPost, setGeneratedPost] = useState('')
const [selectedId, setSelectedId] = useState('')

  async function refresh() {
    const res = await fetch('/api/competitors', { cache: 'no-store' })
    const json = await res.json()
    setCompetitors(json.competitors ?? [])
    setMode(json.mode ?? 'mock')
    if (!selectedId && json.competitors?.[0]) setSelectedId(json.competitors[0].id)
  }

  useEffect(() => { refresh() }, [])

  async function collect() {
    setBusy(true); setMessage('投稿を収集中…')
    const res = await fetch('/api/collect', { method: 'POST' })
    const json = await res.json()
    setMessage(res.ok ? `${json.collected}件の投稿を収集しました` : json.error)
    await refresh(); setBusy(false)
  }

  async function analyze(id: string) {
    setSelectedId(id); setBusy(true); setMessage('勝ちパターンを分析中…')
    const res = await fetch('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ competitorId: id }) })
    const json = await res.json()
    if (res.ok) { setAnalysis(json.result); setMessage(json.ai ? 'AI分析が完了しました' : 'ローカル分析が完了しました') }
    else setMessage(json.error ?? '分析に失敗しました')
    setBusy(false)
  }
async function generatePost() {
  if (!analysis) return

  setBusy(true)
  setMessage('AIが投稿を作成中…')

  const res = await fetch('/api/generate-post', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      analysis,
    }),
  })

  const json = await res.json()

if (res.ok) {
  const postText =
    typeof json.result === 'string'
      ? json.result
      : `${json.result.title ?? ''}\n\n${json.result.body ?? ''}`

  setGeneratedPost(postText)
  setMessage('投稿を生成しました！')
} else {
  setMessage(json.error ?? '生成に失敗しました')
}

setBusy(false)
}
  const top = competitors[0]
  const totals = useMemo(() => competitors.reduce((sum, c) => sum + c.posts7d, 0), [competitors])
  const selected = competitors.find(c => c.id === selectedId)

  return <main className="container">
    <header className="header"><div className="brand">THREADS RADAR ◉</div><div className="badge">MVP / {mode.toUpperCase()} MODE</div></header>
    <section className="hero">
      <h1>競合の「伸びた理由」を、<br/>毎朝ひろう。</h1>
      <p className="sub">公開投稿を定期収集し、反応率・投稿速度・文章構造を比較。AIが勝ちパターンと、あなた向けの投稿案へ変換します。</p>
      <CompetitorForm onCreated={refresh} />
      {message && <div className="notice">{message}</div>}
    </section>
    <section className="grid">
      <div className="card"><div className="muted">監視アカウント</div><div className="kpi">{competitors.length}</div></div>
      <div className="card"><div className="muted">7日間の収集投稿</div><div className="kpi">{totals}</div></div>
      <div className="card"><div className="muted">今週の急上昇</div><div className="kpi">{top ? `@${top.username}` : '未登録'}</div></div>
    </section>
    <section className="panel">
      <div className="panel-head"><strong>競合ランキング</strong><button className="btn secondary" disabled={busy} onClick={collect}>{busy ? '処理中…' : '今すぐ収集'}</button></div>
      <div className="table-wrap"><table className="table"><thead><tr><th>アカウント</th><th>Radar Score</th><th>フォロワー</th><th>7日投稿</th><th>平均反応</th><th></th></tr></thead>
      <tbody>{competitors.map(c=><tr key={c.id}><td>@{c.username}</td><td className="score">{c.score}</td><td>{c.followers.toLocaleString()}</td><td>{c.posts7d}</td><td>{c.avgEngagement}</td><td><button className="link-btn" disabled={busy} onClick={()=>analyze(c.id)}>分析</button></td></tr>)}</tbody></table></div>
    </section>
        {analysis && (
      <section className="analysis-grid">
        <article className="panel">
          <div className="eyebrow">@{selected?.username}</div>
          <h2>伸びた要因</h2>

          {analysis.growth_factors.map((x, i) => (
            <p key={i}>
              {i + 1}. {x}
            </p>
          ))}
        </article>

        <article className="panel">
          <div className="eyebrow">再利用可能</div>
          <h2>投稿の型</h2>

          {analysis.reusable_patterns.map((x, i) => (
            <p key={i}>
              {i + 1}. {x}
            </p>
          ))}
        </article>

        <article className="panel ideas">
          <div className="eyebrow">あなた向け</div>
          <h2>投稿案</h2>

          {analysis.post_ideas.map((x, i) => (
            <div className="idea" key={i}>
              {x}
            </div>
          ))}
        </article>

        <article className="panel ideas">
          <div className="eyebrow">✨ AI</div>
          <h2>投稿生成</h2>

          <p>
            この競合分析をもとに、
            あなた専用のThreads投稿を生成します。
          </p>

          <button
  className="btn"
  disabled={busy}
  onClick={generatePost}
>
  {busy ? '生成中…' : 'この分析から投稿を作る'}
</button>
{generatedPost && (
  <div
    className="idea"
    style={{
      marginTop: 20,
      whiteSpace: 'pre-wrap',
    }}
  >
    <h3>✨ AIが作成したThreads投稿</h3>
<div style={{ display: 'grid', gap: 20, marginTop: 20 }}>
  {generatedPost
    .split('###')
    .filter(Boolean)
    .map((section, index) => {
      const lines = section.trim().split('\n')
      const title = lines.shift() || ''
      const body = lines.join('\n').trim()

      return (
        <div
          key={index}
          style={{
            border: '1px solid #2a2a2a',
            borderRadius: 14,
            padding: 20,
            background: '#111827',
          }}
        >
          <h3 style={{ marginBottom: 16 }}>
            {title.trim()}
          </h3>

          <div
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            {body}
          </div>

          <button
            className="btn secondary"
            style={{ marginTop: 20 }}
            onClick={() => {
              navigator.clipboard.writeText(body)
              alert('コピーしました！')
            }}
          >
            📋 この投稿をコピー
          </button>
        </div>
      )
    })}
</div>
   
     
  </div>
)}
        </article>
      </section>
    )}
  </main>
}