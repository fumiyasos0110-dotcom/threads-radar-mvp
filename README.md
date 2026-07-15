# Threads Radar MVP

競合Threadsアカウントの公開投稿を収集し、反応推移と文章構造を分析するMVPです。

## 今回動く機能
- 競合アカウント登録
- JSONファイルへのローカル保存（Mock Mode）
- 模擬投稿の収集と重複防止
- Radar Score・7日投稿数・平均反応の再計算
- OpenAI APIあり：AI分析
- OpenAI APIなし：ローカル分析
- 伸びた要因、再利用可能な型、投稿案の画面表示
- Supabase用テーブル、RLS、集計ビュー

## すぐ試す
```bash
cp .env.example .env.local
npm install
npm run dev
```
`http://localhost:3000` を開き、競合登録 → 「今すぐ収集」→ 各行の「分析」の順に押します。

Mock Modeでは `.data/mock-db.json` にデータを保存します。

## OpenAIを接続
`.env.local` に以下を設定します。
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```
未設定でも、ルールベースのローカル分析が動きます。

## Supabaseを接続
1. Supabaseで新規プロジェクトを作る
2. SQL Editorで `supabase/migrations/001_init.sql` を実行
3. `.env.local` にURLとSecret Keyを設定
4. `MOCK_MODE=false` に変更

Secret Keyはサーバー専用です。ブラウザ側へ公開しないでください。

## Threads APIの本番収集
MetaアプリでThreads APIを有効化し、公開プロフィール探索に必要な権限・審査・アクセストークンを準備します。

本番取得はMetaアプリごとの権限状態で利用可能なエンドポイントが変わるため、現版では安全に `501` を返し、Mock収集を維持しています。トークンが揃った段階で `app/api/collect/route.ts` にプロフィール探索・公開投稿取得・DB upsertを接続します。

## 本番前に追加するもの
- Supabase Authによるログイン
- owner_idを認証ユーザーへ紐付け
- Vercel Cronの署名確認
- APIレート制限
- 競合削除・停止
- 投稿詳細画面と推移グラフ
- LINEまたはメールの日次通知
