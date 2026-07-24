import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { fallbackAnalysis } from '@/lib/radar'
import { getMockPosts, saveMockAnalysis } from '@/lib/mock-store'

const inputSchema = z.object({ competitorId: z.string().min(1), posts: z.array(z.any()).optional() })

export async function POST(req: Request) {
  const parsed = inputSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'competitorId is required' }, { status: 400 })
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
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const response = await client.responses.create({
  model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  max_output_tokens: 700,
  input: [
        { role: 'system', content: 'あなたはSNS競合分析者。投稿のコピーは避け、構造・テーマ・読者心理を抽象化して日本語で分析する。' },
        {
  role: 'user',
  content: `次のThreads投稿群を分析してください。

${JSON.stringify(
  posts.slice(0, 10).map((post) => ({
    text: String(post.text ?? post.content ?? '').slice(0, 500),
    likes: post.likes ?? 0,
    replies: post.replies ?? 0,
    reposts: post.reposts ?? 0,
  }))
)}`,
},
      ],
      text: { format: { type: 'json_schema', name: 'competitor_analysis', strict: true, schema: {
        type: 'object', additionalProperties: false,
        properties: {
          growth_factors: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
          reusable_patterns: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
          post_ideas: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
        }, required: ['growth_factors', 'reusable_patterns', 'post_ideas'],
      } } },
    })
    result = { ...JSON.parse(response.output_text), analyzed_at: new Date().toISOString() }
  }
  await saveMockAnalysis(parsed.data.competitorId, result)
  return NextResponse.json({ result, ai: Boolean(process.env.OPENAI_API_KEY) })
}
