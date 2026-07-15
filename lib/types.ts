export type Competitor = {
  id: string
  username: string
  displayName?: string | null
  followers: number
  posts7d: number
  avgEngagement: number
  score: number
  createdAt: string
}

export type RadarPost = {
  id: string
  competitorId: string
  platformPostId: string
  text: string
  publishedAt: string
  likes: number
  replies: number
  reposts: number
  quotes: number
  engagement: number
}

export type AnalysisResult = {
  growth_factors: string[]
  reusable_patterns: string[]
  post_ideas: string[]
  analyzed_at: string
}
