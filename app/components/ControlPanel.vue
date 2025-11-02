<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <h2 class="h5 mb-3">Control Panel</h2>

      <div v-if="!selected" class="alert alert-info mb-0" role="status" aria-live="polite">
        Select a device to adjust its settings.
      </div>

      <form v-else novalidate @submit.prevent="onSubmit" :aria-describedby="formError ? 'form-error' : undefined">
        <div v-if="formError" id="form-error" class="alert alert-danger" role="alert">{{ formError }}</div>

        <div class="mb-3">
          <label class="form-label" :for="idPrefix + '-name'">Device</label>
          <input :id="idPrefix + '-name'" class="form-control" type="text" :value="selected.name" disabled>
        </div>

        <div class="form-check form-switch mb-3">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            :id="idPrefix + '-power'"
            v-model="form.power"
            :aria-checked="form.power ? 'true' : 'false'"
          >
          <label class="form-check-label" :for="idPrefix + '-power'">Power</label>
        </div>

        <div v-if="isLight" class="mb-3">
          <label class="form-label" :for="idPrefix + '-brightness'">Brightness (0-100)</label>
          <input
            :id="idPrefix + '-brightness'"
            class="form-range"
            type="range"
            min="0"
            max="100"
            v-model.number="form.brightness"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="form.brightness ?? 0"
          >
          <div class="form-text">{{ form.brightness }}%</div>
        </div>

        <div v-if="isClimate" class="mb-3">
          <label class="form-label" :for="idPrefix + '-temperature'">Temperature (10-35°C)</label>
          <input
            :id="idPrefix + '-temperature'"
            class="form-control"
            type="number"
            min="10"
            max="35"
            v-model.number="form.temperature"
          >
          <div v-if="!validTemp" class="invalid-feedback d-block">Temperature must be between 10 and 35.</div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary" type="submit" :disabled="submitting || !formValid">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
            Save Changes
          </button>
          <button class="btn btn-outline-secondary" type="button" :disabled="submitting" @click="resetForm">Reset</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ControlPanel: purely UI + validation. State and API are delegated to Pinia stores.
 * This keeps concerns separated and the component reusable.
 */
import { useDevicesStore } from '~/stores/devices'
import { useDeviceControlForm } from '~/composables/useDeviceControlForm'

// Props and dependencies
const props = defineProps<{ roomId: string | number }>()
const devicesStore = useDevicesStore()
const selected = devicesStore.getSelected(props.roomId)

// Form logic encapsulated in a composable
const { idPrefix, form, isLight, isClimate, validTemp, formValid, resetInputs, restoreSnapshot } = useDeviceControlForm(selected, props.roomId)

// Local UI state only
const submitting = ref(false)
const formError = ref<string | null>(null)

function resetForm() {
  // Explicitly restore snapshot to ensure UI reverts even if watchers didn't run
  restoreSnapshot()
  formError.value = null
}

/** Submit and delegate update to the devices store */
async function onSubmit() {
  formError.value = null
  if (!selected.value) return
  if (!formValid.value) {
    formError.value = 'Please fix validation errors.'
    return
  }
  submitting.value = true
  try {
    await devicesStore.updateDevice(props.roomId, selected.value.id, {
      power: !!form.power,
      brightness: isLight.value ? form.brightness : undefined,
      temperature: isClimate.value ? form.temperature : undefined,
    })
    resetForm()
  } catch (e: any) {
    const msg = e?.data?.error || e?.data?.message || e?.response?._data?.error || e?.response?.statusText || e?.message || 'Failed to update device.'
    formError.value = msg
  } finally {
    submitting.value = false
  }
}
</script>
