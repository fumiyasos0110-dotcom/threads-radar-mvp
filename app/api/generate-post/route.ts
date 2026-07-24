import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  const { analysis } = await req.json()

  if (!analysis) {
    return NextResponse.json(
      { error: 'analysis is required' },
      { status: 400 }
    )
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      result: {
        title: 'サンプルタイトル',
        body: 'ここにThreads投稿が生成されます。',
      },
    })
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    input: [
  {
    role: 'system',
    content: `
あなたはThreads投稿作成の専門AIです。

必ず次のルールを守ってください。

・完成した投稿本文だけを返す
・解説、分析、見出し、Markdown、JSONは出力しない
・ユーザー本人の実体験を捏造しない
・存在しない調査、統計、割合、実績を作らない
・分析データにない固有名詞や数字を勝手に追加しない
・断定できない内容は「〜かもしれません」「〜という方法もあります」と表現する
・競合投稿の文章をコピーしない
・構成や読者心理だけを参考にして、完全なオリジナル投稿にする
・日本語で150〜300文字程度
・最初の1〜2行で興味を引く
・読みやすく改行する
・最後は自然な問いかけ、または行動提案で終える
・一人称の体験談を絶対に作らない
・具体的な数値、成果、期間は分析データに明記されている場合のみ使う
`.trim(),
  },
  {
    role: 'user',
    content: `
以下の競合分析を参考に、以下の3パターンを作成してください。

① 共感型
② ノウハウ型
③ ストーリー型

それぞれ200〜300文字程度。

区切りは必ず

### 共感型

### ノウハウ型

### ストーリー型

を使用してください。

説明文は不要です。
改行はThreadsで読みやすいように適度に入れてください。

各投稿の最後には自然な問いかけ、または行動を促す一文を入れてください。

分析に存在しない数字・実績・体験談は絶対に作らないでください。


投稿テーマは、分析内の投稿案から最も作りやすいものを1つ選んでください。

競合分析:
${JSON.stringify(analysis)}
`.trim(),
  },
],
  })

  return NextResponse.json({
    result: response.output_text,
  })
}