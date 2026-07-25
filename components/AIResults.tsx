'use client'

import { useState } from 'react'

type AIResultsProps = {
  generatedPost: string
}

export function AIResults({ generatedPost }: AIResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  if (!generatedPost) return null

  const posts = generatedPost
    .split('###')
    .filter(Boolean)
    .map((section) => {
      const lines = section.trim().split('\n')
      const title = lines.shift()?.trim() || '投稿案'
      const body = lines.join('\n').trim()

      return {
        title,
        body,
      }
    })

  const handleCopy = async (body: string, index: number) => {
    try {
      await navigator.clipboard.writeText(body)
      setCopiedIndex(index)

      window.setTimeout(() => {
        setCopiedIndex(null)
      }, 1800)
    } catch {
      alert('コピーに失敗しました')
    }
  }

  const getPostIcon = (index: number) => {
    if (index === 0) return '🟦'
    if (index === 1) return '🟪'
    if (index === 2) return '🟧'
    return '⬜'
  }

  const getScore = (index: number) => {
    if (index === 0) return '★★★★★'
    if (index === 1) return '★★★★☆'
    return '★★★★☆'
  }

  return (
    <section className="ai-results">
      <div className="ai-results-head">
        <div>
          <div className="ai-results-badges">
            <span className="product-badge">
              <span className="threads-mark">@</span>
              Threads
            </span>

            <span className="product-badge ai-badge">
              ⚡ AI GENERATED
            </span>
          </div>

          <span className="eyebrow">AI POST GENERATOR</span>

          <h2>AIが作成したThreads投稿</h2>

          <p>
            競合分析から生成した、そのまま使える投稿テンプレートです。
          </p>
        </div>

        <div className="ai-results-count">
          <strong>{posts.length}</strong>
          <span>投稿案</span>
        </div>
      </div>

      <div className="ai-post-grid">
        {posts.map((post, index) => (
          <article
            className="ai-post-card"
            key={`${post.title}-${index}`}
          >
            <div className="ai-post-card-head">
              <div>
                <span className="ai-post-number">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <h3>
                  {getPostIcon(index)} {post.title}
                </h3>
              </div>

              <div className="ai-post-meta">
                <span>{post.body.length}文字</span>
                <span className="ai-post-score">
                  {getScore(index)}
                </span>
              </div>
            </div>

            <div className="ai-post-body post-idea">
              {post.body}
            </div>

            <button
              type="button"
              className={`btn secondary ai-copy-button ${
                copiedIndex === index ? 'is-copied' : ''
              }`}
              onClick={() => handleCopy(post.body, index)}
            >
              {copiedIndex === index
                ? '✓ コピーしました'
                : '📋 この投稿をコピー'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}