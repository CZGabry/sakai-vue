<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAxios } from '../axios-config'
import type { DataTableRowSelectEvent, DataTableSortEvent } from 'primevue/datatable'
import { CountType } from '../../models/enums/countType';
import type { PageState } from 'primevue/paginator'
export interface IAppTableComponent {
    reload(): void
}

interface IColumnDef {
    field: string
    header?: string
    sortable?: boolean
}

interface IAppTableProps {
    dataKey: string
    columns: IColumnDef[]
    findEndpoint?: string,
    addDelegate?: () => void,
    itemSelected?: any,
    emptyMessage: string,
    header : string,
    filter?: any,
    countType?: CountType,
    showActionButtons: boolean,
    editDelegate?: (item:any) => void,
}

const props = withDefaults(defineProps<IAppTableProps>(), {
    dataKey: 'id',
    rowSize: 'small',
    columns: undefined,
    canExpand: false,
    emptyMessage: 'Nessun dato trovato',
    countType: CountType.Yes,
    showActionButtons: true
})

const axiosInstance = useAxios()
const rows = ref < any[] > ([])
const loading = ref(false)
const totalRecords = ref(0)
const itemSelected = ref<any>(props.itemSelected || null)

const currentPage = ref<number>(props.filter?.currentPage || 1)
const pageSize = ref<number>(props.filter?.pageSize || 10)
const fieldsOrder = ref<Record<string, string>>()

const deleteRowDialog = ref(false);

onMounted(() => {
    loadData()
})

const showHeader = computed(() => {
    return !!props.addDelegate
})

const onPageChanged = async (e: PageState) => {
    currentPage.value = e.page + 1
    pageSize.value = e.rows
    await loadData()
}
const loadData = async () => {
    if (!props.findEndpoint) return

    const pagination = {
        count: props.countType,
        cur_page: currentPage.value,
        page_size: pageSize.value
    }

    const sorting = { fields_order: fieldsOrder.value }

  let params = {}
  if (props.countType != CountType.No) params = { ...pagination }
  // ho una clonna sortabile aggiungo il sort
  if (props.columns.some((e) => e.sortable)) params = { ...params, ...sorting }

  params = { ...params, ...props.filter }

    loading.value = true
    try {
        const response = await axiosInstance.get(`${props.findEndpoint + '/find'}`, { params })
        rows.value = response.data
        if (props.countType == undefined || props.countType == CountType.No) return

        const totalCountKey = 'x-total-count'

        totalRecords.value = response.headers[totalCountKey] ? parseInt(response.headers[totalCountKey]) : 0
        console.log('totalRecords', totalRecords.value)
    } finally {
        loading.value = false
    }
}

const reload = () => {
    loadData()
}

const onRowSelect = (event: DataTableRowSelectEvent) => {
    console.log(event)
}

defineExpose<IAppTableComponent>({
    reload, 
})


const confirmDeleteRow = async () => {
    if (!props.findEndpoint) return;

    try {
        // Construct the endpoint URL by appending the id to the URL path
        const endpointWithId = `${props.findEndpoint}/${itemSelected.value.id}`;
        const response = await axiosInstance.delete(endpointWithId);
        reload();

    } finally {
        loading.value = false;
    }

    console.log("Requesting delete confirmation for row: " + itemSelected.value.id);
    deleteRowDialog.value = false;
};

function deleteRow(rowData: any) {
    itemSelected.value = rowData;
    deleteRowDialog.value = true;
}
</script>

<template>
    <div>
        <DataTable :value="rows" :loading="loading" :dataKey="props.dataKey" @row-select="onRowSelect">
            <template #header v-if="showHeader">
                <slot name="table_header">
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <span class="text-xl text-900 font-bold">{{ props.header }}</span>
                        <span>
                            <Button v-if="addDelegate" class="p-button-text" label="Nuovo" icon="pi pi-plus"
                                @click="addDelegate"></Button>
                            <slot name="table_header_button" :itemSelected="itemSelected" :rows="rows"></slot>
                        </span>
                    </div>
                </slot>
            </template>
            <template #empty>
                <p class="text-center">{{ props.emptyMessage }}</p>
            </template>
            <Column v-for="column in props.columns" :key="column.field" :field="column.field" :header="column.header"
                :sortable="column.sortable" />
            <Column v-if="props.showActionButtons" :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                    <Button v-if="editDelegate" icon="pi pi-pencil" outlined rounded class="mr-2" @click="editDelegate(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger"
                        @click="deleteRow(slotProps.data)" />
                </template>
            </Column>
        </DataTable>
        <div class="paginator-container">
            <p class="paginator-text">Totale: {{ totalRecords }}</p>
            <Paginator class="inline-block" v-if="props.countType !== CountType.No" :rows="pageSize"
                :totalRecords="totalRecords" :rowsPerPageOptions="[5, 10, 20, 50, 100]" @page="onPageChanged">
            </Paginator>
        </div>
        <Dialog v-model:visible="deleteRowDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="itemSelected">Are you sure you want to delete? <b>{{ "product.name" }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteRowDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="confirmDeleteRow" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
/* Add your styles here */
</style>
