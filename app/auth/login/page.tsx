'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim()) {
      setMessage('メールアドレスを入力してください')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(`送信に失敗しました：${error.message}`)
    } else {
      setMessage('ログインリンクをメールに送りました！')
      setEmail('')
    }

    setLoading(false)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: '#08090c',
        color: '#ffffff',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        <p style={{ color: '#9aa8bd', marginBottom: '8px' }}>
          Threads Radar
        </p>

        <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>
          ログイン
        </h1>

        <p style={{ color: '#9aa8bd', marginBottom: '24px' }}>
          メールに届くリンクからログインできます。
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@email.com"
            autoComplete="email"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: '#111318',
              color: '#ffffff',
              fontSize: '16px',
              marginBottom: '14px',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: 0,
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '送信中...' : 'ログインリンクを送る'}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: '18px', color: '#b8c3d6' }}>
            {message}
          </p>
        )}
      </section>
    </main>
  )
}