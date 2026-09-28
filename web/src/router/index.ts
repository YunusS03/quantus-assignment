import { createRouter, createWebHistory } from 'vue-router'
import ArticleObjectsView from '../views/ArticleObjectsView.vue'
import ArticlesView from '../views/ArticlesView.vue'
import NewArticleView from '../views/NewArticleView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: ArticlesView },
    { path: '/articles/new', component: NewArticleView },
    { path: '/articles/:id', component: ArticleObjectsView },
  ],
})

export default router
