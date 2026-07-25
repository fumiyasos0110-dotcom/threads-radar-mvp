import { Dashboard } from '@/components/Dashboard'

const features = [
  {
    icon: '📡',
    title: '競合投稿を収集',
    text: '登録した競合アカウントの投稿データをまとめて収集します。',
  },
  {
    icon: '🧠',
    title: 'AIで伸びた理由を分析',
    text: '反応率や投稿構成を比較し、再利用できる勝ちパターンを抽出します。',
  },
  {
    icon: '✍️',
    title: '投稿案を自動生成',
    text: '分析結果をもとに、共感型・ノウハウ型・ストーリー型を生成します。',
  },
]

const steps = [
  {
    number: '01',
    title: '競合を登録',
    text: '調べたいThreadsアカウントのユーザー名を入力します。',
  },
  {
    number: '02',
    title: '投稿を収集・分析',
    text: '投稿データから、反応率や伸びた構造をAIが分析します。',
  },
  {
    number: '03',
    title: '投稿案を生成',
    text: '分析した勝ちパターンを、自分向けの投稿案に変換します。',
  },
]

const targets = [
  'Threadsを伸ばしたい個人・事業者',
  '競合調査に時間をかけたくない人',
  '毎日の投稿ネタに困っている人',
  '感覚ではなくデータを使いたい人',
]

const faqs = [
  {
    question: 'Threads Radarでは何ができますか？',
    answer:
      '競合アカウントの登録、投稿収集、AI競合分析、ランキング表示、Threads投稿案の生成ができます。',
  },
  {
    question: '専門的な知識は必要ですか？',
    answer:
      '必要ありません。競合のユーザー名を登録し、画面のボタンを順番に押すだけで利用できます。',
  },
  {
    question: '生成した投稿はそのまま使えますか？',
    answer:
      'コピーして利用できます。ご自身の経験や言葉を加えると、さらに自然な投稿になります。',
  },
]

export default function Home() {
  return (
    <main className="landing-page">
      <nav className="lp-nav">
        <a href="#top" className="lp-logo">
          <span className="lp-logo-mark">◉</span>
          THREADS RADAR
        </a>

        <div className="lp-nav-links">
          <a href="#features">機能</a>
          <a href="#how-it-works">使い方</a>
          <a href="#faq">FAQ</a>
          <a href="#dashboard" className="lp-nav-cta">
            試してみる
          </a>
        </div>
      </nav>

      <section className="lp-hero" id="top">
        <div className="lp-hero-glow" />

        <div className="lp-hero-content">
          <div className="lp-badges">
            <span>◉ Threads分析</span>
            <span>⚡ AI搭載</span>
          </div>

          <h1>
            競合の伸びた理由を、
            <br />
            あなたの投稿に。
          </h1>

          <p>
            Threadsの競合調査からAI分析、投稿作成まで。
            <br />
            アカウントを登録するだけで、次に投稿すべき内容が見えてきます。
          </p>

          <div className="lp-hero-actions">
            <a href="#dashboard" className="lp-primary-button">
              無料で分析を始める
            </a>

            <a href="#features" className="lp-secondary-button">
              機能を見る
            </a>
          </div>

          <div className="lp-proof">
            <div>
              <strong>7日間</strong>
              <span>投稿データを分析</span>
            </div>

            <div>
              <strong>3種類</strong>
              <span>AI投稿案を生成</span>
            </div>

            <div>
              <strong>約10秒</strong>
              <span>分析結果を表示</span>
            </div>
          </div>
        </div>

        <div className="lp-preview">
          <div className="lp-preview-top">
            <span>AI ANALYSIS</span>
            <span className="lp-live-dot">● LIVE</span>
          </div>

          <div className="lp-preview-score">
            <div>
              <small>Radar Score</small>
              <strong>83</strong>
            </div>

            <span>↗ 急上昇</span>
          </div>

          <div className="lp-preview-list">
            <div>
              <span>01</span>
              <p>悩みへの共感から始めている</p>
            </div>

            <div>
              <span>02</span>
              <p>体験談と数字で信頼性を高めている</p>
            </div>

            <div>
              <span>03</span>
              <p>最後の問いかけで反応を促している</p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section" id="features">
        <div className="lp-section-heading">
          <span>FEATURES</span>
          <h2>競合分析を、もっとシンプルに。</h2>
          <p>
            調査・分析・投稿作成を、ひとつのダッシュボードにまとめました。
          </p>
        </div>

        <div className="lp-feature-grid">
          {features.map((feature) => (
            <article className="lp-feature-card" key={feature.title}>
              <span className="lp-feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section" id="how-it-works">
        <div className="lp-section-heading">
          <span>HOW IT WORKS</span>
          <h2>使い方は、たった3ステップ。</h2>
        </div>

        <div className="lp-step-grid">
          {steps.map((step) => (
            <article className="lp-step-card" key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section lp-target-section">
        <div className="lp-target-copy">
          <span className="lp-eyebrow">FOR YOU</span>
          <h2>
            投稿の正解を、
            <br />
            毎回ゼロから考えない。
          </h2>

          <p>
            競合の成功パターンを参考にしながら、自分らしい投稿へ変換できます。
          </p>
        </div>

        <div className="lp-target-list">
          {targets.map((target) => (
            <div key={target}>
              <span>✓</span>
              {target}
            </div>
          ))}
        </div>
      </section>

      <section className="lp-dashboard-section" id="dashboard">
        <div className="lp-section-heading">
          <span>LIVE PRODUCT</span>
          <h2>実際にThreads Radarを試す。</h2>
          <p>
            競合アカウントを登録して、分析から投稿生成まで体験できます。
          </p>
        </div>

        <Dashboard />
      </section>

      <section className="lp-section" id="faq">
        <div className="lp-section-heading">
          <span>FAQ</span>
          <h2>よくある質問</h2>
        </div>

        <div className="lp-faq-list">
          {faqs.map((faq) => (
            <details className="lp-faq-item" key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

            <section className="lp-final-cta">
        <div className="lp-final-inner">
          <div className="lp-final-badge">⚡ START TODAY</div>

          <h2>
            競合の伸びた理由を、
            <br />
            次の投稿に変えよう。
          </h2>

          <p>
            アカウントを登録するだけで、AIが投稿を分析し、
            次に投稿すべき内容まで提案します。
          </p>

          <div className="lp-final-buttons">
            <a href="#dashboard" className="lp-primary-button">
              無料で分析を始める
            </a>

            <a href="#features" className="lp-secondary-button">
              機能を見る
            </a>
          </div>

          <div className="lp-final-proof">
            <span>✓ 登録無料</span>
            <span>✓ AI分析</span>
            <span>✓ 投稿生成</span>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <span>THREADS RADAR ◉</span>
        <p>AI-powered competitive analysis for Threads.</p>
      </footer>
    </main>
  )
}