'use client'
import { useState } from 'react'

export function CompetitorForm({ onCreated }: { onCreated?: () => void | Promise<void> }) {
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setStatus('登録中…')
    const res = await fetch('/api/competitors', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ username }) })
    const json = await res.json()
    setStatus(res.ok ? `@${json.competitor.username} を登録しました` : json.error ?? '登録に失敗しました')
    if (res.ok) { setUsername(''); await onCreated?.() }
  }
  return <form className="form" onSubmit={submit}>
    <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="競合のThreadsユーザー名" aria-label="競合ユーザー名" />
    <button className="btn" type="submit">競合を登録</button>
    {status && <span className="muted form-status">{status}</span>}
  </form>
}
