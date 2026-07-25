'use client'

import { useEffect, useMemo, useState } from 'react'
import { CompetitorForm } from './CompetitorForm'
import type { AnalysisResult, Competitor } from '@/lib/types'
import { AIResults } from './AIResults'

type AccessLevel = 'guest' | 'member' | 'pro'

export function Dashboard() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [mode, setMode] = useState('mock')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null)
  const [generatedPost, setGeneratedPost] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [accessLevel, setAccessLevel] =
    useState<AccessLevel>('guest')

  async function refresh() {
    const res = await fetch('/api/competitors', {
      cache: 'no-store',
    })

    const json = await res.json()

    setCompetitors(json.competitors ?? [])
    setMode(json.mode ?? 'mock')

    if (!selectedId && json.competitors?.[0]) {
      setSelectedId(json.competitors[0].id)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function collect() {
    setBusy(true)
    setMessage('投稿を収集中…')

    const res = await fetch('/api/collect', {
      method: 'POST',
    })

    const json = await res.json()

    setMessage(
      res.ok
        ? `${json.collected}件の投稿を収集しました`
        : json.error ?? '投稿の収集に失敗しました',
    )

    await refresh()
    setBusy(false)
  }

  async function analyze(id: string) {
    if (accessLevel !== 'pro') {
      setMessage('詳細なAI分析はPRO限定機能です')
      return
    }

    setSelectedId(id)
    setBusy(true)
    setMessage('勝ちパターンを分析中…')

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        competitorId: id,
      }),
    })

    const json = await res.json()

    if (res.ok) {
      setAnalysis(json.result)
      setGeneratedPost('')
      setMessage(
        json.ai
          ? 'AI分析が完了しました'
          : 'ローカル分析が完了しました',
      )
    } else {
      setMessage(json.error ?? '分析に失敗しました')
    }

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
          : `${json.result?.title ?? ''}\n\n${
              json.result?.body ?? ''
            }`

      setGeneratedPost(postText)
      setMessage('投稿を生成しました！')
    } else {
      setMessage(json.error ?? '生成に失敗しました')
    }

    setBusy(false)
  }

  const top = competitors[0]

  const totals = useMemo(
    () =>
      competitors.reduce(
        (sum, competitor) => sum + competitor.posts7d,
        0,
      ),
    [competitors],
  )

  const selected = competitors.find(
    (competitor) => competitor.id === selectedId,
  )

  return (
    <main className="container">
      <header className="header">
        <div className="brand">THREADS RADAR ◉</div>

        <div className="badge">
          MVP / {mode.toUpperCase()} MODE
        </div>
      </header>

      <section className="hero">
        <h1>
          Threads競合分析を、
          <br />
          AIでもっと速く。
        </h1>

        <p className="sub">
          競合アカウントを登録するだけ。
          投稿を収集・分析し、
          次に投稿すべき内容までAIが提案します。
        </p>

        <div className="feature-list">
          <span>AI分析</span>
          <span>投稿生成</span>
          <span>競合ランキング</span>
          <span>7日間分析</span>
        </div>

        <CompetitorForm onCreated={refresh} />

        <div className="access-switcher">
          <button
            type="button"
            className={
              accessLevel === 'guest' ? 'active' : ''
            }
            onClick={() => {
              setAccessLevel('guest')
              setMessage('')
            }}
          >
            未登録
          </button>

          <button
            type="button"
            className={
              accessLevel === 'member' ? 'active' : ''
            }
            onClick={() => {
              setAccessLevel('member')
              setMessage('')
            }}
          >
            無料会員
          </button>

          <button
            type="button"
            className={
              accessLevel === 'pro' ? 'active' : ''
            }
            onClick={() => {
              setAccessLevel('pro')
              setMessage('')
            }}
          >
            PRO
          </button>
        </div>

        {message && (
          <div className="notice">
            {message}
          </div>
        )}
      </section>

      {accessLevel === 'guest' && (
        <section className="guest-result">
          <div className="guest-result-card">
            <div className="eyebrow">
              SEARCH RESULT
            </div>

            <h2>
              {top
                ? `@${top.username}`
                : '競合を検索してください'}
            </h2>

            {top && (
              <div className="guest-result-stats">
                <div>
                  <strong>
                    {top.followers.toLocaleString()}
                  </strong>
                  <span>フォロワー</span>
                </div>

                <div>
                  <strong>{top.posts7d}</strong>
                  <span>7日投稿</span>
                </div>

                <div>
                  <strong>{top.score}</strong>
                  <span>Radar Score</span>
                </div>
              </div>
            )}

            <button
              type="button"
              className="lp-primary-button"
              onClick={() => setAccessLevel('member')}
            >
              無料登録で監視を始める
            </button>
          </div>
        </section>
      )}

      {accessLevel !== 'guest' && (
        <>
          <section className="grid">
            <div className="card">
              <div className="muted">監視中</div>

              <div className="kpi">
                {competitors.length}
              </div>
            </div>

            <div className="card">
              <div className="muted">
                収集した投稿
              </div>

              <div className="kpi">
                {totals}
              </div>
            </div>

            <div className="card">
              <div className="muted">
                急上昇アカウント
              </div>

              <div className="kpi">
                {top
                  ? `@${top.username}`
                  : '未登録'}
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <strong>競合ランキング</strong>

              <button
                type="button"
                className="btn secondary"
                disabled={busy}
                onClick={collect}
              >
                {busy
                  ? '処理中…'
                  : '今すぐ収集'}
              </button>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>アカウント</th>
                    <th>Radar Score</th>
                    <th>フォロワー</th>
                    <th>7日投稿</th>
                    <th>平均反応</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {competitors.map(
                    (competitor, index) => (
                      <tr key={competitor.id}>
                        <td>
                          <span className="rank-badge">
                            {index === 0
                              ? '🥇'
                              : index === 1
                                ? '🥈'
                                : index === 2
                                  ? '🥉'
                                  : `${index + 1}.`}
                          </span>

                          @{competitor.username}
                        </td>

                        <td className="score">
                          {competitor.score}
                        </td>

                        <td>
                          {competitor.followers.toLocaleString()}
                        </td>

                        <td>
                          {competitor.posts7d}
                        </td>

                        <td>
                          {competitor.avgEngagement}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="link-btn"
                            disabled={busy}
                            onClick={() =>
                              analyze(competitor.id)
                            }
                          >
                            {accessLevel === 'pro'
                              ? '分析'
                              : 'PROで分析'}
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {accessLevel === 'member' && (
        <section className="member-preview">
          <div className="member-preview-head">
            <div>
              <div className="eyebrow">
                FOLLOWER TREND
              </div>

              <h2>フォロワー推移</h2>
            </div>

            <span className="member-badge">
              FREE MEMBER
            </span>
          </div>

          <div className="trend-bars">
            {[42, 48, 46, 58, 62, 70, 78].map(
              (height, index) => (
                <div key={index}>
                  <span
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>
              ),
            )}
          </div>

          <div className="pro-teaser">
            <span>PRO</span>

            <p>
              伸びた要因、投稿パターン、AI投稿生成を解放できます。
            </p>

            <button
              type="button"
              className="lp-primary-button"
              onClick={() => setAccessLevel('pro')}
            >
              PROを体験する
            </button>
          </div>
        </section>
      )}

      {accessLevel === 'pro' && (
        <>
          {!analysis && (
            <section className="panel">
              <div className="eyebrow">
                PRO ANALYSIS
              </div>

              <h2>競合を選んでAI分析</h2>

              <p className="muted">
                ランキングの「分析」ボタンを押すと、
                投稿の勝ちパターンと投稿案を表示します。
              </p>
            </section>
          )}

          {analysis && (
            <section className="analysis-grid">
              <article className="panel">
                <div className="eyebrow">
                  @{selected?.username}
                </div>

                <h2>伸びた要因</h2>

                {analysis.growth_factors.map(
                  (factor, index) => (
                    <p key={index}>
                      {index + 1}. {factor}
                    </p>
                  ),
                )}
              </article>

              <article className="panel">
                <div className="eyebrow">
                  再利用可能
                </div>

                <h2>投稿の型</h2>

                {analysis.reusable_patterns.map(
                  (pattern, index) => (
                    <p key={index}>
                      {index + 1}. {pattern}
                    </p>
                  ),
                )}
              </article>

              <article className="panel ideas">
                <div className="eyebrow">
                  あなた向け
                </div>

                <h2>投稿案</h2>

                {analysis.post_ideas.map(
                  (idea, index) => (
                    <div
                      className="idea"
                      key={index}
                    >
                      {idea}
                    </div>
                  ),
                )}
              </article>

              <article className="panel ideas">
                <div className="eyebrow">
                  ✨ AI
                </div>

                <h2>投稿生成</h2>

                <p>
                  この競合分析をもとに、
                  あなた専用のThreads投稿を生成します。
                </p>

                <button
                  type="button"
                  className="btn"
                  disabled={busy}
                  onClick={generatePost}
                >
                  {busy
                    ? '生成中…'
                    : 'この分析から投稿を作る'}
                </button>

                <AIResults
                  generatedPost={generatedPost}
                />
              </article>
            </section>
          )}
        </>
      )}
    </main>
  )
}