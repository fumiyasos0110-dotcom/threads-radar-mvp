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
    {analysis && <section className="analysis-grid">
      <article className="panel"><div className="eyebrow">@{selected?.username}</div><h2>伸びた要因</h2>{analysis.growth_factors.map((x,i)=><p key={i}>{i+1}. {x}</p>)}</article>
      <article className="panel"><div className="eyebrow">再利用可能</div><h2>投稿の型</h2>{analysis.reusable_patterns.map((x,i)=><p key={i}>{i+1}. {x}</p>)}</article>
      <article className="panel ideas"><div className="eyebrow">あなた向け</div><h2>投稿案</h2>{analysis.post_ideas.map((x,i)=><div className="idea" key={i}>{x}</div>)}</article>
    </section>}
  </main>
}
