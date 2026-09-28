// Vite bakes this in at build time, so the default is what the Docker image uses.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type Unit = 'M' | 'M2' | 'M3' | 'KG' | 'PIECE'

export interface Article {
  id: number
  code: string
  title: string
  description: string
  parentId: number | null
}

export interface NewArticle {
  code: string
  title: string
  description: string
  parentId: number | null
}

export interface ArticleObject {
  id: string
  name: string
  type: string
  unit: Unit
  unitPrice: number
  quantity: number
  lineTotal: number
  articleId: number
}

export interface ArticleObjects {
  article: { id: number; code: string; title: string }
  currency: string
  objects: ArticleObject[]
  total: number
}

export interface Summary {
  currency: string
  articles: { id: number; code: string; title: string; subtotal: number }[]
  grandTotal: number
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init).catch(() => {
    throw new Error(`Cannot reach the API at ${API_URL}. Is docker compose running?`)
  })
  const body = await response.json()
  if (!response.ok) {
    // Nest sends validation errors as a list and other errors as one string.
    throw new Error(Array.isArray(body.message) ? body.message.join('. ') : body.message)
  }
  return body
}

export function getArticles() {
  return request<Article[]>('/articles')
}

export function getSummary() {
  return request<Summary>('/summary')
}

export function getArticleObjects(id: string, includeSubArticles: boolean) {
  return request<ArticleObjects>(`/articles/${id}/objects?includeSubArticles=${includeSubArticles}`)
}

export function createArticle(article: NewArticle) {
  return request<Article>('/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  })
}
