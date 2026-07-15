import type { RadarPost } from './types'

export function fallbackAnalysis(posts: RadarPost[]) {
  const top = [...posts].sort((a, b) => b.engagement - a.engagement).slice(0, 5)
  const hasQuestions = top.some((post) => /[?？]/.test(post.text))
  const hasNumbers = top.some((post) => /\d/.test(post.text))
  return {
    growth_factors: [
      hasNumbers ? '数字を入れて内容の具体性と信頼感を高めている' : '悩みを具体的な場面に落とし込み、共感を先に作っている',
      hasQuestions ? '問いかけで返信しやすい余白を作っている' : '結論までの流れが短く、読み切りやすい',
      '体験談から学びへ変換し、読者が自分ごと化しやすい',
    ],
    reusable_patterns: [
      '意外な結論 → 実体験 → 数字や具体例 → 一言の学び',
      '読者のあるある → 失敗談 → 改善策3つ → 質問',
      '強い一文 → 背景説明 → 小さな成功 → 行動提案',
    ],
    post_ideas: [
      '在宅ワークを始めて最初に捨てた思い込み3つ',
      'コールセンター経験がSNS運用で意外と役立った瞬間',
      '副業を増やす前に、先に決めた方がいい1日の上限',
      '未経験案件へ応募するとき、実績ゼロでも書けること',
      '働き方を変えて気づいた「収入以外の余白」の価値',
    ],
    analyzed_at: new Date().toISOString(),
  }
}
