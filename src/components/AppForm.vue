<script setup lang="ts">
import { computed, defineProps, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength } from '@vuelidate/validators';
import InputText from 'primevue/inputtext'; // Default import
import Button from 'primevue/button';       // Default import
import { type IFormModel } from '../../models/base/IFormModel';

interface FormField {
    name: string;
    type: 'text' | 'number' | 'bool' | 'password' | 'dropdown' | 'multiselect' |
    'lazymultiselect' |'chips' | 'date' |
    'multiplemonths' | 'time' | 'month' | 'year' | 'textarea';
    validators?: Record<string, any>;
    cssClass?: string;
    placeholder?: string;
    label?: string;
    options?: any[];
    optionLabel?: string;
    optionValue?: string;
    disabled?: boolean;
    findEndpoint?: string;
    preSelectedItem?: any;
    freeSearchParameterName?: string;
    filter?: any;
    filterFields?: Array<string>;
    optionValues?: any[];
    lazy?: boolean;
    minCharQuery?: number;
}

interface FormConfig {
    titleIcon?: string;
    title?: string;
    fields: FormField[];
    modelValue: any;
    submitDelegate?: (formData: IFormModel<any>) => Promise<any>;
    submitLabel?: string;
    cancelLabel?: string;
    resetLabel?: string;
}

const props = withDefaults(defineProps<FormConfig>(), {
    submitLabel: 'Save',
    cancelLabel: 'Cancel',
    resetLabel: 'Reset',
});

const emit = defineEmits(['update:modelValue', 'submitted', 'cancel']);
const state = ref(!!props.modelValue ? Object.assign({}, props.modelValue) : {})
const originalState = !!props.modelValue ? JSON.stringify(props.modelValue) : '{}'

const rules = computed(() => {
    const validationRules : any = {};
    props.fields.forEach(field => {
        if (field.validators) {
            validationRules[field.name] = {};
            Object.entries(field.validators).forEach(([key, validatorFunction]) => {
                validationRules[field.name][key] = validatorFunction;
            });
        } else {
            // Even if no validators, define a minimal validation to ensure $model is setup
            validationRules[field.name] = { required: false };
        }
    });
    return validationRules;
});

const v$ = useVuelidate(rules, state);

const handleSubmit = async () => {
    if (!props.submitDelegate) {
        console.error('No submitDelegate defined');
        return;
    }
    const data = { data: state.value, isValid: !v$.value.$invalid };
    await props.submitDelegate(data);
    emit('submitted', data);
};

const resetForm = () => {
    state.value = { ...props.modelValue };
    v$.value.$reset();
};

const validationCssClass = (validation: any) => {
    return {
        'p-invalid': validation.$error
    }
}

const refs = ref<{ [key: string]: any }>({})
</script>

<template>

    <div class="form-container">
        <h5 v-if="props.titleIcon || props.title" class="form-title">
            <i v-if="props.titleIcon" :class="props.titleIcon"></i> {{ props.title }}
        </h5>
        <form @submit.prevent="handleSubmit" class="form-grid">
            <div v-for="field in props.fields" :key="field.name" class="form-group">
                <label :for="field.name" class="form-label">{{ field.label }}</label>

                <InputText v-if="field.type === 'text'" v-model="state[field.name]" :placeholder="field.placeholder" />

                <textarea v-if="field.type === 'textarea'" v-model="state[field.name]" :placeholder="field.placeholder"
                    class="textarea-field" />

                <InputNumber v-else-if="field.type === 'number'" :id="field.name" :name="field.name"
                    :placeholder="field.placeholder" v-model="v$[field.name].$model"
                    :class="validationCssClass(v$[field.name])" :ref="(el: any) => (refs[field.name] = el)" />

                <AppDropdown v-else-if="field.type === 'dropdown'" :id="field.name" :name="field.name"
                    :placeholder="field.placeholder" :findEndpoint="field.findEndpoint"
                    :preSelectedItem="field.preSelectedItem" :freeSearchParameterName="field.freeSearchParameterName"
                    :options="field.options" :optionLabel="field.optionLabel" :optionValue="field.optionValue"
                    :filter="field.filter" :filterFields="field.filterFields" :lazy="field.lazy"
                    v-model="v$[field.name].$model" :cssClass="validationCssClass(v$[field.name])"
                    :ref="(el: any) => (refs[field.name] = el)">
                    <template #option="slotProps">
                        <slot :name="field.name + '_option'" :option="slotProps.option"></slot>
                    </template>
                    <template #value="slotProps">
                        <slot :name="field.name + '_value'" :value="slotProps.value"></slot>
                    </template>
                </AppDropdown>
                <AppMultiselect v-else-if="field.type === 'multiselect'" :id="field.name" :name="field.name"
                    :lazy="field.lazy" :freeSearchParameterName="field.freeSearchParameterName"
                    :placeholder="field.placeholder" :findEndpoint="field.findEndpoint" :optionLabel="field.optionLabel"
                    :optionValue="field.optionValue" :filter="field.filter" :filterFields="field.filterFields"
                    :selectedOptions="field.optionValues" :minCharQuery="field.minCharQuery"
                    v-model="v$[field.name].$model" :class="validationCssClass(v$[field.name])"
                    :ref="(el: any) => (refs[field.name] = el)" :chips="field.chips">
                    <template #option="slotProps">
                        <slot :name="field.name + '_option'" :option="slotProps.option"></slot>
                    </template>
                    <template #value="slotProps">
                        <slot :name="field.name + '_value'" :value="slotProps.value"></slot>
                    </template>
                </AppMultiselect>

            </div>

            <div class="form-actions">
                <Button type="submit" :label="props.submitLabel" icon="pi pi-check" class="p-button-success" />
                <Button type="button" :label="props.resetLabel" icon="pi pi-refresh" class="p-button-secondary"
                    @click="resetForm" />
            </div>
        </form>
    </div>
</template>


<style scoped>
.form-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.form-title {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

.form-title i {
    margin-right: 8px;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1rem;
}

.form-label {
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.input-field, .textarea-field {
    width: 100%;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    height: 40px; /* Make sure input and textarea have consistent height */
}

.input-field:focus, .textarea-field:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.p-button-success {
    background-color: #28a745;
    border-color: #28a745;
}

.p-button-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
}

.p-button-success:hover {
    background-color: #218838;
    border-color: #1e7e34;
}

.p-button-secondary:hover {
    background-color: #5a6268;
    border-color: #545b62;
}
</style>
