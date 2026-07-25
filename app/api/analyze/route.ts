import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { fallbackAnalysis } from '@/lib/radar'
import { getMockPosts, saveMockAnalysis } from '@/lib/mock-store'

const inputSchema = z.object({
  competitorId: z.string().min(1),
  posts: z.array(z.any()).optional(),
})

export async function POST(req: Request) {
  const parsed = inputSchema.safeParse(await req.json())

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'competitorId is required' },
      { status: 400 }
    )
  }

  let posts = parsed.data.posts?.length
    ? parsed.data.posts
    : await getMockPosts(parsed.data.competitorId)

  if (!posts.length) {
    posts = [
      {
        text: '働き方や日常の悩みを、読者が共感しやすい短い文章で紹介する投稿です。',
        likes: 24,
        replies: 5,
        reposts: 2,
      },
      {
        text: '困りごとを最初に提示し、すぐ試せる方法を分かりやすく伝える投稿です。',
        likes: 38,
        replies: 7,
        reposts: 4,
      },
      {
        text: '読者への問いかけから始め、具体例を交えながら行動を促す投稿です。',
        likes: 31,
        replies: 6,
        reposts: 3,
      },
    ]
  }

  let result

  if (!process.env.OPENAI_API_KEY) {
    result = fallbackAnalysis(posts)
  } else {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      max_output_tokens: 1200,
      input: [
        {
          role: 'system',
          content: `
あなたはThreadsに特化したSNS競合分析者です。

投稿文をコピーせず、構成・テーマ・読者心理・反応傾向を抽象化してください。

必ず次のルールを守ってください。

・入力データにない実績や数字を作らない
・投稿者の体験を勝手に推測しない
・競合投稿をそのまま転載しない
・初心者にも理解できる日本語で書く
・曖昧な表現を避け、具体的な改善案を出す
・反応数だけでなく、文章構成や読者心理も分析する
・各項目の内容を重複させない
・生成する投稿案は完全なオリジナルにする
`.trim(),
        },
        {
          role: 'user',
          content: `
次のThreads投稿群を分析してください。

以下を明らかにしてください。

1. 投稿が伸びる要因
2. 再利用できる文章構成
3. 真似しない方がよい要素
4. 共感・ノウハウ・ストーリーの投稿傾向
5. 競合分析の総合評価
6. バズ・保存・フォロー・コメント・収益導線を狙った投稿案

投稿データ:

${JSON.stringify(
  posts.slice(0, 10).map((post) => ({
    text: String(post.text ?? post.content ?? '').slice(0, 500),
    likes: post.likes ?? 0,
    replies: post.replies ?? 0,
    reposts: post.reposts ?? 0,
  }))
)}
`.trim(),
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'competitor_analysis',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              summary: {
                type: 'string',
              },
              score: {
                type: 'integer',
                minimum: 0,
                maximum: 100,
              },
              growth_factors: {
                type: 'array',
                items: { type: 'string' },
                minItems: 3,
                maxItems: 3,
              },
              reusable_patterns: {
                type: 'array',
                items: { type: 'string' },
                minItems: 3,
                maxItems: 3,
              },
              avoid_patterns: {
                type: 'array',
                items: { type: 'string' },
                minItems: 3,
                maxItems: 3,
              },
              content_mix: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  empathy: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 100,
                  },
                  knowhow: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 100,
                  },
                  story: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 100,
                  },
                },
                required: ['empathy', 'knowhow', 'story'],
              },
              post_ideas: {
                type: 'array',
                items: { type: 'string' },
                minItems: 5,
                maxItems: 5,
              },
            },
            required: [
              'summary',
              'score',
              'growth_factors',
              'reusable_patterns',
              'avoid_patterns',
              'content_mix',
              'post_ideas',
            ],
          },
        },
      },
    })

    try {
      result = {
        ...JSON.parse(response.output_text),
        analyzed_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error('AI JSON parse error:', error)
      console.error('AI response:', response.output_text)

      result = fallbackAnalysis(posts)
    }
  }

  await saveMockAnalysis(parsed.data.competitorId, result)

  return NextResponse.json({
    result,
    ai: Boolean(process.env.OPENAI_API_KEY),
  })
}