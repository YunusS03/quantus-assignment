<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getArticles, getSummary, type Article, type Summary } from '@/api'
import { formatMoney } from '@/format'

const articles = ref<Article[]>([])
const summary = ref<Summary>()
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const [articleList, summaryData] = await Promise.all([getArticles(), getSummary()])
    articles.value = articleList
    summary.value = summaryData
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
})

// "20.11.10." has three groups, so it sits two levels below the top.
function depth(code: string) {
  return code.split('.').length - 2
}

// /summary only lists top-level articles, so child rows get an empty cell.
function subtotalOf(articleId: number) {
  const subtotal = summary.value?.articles.find((a) => a.id === articleId)?.subtotal
  return subtotal === undefined ? '' : formatMoney(subtotal, summary.value!.currency)
}
</script>

<template>
  <div class="mb-5 flex items-center justify-between gap-4">
    <h1 class="text-2xl font-bold tracking-tight">Articles</h1>
    <RouterLink
      to="/articles/new"
      class="rounded-lg bg-accent px-4 py-2 font-semibold whitespace-nowrap text-white no-underline hover:bg-accent-hover hover:text-white"
    >
      New article
    </RouterLink>
  </div>

  <p v-if="loading" class="my-4 text-muted">Loading articles…</p>
  <p
    v-else-if="error"
    class="my-4 rounded-lg border border-error-line bg-error-soft px-4 py-3 text-error"
    role="alert"
  >
    {{ error }}
  </p>
  <div
    v-else-if="articles.length === 0"
    class="rounded-xl border border-dashed border-line bg-white px-6 py-8 text-center text-muted"
  >
    <p class="font-semibold text-ink">No articles yet.</p>
    <p class="mt-1">
      Create the first one, or load the example data with
      <code class="rounded border border-line bg-surface-alt px-1.5 text-sm">docker compose exec api npm run seed</code>.
    </p>
  </div>
  <div v-else class="overflow-x-auto rounded-xl border border-line bg-white">
    <table class="w-full text-[0.9375rem]">
      <thead class="border-b border-line bg-surface-alt text-left text-[0.8125rem] text-muted">
        <tr>
          <th scope="col" class="px-3 py-2.5 font-semibold sm:w-32">Code</th>
          <th scope="col" class="px-3 py-2.5 font-semibold">Title</th>
          <th scope="col" class="px-3 py-2.5 text-right font-semibold">Subtotal</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-line">
        <tr v-for="article in articles" :key="article.id" class="align-baseline hover:bg-surface-alt">
          <td class="px-3 py-2.5 whitespace-nowrap text-muted tabular-nums">{{ article.code }}</td>
          <!-- An inline style, because Tailwind can't build classes from values computed at runtime. -->
          <td class="py-2.5 pr-3" :style="{ paddingLeft: `${0.75 + depth(article.code) * 1.5}rem` }">
            <RouterLink :to="`/articles/${article.id}`">{{ article.title }}</RouterLink>
          </td>
          <td class="px-3 py-2.5 text-right font-semibold whitespace-nowrap tabular-nums">
            {{ subtotalOf(article.id) }}
          </td>
        </tr>
      </tbody>
      <tfoot class="border-t-2 border-ink font-bold">
        <tr>
          <th scope="row" colspan="2" class="px-3 py-2.5 text-left">Grand total</th>
          <td class="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">
            {{ summary && formatMoney(summary.grandTotal, summary.currency) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
  <p v-if="articles.length > 0 && !loading && !error" class="mt-1.5 text-[0.8125rem] text-muted">
    A subtotal includes all objects of the top-level article and every article below it.
  </p>
</template>
