import { useToast } from 'primevue/usetoast'
import { ref, type Ref, type UnwrapRef } from 'vue'
import type { IFormModel } from '../../../models/base/IFormModel'
import type { IBaseFilter } from '../../../models/base/IBase'
import type { BaseWriteApiService } from '../../../service/api/base/base-api-service'
import type { IAppTableComponent } from '../../components/AppTable.vue'

export default function useBaseCrudPage<
  TWrite,
  TRead,
  TFilter extends IBaseFilter,
  TId,
  TService extends BaseWriteApiService<TWrite, TRead, TFilter, TId>
>(
  service: TService,
  tbl: Ref<IAppTableComponent | null>,
  idFieldName: string = 'id',
  initialFilter: Partial<TFilter> | undefined = undefined
) {
  const toast = useToast()
  const sidebarVisible = ref<boolean>(false)
   const dialogVisible = ref(false);
  const currentFilter = ref<Partial<TFilter> | undefined>(initialFilter)
  const itemToEdit = ref()

  const onItemSelectedChanged = (itemSelected: TRead | null) => {
    if (!itemSelected) return
    itemToEdit.value = itemSelected
    sidebarVisible.value = true
  }

  const onFilterChanged = (formData: IFormModel<TFilter>) => {
    if (!formData.isValid) return
    currentFilter.value = formData.data as UnwrapRef<Partial<TFilter>>
  }

  function hasIdField(obj: any, fieldName: string): obj is { [key: string]: any } {
    return typeof obj === 'object' && obj !== null && fieldName in obj
  }

  const submitDelegate = async (formData: IFormModel<TWrite>): Promise<void> => {
    if (!formData.isValid)
        return;
    if (hasIdField(formData.data, idFieldName)){
      const id: any = formData.data[idFieldName]
      await service.upset(formData.data, id)
    } else {
      await service.insert(formData.data)
    }
    toast.add({
      closable: true,
      life: 5000,
      severity: 'success',
      summary: 'Operazione completata con successo'
    })
    hideSidebar()
    hideDialog()
    refreshDelegate()
  }

  const addDelegate = () => {
    itemToEdit.value = {}
    sidebarVisible.value = true
  }

  const refreshDelegate = () => {
    if (!tbl.value) return
    
    tbl.value.reload()
  }

  const exportDelegate = () => {
    tbl.value?.exportExcel()
  }

  const printPdfDelegate = () => {
    console.log("print pdf")
    tbl.value?.printPdf()
  }

  const onSubmitted = () => {
    if (!tbl.value) return

    tbl.value.reload()
  }

  const onCancel = () => {
    hideSidebar()
  }

  const hideSidebar = () => {
    itemToEdit.value = undefined
    sidebarVisible.value = false
  }

   const hideDialog = () => {
    itemToEdit.value = undefined
    dialogVisible.value = false
  }

  return {
    currentFilter,
    itemToEdit,
    sidebarVisible,
    dialogVisible,
    onItemSelectedChanged,
    onFilterChanged,
    onSubmitted,
    onCancel,
    hideSidebar,
    hideDialog,
    submitDelegate,
    addDelegate,
    refreshDelegate,
    exportDelegate,
    printPdfDelegate
  }
}
