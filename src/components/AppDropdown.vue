<script setup lang="ts">
import { ref, onMounted, watch, computed, defineProps } from 'vue';
import { useAxios } from '../axios-config';
import { getPropertyByPath } from '../helpers/utility';
import type { DropdownFilterEvent } from 'primevue/dropdown';
import type { VirtualScrollerLazyEvent } from 'primevue/virtualscroller';
import debounce from 'debounce'

interface IAppDropdownProps {
    id?: string;
    name?: string;
    optionLabel: string;
    optionValue?: string;
    placeholder?: string;
    findEndpoint?: string;
    cssClass?: string | any;
    preSelectedItem?: any;
    filter?: any;
    freeSearchParameterName?: string;
    options?: any[];
    modelValue: any;
    emptyMessage?: string;
    lazy?: boolean;
    filterFields?: Array<string>;
    showClear?: boolean;
}

const axiosInstance = useAxios();
const props = withDefaults(defineProps<IAppDropdownProps>(), {
    emptyMessage: 'Nessun dato trovato',
    lazy: false,
    freeSearchParameterName: 'ricerca_libera',
    showClear: true,
});

const emit = defineEmits(['update:modelValue']);
const loading = ref<boolean>(false);
const itemSelected = ref<any>();
const internalFilter = ref<string>('');
const options = ref<any[]>(props.options || []);
let currentQuery = '';
let totalRecordCount = 0;

const freeSearchEnabled = computed<boolean>(() => !!props.freeSearchParameterName);

onMounted(async () => {
    if (!props.lazy) options.value = await loadData();
    if (props.preSelectedItem) itemSelected.value = props.preSelectedItem;
});

watch(itemSelected, (newValue: any) => {
    let valueSelected = undefined;
    if (props.optionValue) valueSelected = newValue ? newValue[props.optionValue] : newValue;
    else valueSelected = newValue;
    emit('update:modelValue', valueSelected);
});

watch(
    () => props.filter,
    debounce(async (newValue: any, o: any) => {
        options.value = await loadData()
    }, 300),
    { deep: true }
)
watch(
    () => props.modelValue,
    (newValue: any, o: any) => {
        if (newValue == undefined) {
            itemSelected.value = undefined
        }
    }
)

const debouncedFilterChange = debounce(async (e: DropdownFilterEvent) => {
     currentQuery = e.value;
     if (props.lazy) options.value = await loadData(currentQuery);
}, 300);

const loadData = async (query?: string, page?: number) => {
    if (props.options) return props.options;
    if (!props.findEndpoint) return;

    let params: any = {
        count: props.lazy ? 'yes' : 'no',
        ...props.filter,
        cur_page: page || 1,
        page_size: 50,
    };

    if (query && props.freeSearchParameterName) {
        params[props.freeSearchParameterName] = query;
    }

    try {
        loading.value = true;
        const response = await axiosInstance.get(`${props.findEndpoint}`, { params });
        totalRecordCount = response.headers['x-total-count'] ? parseInt(response.headers['x-total-count']) : 0;
        return response.data;
    } finally {
        loading.value = false;
    }
};

const loadMoreItems = async (e: VirtualScrollerLazyEvent) => {
    if (totalRecordCount === 0) return;
    if (props.lazy && totalRecordCount > e.last) {
        options.value = [...options.value, ...(await loadData(currentQuery, Math.ceil(e.last / 50) + 1))];
    }
};
</script>

<template>
    <Dropdown :id="props.id" :emptyMessage="props.emptyMessage" v-model="itemSelected" :showClear="props.showClear"
        :loading="loading" :options="options" :optionLabel="props.optionLabel" :placeholder="props.placeholder"
         :filter="freeSearchEnabled" :filterFields="props.filterFields"
        :virtualScrollerOptions="{ lazy: true, itemSize: 44, onLazyLoad: loadMoreItems }" :class="props.cssClass">
        <template #value="slotProps">
            <div v-if="!slotProps.value">{{ slotProps.placeholder || '&nbsp;' }}</div>
            <slot v-else name="value" :value="slotProps.value">
                {{ getPropertyByPath(slotProps.value, props.optionLabel) }}
            </slot>
        </template>
        <template #option="slotProps">
            <slot name="option" :option="slotProps.option">
                {{ getPropertyByPath(slotProps.option, props.optionLabel) }}
            </slot>
        </template>
    </Dropdown>
</template>

<style scoped></style>
