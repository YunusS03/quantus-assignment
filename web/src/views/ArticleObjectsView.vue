<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getArticleObjects, getArticles, type Article, type ArticleObjects, type Unit } from '@/api'
import { formatMoney } from '@/format'

const route = useRoute()
const articleId = Number(route.params.id)
const data = ref<ArticleObjects>()
const articles = ref<Article[]>([])
const error = ref('')

onMounted(async () => {
  try {
    const [objectsData, articleList] = await Promise.all([
      getArticleObjects(route.params.id as string, true),
      getArticles(),
    ])
    data.value = objectsData
    articles.value = articleList
  } catch (e) {
    error.value = (e as Error).message
  }
})

// Articles are like folders: show the sub-articles one level down.
const children = computed(() => articles.value.filter((a) => a.parentId === articleId))

// Walk up the parent chain for the breadcrumb, e.g. 20. / 20.12. / 20.12.10.
const ancestors = computed(() => {
  const chain: Article[] = []
  let parentId = articles.value.find((a) => a.id === articleId)?.parentId ?? null
  while (parentId !== null) {
    const parent = articles.value.find((a) => a.id === parentId)
    if (!parent) break
    chain.unshift(parent)
    parentId = parent.parentId
  }
  return chain
})

const unitLabels: Record<Unit, string> = { M: 'm', M2: 'm²', M3: 'm³', KG: 'kg', PIECE: 'pc' }
const quantityFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 3 })

function codeOf(articleId: number) {
  return articles.value.find((a) => a.id === articleId)?.code
}

function money(value: number) {
  return formatMoney(value, data.value!.currency)
}
</script>

<template>
  <nav class="mb-2 text-sm text-muted" aria-label="Breadcrumb">
    <RouterLink to="/">Articles</RouterLink> /
    <template v-for="ancestor in ancestors" :key="ancestor.id">
      <RouterLink :to="`/articles/${ancestor.id}`">{{ ancestor.code }}</RouterLink> /
    </template>
    {{ data?.article.code ?? '…' }}
  </nav>

  <p
    v-if="error"
    class="my-4 rounded-lg border border-error-line bg-error-soft px-4 py-3 text-error"
    role="alert"
  >
    {{ error }}
  </p>
  <p v-else-if="!data" class="my-4 text-muted">Loading objects…</p>
  <template v-else>
    <h1 class="mb-5 text-2xl font-bold tracking-tight">
      <span class="text-muted tabular-nums">{{ data.article.code }}</span> {{ data.article.title }}
    </h1>

    <section v-if="children.length > 0" class="mb-8">
      <h2 class="mb-2 text-lg font-semibold">Sub-articles</h2>
      <ul class="divide-y divide-line rounded-xl border border-line bg-white">
        <li v-for="child in children" :key="child.id" class="flex gap-4 px-3 py-2.5">
          <span class="w-28 shrink-0 text-muted tabular-nums">{{ child.code }}</span>
          <RouterLink :to="`/articles/${child.id}`">{{ child.title }}</RouterLink>
        </li>
      </ul>
    </section>

    <h2 class="mb-2 text-lg font-semibold">
      {{ children.length > 0 ? 'All objects, including sub-articles' : 'Objects' }}
    </h2>
    <div
      v-if="data.objects.length === 0"
      class="rounded-xl border border-dashed border-line bg-white px-6 py-8 text-center text-muted"
    >
      <p class="font-semibold text-ink">
        No objects in this article{{ children.length > 0 ? ' or its sub-articles' : '' }}.
      </p>
    </div>
    <div v-else class="overflow-x-auto rounded-xl border border-line bg-white">
      <!-- min-w: on small screens the table scrolls sideways instead of squeezing the names. -->
      <table class="w-full min-w-[44rem] text-[0.9375rem]">
        <thead class="border-b border-line bg-surface-alt text-[0.8125rem] text-muted">
          <tr>
            <th v-if="children.length > 0" scope="col" class="px-3 py-2.5 text-left font-semibold">Article</th>
            <th scope="col" class="px-3 py-2.5 text-left font-semibold">Object</th>
            <th scope="col" class="px-3 py-2.5 text-left font-semibold">Type</th>
            <th scope="col" class="px-3 py-2.5 text-right font-semibold">Quantity</th>
            <th scope="col" class="px-3 py-2.5 text-left font-semibold">Unit</th>
            <th scope="col" class="px-3 py-2.5 text-right font-semibold">Unit price</th>
            <th scope="col" class="px-3 py-2.5 text-right font-semibold">Line total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="object in data.objects" :key="object.id" class="hover:bg-surface-alt">
            <td v-if="children.length > 0" class="px-3 py-2.5 whitespace-nowrap tabular-nums">
              <RouterLink :to="`/articles/${object.articleId}`">{{ codeOf(object.articleId) }}</RouterLink>
            </td>
            <td class="px-3 py-2.5">{{ object.name }}</td>
            <td class="px-3 py-2.5 text-muted">{{ object.type }}</td>
            <td class="px-3 py-2.5 text-right tabular-nums">{{ quantityFormat.format(object.quantity) }}</td>
            <td class="px-3 py-2.5">{{ unitLabels[object.unit] }}</td>
            <td class="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">{{ money(object.unitPrice) }}</td>
            <td class="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">{{ money(object.lineTotal) }}</td>
          </tr>
        </tbody>
        <tfoot class="border-t-2 border-ink font-bold">
          <tr>
            <th scope="row" :colspan="children.length > 0 ? 6 : 5" class="px-3 py-2.5 text-left">
              {{ children.length > 0 ? 'Total including sub-articles' : 'Total of objects in this article' }}
            </th>
            <td class="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">{{ money(data.total) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <p v-if="data.objects.length > 0" class="mt-1.5 text-[0.8125rem] text-muted">
      <template v-if="children.length > 0">Includes the objects of every article below this one. </template>
      The total is calculated from unrounded line totals, so it can differ by a cent from the sum of the
      rows shown.
    </p>
  </template>
</template>
