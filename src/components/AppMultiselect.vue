<script setup lang="ts">
import { CountType } from '../../models/enums/countType';
import { getPropertyByPath } from '../helpers/utility';
import { isObject } from '@vue/shared'
import { useAxios } from '../axios-config';
import { onMounted, ref, watch, defineProps } from 'vue'
import type { MultiSelectFilterEvent } from 'primevue/multiselect'
import type { VirtualScrollerLazyEvent } from 'primevue/virtualscroller'

export interface IAppMultiselectComponent {
  reload(): void
}

interface IAppMultiselectProps {
  optionLabel: string
  optionValue?: string
  placeholder?: string
  findEndpoint?: string
  cssClass?: string
  filter?: any
  options?: any[]
  maxItemSelected?: number
  modelValue: any
  emptyMessage?: string
  freeSearchParameterName?: string
  lazy?: boolean
  filterFields?: Array<string>
  name?: string
  selectedOptions?: any[],
  minCharQuery?: number,
  chips?: boolean
}
const axiosInstance = useAxios()

const props = withDefaults(defineProps<IAppMultiselectProps>(), {
  emptyMessage: 'Nessun dato trovato',
  lazy: false,
  freeSearchParameterName: 'ricerca_libera',
  findEndpoint: '',
  minCharQuery : 0
})

const emit = defineEmits(['update:modelValue'])

const loading = ref<boolean>(false)
const itemsSelected = ref<any[]>(props.selectedOptions || [])
const options = ref<any[]>(props.options || [])
let currentQuery = ''
let totalRecordCount = 0
let lazy = ref<boolean>(props.lazy)

onMounted(async () => {
  if (!props.lazy) options.value = await loadData()
})

watch(itemsSelected, (newValue: any, o: any) => {
  const arrayV: any[] = []
  if (!newValue) emit('update:modelValue', newValue)
  else {
    newValue.forEach((e: any) => {
      let valueSelected = undefined
      if (props.optionValue) valueSelected = isObject(e) ? e[props.optionValue] : e
      else valueSelected = isObject(e) ? { ...e } : e
      arrayV.push(valueSelected)
    })

    emit('update:modelValue', arrayV)
  }
})

watch(() => props.selectedOptions, (newValue, oldValue) => {
  itemsSelected.value = newValue ? [...newValue] : [];
}, { immediate: true, deep: true });


// watch(
//   () => props.filter,
//   debounce(async (newValue: any, o: any) => {
//     itemsSelected.value = undefined

//     options.value = await loadData()
//   }, 300),
//   { deep: true }
// )

watch(
  () => props.modelValue,
  (newValue: any, o: any) => {
    if (newValue == undefined) {
      itemsSelected.value = undefined
    }
  }
)

// const debouncedFilterChange = debounce(async (e: MultiSelectFilterEvent) => {
//   currentQuery = e.value
//   if (props.lazy && currentQuery.length >= props.minCharQuery) {
//     options.value = await loadData(currentQuery)
//   } 
//   if (props.lazy && currentQuery.length <props.minCharQuery) {
//     options.value = []
//   }
// }, 300)

const loadData = async (query?: string, page?: number) => {
  if (props.options) return props.options
  if (!props.findEndpoint) return

  const params = {
    count: props.lazy ? CountType.Yes : CountType.No,
    ...props.filter,
    cur_page: page || 1,
    page_size: 50
  }

  if (query && props.freeSearchParameterName) {
    params[props.freeSearchParameterName] = query
  }

  try {
    loading.value = true
    const response = await axiosInstance.get(`${props.findEndpoint}`, { params })
    if (props.lazy) {
      const totalCountKey = 'x-total-count'
      totalRecordCount = response.headers[totalCountKey] ? parseInt(response.headers[totalCountKey]) : 0
    }
    return response.data
  } finally {
    loading.value = false
  }
}

const loadMoreItems = async (e: VirtualScrollerLazyEvent) => {
  console.log(lazy)
  if (totalRecordCount == 0 || !lazy) return

  const delta = e.last - e.first
  if (props.lazy && delta < 10 && totalRecordCount > e.last && props.minCharQuery == 0) {
    options.value = [...options.value, ...(await loadData(currentQuery, Math.ceil(e.last / 50) + 1))]
  }
}

const getLabel = (slotProp: any) => {
  const arrayLabel: any[] = []
  slotProp.value.forEach((e: any) => {
    if (Object.keys(e).includes(props.optionLabel)) arrayLabel.push(e[props.optionLabel])
    else arrayLabel.push(e)
  })
  return arrayLabel.join(', ') || '&nbsp;'
}

const reload = async () => {
  options.value = await loadData()
}

defineExpose<IAppMultiselectComponent>({
  reload
})
</script>
<template>
  <MultiSelect
    filter
    v-model="itemsSelected"
    :emptyMessage="props.emptyMessage"
    :loading="loading"
    :options="options"
    :optionLabel="props.optionLabel"
    :placeholder="placeholder"
    :maxItemSelected="maxItemSelected"
    :virtualScrollerOptions="lazy ? { itemSize: 44, lazy: true, onLazyLoad: loadMoreItems } : null"

    :filterFields="props.filterFields"
    display="chip"
  >
    <template #value="slotProps">
      <div v-if="!slotProps.value">
        {{ slotProps.placeholder || '&nbsp;' }}
      </div>
      <slot v-else name="value" :value="itemsSelected">
        {{ getLabel(slotProps) }}
      </slot>
    </template>
    <template #option="slotProps">
      <slot name="option" :option="slotProps.option">
        {{ getPropertyByPath(slotProps.option, props.optionLabel) }}
      </slot>
    </template>
  </MultiSelect>
</template>
<style scoped></style>
