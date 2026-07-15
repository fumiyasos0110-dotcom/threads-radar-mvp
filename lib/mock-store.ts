import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { AnalysisResult, Competitor, RadarPost } from './types'

const dataDir = path.join(process.cwd(), '.data')
const dataFile = path.join(dataDir, 'mock-db.json')

type MockDb = {
  competitors: Competitor[]
  posts: RadarPost[]
  analyses: Record<string, AnalysisResult>
}

const seeds: Competitor[] = [
  { id: '1', username: 'career_story', followers: 12800, posts7d: 24, avgEngagement: 186, score: 92, createdAt: new Date().toISOString() },
  { id: '2', username: 'remote_worker_jp', followers: 7400, posts7d: 18, avgEngagement: 121, score: 84, createdAt: new Date().toISOString() },
  { id: '3', username: 'callcenter_note', followers: 3900, posts7d: 31, avgEngagement: 77, score: 76, createdAt: new Date().toISOString() },
]

async function ensureDb(): Promise<MockDb> {
  await fs.mkdir(dataDir, { recursive: true })
  try {
    return JSON.parse(await fs.readFile(dataFile, 'utf8')) as MockDb
  } catch {
    const initial: MockDb = { competitors: seeds, posts: [], analyses: {} }
    await fs.writeFile(dataFile, JSON.stringify(initial, null, 2))
    return initial
  }
}

async function save(db: MockDb) {
  await fs.writeFile(dataFile, JSON.stringify(db, null, 2))
}

export async function listMockCompetitors() {
  const db = await ensureDb()
  return db.competitors.sort((a, b) => b.score - a.score)
}

export async function addMockCompetitor(username: string) {
  const db = await ensureDb()
  const found = db.competitors.find((item) => item.username.toLowerCase() === username.toLowerCase())
  if (found) return found
  const competitor: Competitor = {
    id: randomUUID(), username, displayName: username, followers: 0, posts7d: 0,
    avgEngagement: 0, score: 0, createdAt: new Date().toISOString(),
  }
  db.competitors.push(competitor)
  await save(db)
  return competitor
}

function seededNumber(seed: string, min: number, max: number) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return min + (hash % (max - min + 1))
}

export async function collectMockPosts() {
  const db = await ensureDb()
  let collected = 0
  for (const competitor of db.competitors) {
    const now = new Date()
    const dailyCount = seededNumber(`${competitor.username}-${now.toISOString().slice(0, 10)}`, 1, 3)
    for (let i = 0; i < dailyCount; i++) {
      const platformPostId = `mock-${competitor.username}-${now.toISOString().slice(0, 10)}-${i}`
      if (db.posts.some((post) => post.platformPostId === platformPostId)) continue
      const likes = seededNumber(`${platformPostId}-likes`, 8, 420)
      const replies = seededNumber(`${platformPostId}-replies`, 0, 65)
      const reposts = seededNumber(`${platformPostId}-reposts`, 0, 40)
      const quotes = seededNumber(`${platformPostId}-quotes`, 0, 18)
      db.posts.push({
        id: randomUUID(), competitorId: competitor.id, platformPostId,
        text: `${competitor.username} の模擬投稿 ${i + 1}。読者の悩みを具体化し、体験談と数字で結論へ運ぶ投稿です。`,
        publishedAt: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString(),
        likes, replies, reposts, quotes, engagement: likes + replies + reposts + quotes,
      })
      collected++
    }
    const recent = db.posts.filter((post) => post.competitorId === competitor.id && Date.now() - new Date(post.publishedAt).getTime() < 7 * 86400000)
    competitor.posts7d = recent.length
    competitor.avgEngagement = recent.length ? Math.round(recent.reduce((sum, post) => sum + post.engagement, 0) / recent.length) : 0
    if (!competitor.followers) competitor.followers = seededNumber(competitor.username, 500, 18000)
    const rate = competitor.followers ? competitor.avgEngagement / competitor.followers : 0
    competitor.score = Math.min(100, Math.round(rate * 850 + Math.min(competitor.posts7d * 2.2, 25) + Math.min(competitor.avgEngagement / 8, 25)))
  }
  await save(db)
  return { collected, competitors: db.competitors.length }
}

export async function getMockPosts(competitorId?: string) {
  const db = await ensureDb()
  return db.posts
    .filter((post) => !competitorId || post.competitorId === competitorId)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
}

export async function saveMockAnalysis(competitorId: string, result: AnalysisResult) {
  const db = await ensureDb()
  db.analyses[competitorId] = result
  await save(db)
  return result
}

export async function getMockAnalysis(competitorId: string) {
  const db = await ensureDb()
  return db.analyses[competitorId] ?? null
}
