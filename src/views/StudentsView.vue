<script setup lang="ts">
import { AxiosInstance } from 'axios';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useAxios } from '../axios-config';
import { IAppTableComponent } from '../components/AppTable.vue';
import useBaseCrudPage from './base/BaseCrudPage';
import type { IStudentiFilter, IStudentiRead, IStudentiWrite } from '../../models/IStudenti';
import { StudentiApiService } from "../../service/api/studenti.api.service";
import { CountType } from '../../models/enums/countType';   

const axiosInstance: AxiosInstance = useAxios();
const tbl = ref<IAppTableComponent | null>(null)
const service = new StudentiApiService(axiosInstance)
const toast = useToast()
const {
    currentFilter,
    itemToEdit,
    sidebarVisible,
    dialogVisible,
    onItemSelectedChanged,
    onFilterChanged,
    onSubmitted,
    onCancel,
    hideSidebar,
    submitDelegate,
    addDelegate,
    hideDialog,
    refreshDelegate,
    exportDelegate
} = useBaseCrudPage<IStudentiWrite, IStudentiRead, IStudentiFilter, number, StudentiApiService>(
    service,
    tbl,
    'id'
)

const columns = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'name', header: 'Name', sortable: true },
    { field: 'surname', header: 'Surname', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
];

const display = ref(false);

function open() {
    display.value = true;
}

function close() {
    display.value = false;
}

const addChildDelegate = () => {
    dialogVisible.value = true
}
</script>

<template>
    <div>
        <app-table ref="tbl" :filter="currentFilter" :countType="CountType.Yes" :columns="columns"
            findEndpoint="https://localhost:7031/students/find" :addDelegate="addChildDelegate" />
        <template>
            <div class="card">
                <div class="font-semibold text-xl mb-4">Dialog</div>
                <Dialog header="Nuovo studente" v-model:visible="dialogVisible" :breakpoints="{ '960px': '75vw' }"
                    :style="{ width: '30vw' }" :modal="true">
                    <app-form :fields="[
                            {
                                label: 'Nome',
                                name: 'name',
                                type: 'text',
                                cssClass: 'col-4 md:col-2 lg:col-2'
                            },
                            {
                                label: 'Cognome',
                                name: 'surname',
                                type: 'text',
                                cssClass: 'col-8 md:col-10 lg:col-10'
                            },
                            {
                                label: 'Email',
                                name: 'email',
                                type: 'text',
                                cssClass: 'col-8 md:col-10 lg:col-10'
                            },
                            {
                                label: 'Classe',
                                name: 'classroomid',
                                type: 'dropdown',
                                findEndpoint: 'https://localhost:7031/classroom',
                                freeSearchParameterName: 'cognome',
                                optionLabel: 'roomNumber',
                                optionValue: 'id',
                                minCharQuery: 3,
                                cssClass: 'col-3 md:col-3 lg:col-3',
                                placeholder: 'classroom',
                            },
                            {
                                label: 'Classe',
                                name: 'courseids',
                                type: 'multiselect',
                                findEndpoint: 'https://localhost:7031/course',
                                freeSearchParameterName: 'cognome',
                                optionLabel: 'courseName',
                                optionValue: 'id',
                                minCharQuery: 3,
                                cssClass: 'col-3 md:col-3 lg:col-3',
                                placeholder: 'course',
                            }
                            ]" v-model="itemToEdit" :submitDelegate="submitDelegate" @cancel="close"
                        @submitted="onSubmitted"></app-form>
                </Dialog>
                <Button label="Show" style="width: auto" @click="open" />
            </div>
        </template>
    </div>
</template>
