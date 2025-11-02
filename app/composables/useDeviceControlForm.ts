/**
 * useDeviceControlForm
 * Encapsulates Control Panel form state, type guards, validation and helpers.
 * Keeps UI concerns in the component and state/API concerns in Pinia stores.
 */
export type DeviceLike = {
  id: string | number
  name?: string
  type?: string
  status?: string
  brightness?: number
  temperature?: number
} | null

export function useDeviceControlForm(selected: Readonly<Ref<DeviceLike>>, roomId: string | number) {
  const idPrefix = computed(() => `ctrl-${roomId}-${selected.value?.id ?? 'none'}`)

  const form = reactive({
    power: false,
    brightness: 50 as number | undefined,
    temperature: 22 as number | undefined,
  })

  // Keep a snapshot of the last-synced values so Reset can reliably restore them
  const snapshot = reactive<{ power: boolean; brightness?: number; temperature?: number}>({
    power: false,
    brightness: 50,
    temperature: 22,
  })

  const isLight = computed(() => (selected.value?.type || '').toLowerCase() === 'light')
  const isClimate = computed(() => (selected.value?.type || '').toLowerCase() === 'climate')

  const validTemp = computed(() => !isClimate.value || (typeof form.temperature === 'number' && form.temperature >= 10 && form.temperature <= 35))
  const formValid = computed(() => validTemp.value)

  /** Hydrate form from selected device */
  function syncFromSelected() {
    if (!selected.value) return
    const power = (selected.value.status || '').toLowerCase() === 'online'
    const brightness = typeof selected.value.brightness === 'number' ? selected.value.brightness : (isLight.value ? 60 : undefined)
    const temperature = typeof selected.value.temperature === 'number' ? selected.value.temperature : (isClimate.value ? 22 : undefined)

    form.power = power
    form.brightness = brightness
    form.temperature = temperature

    // Update snapshot to the latest known device state
    snapshot.power = power
    snapshot.brightness = brightness
    snapshot.temperature = temperature
  }

  /** Reset local validation/errors in the caller; this only resets inputs */
  function resetInputs() {
    syncFromSelected()
  }

  /** Restore from last snapshot (useful when form is dirty but selected hasn't changed) */
  function restoreSnapshot() {
    form.power = snapshot.power
    form.brightness = snapshot.brightness
    form.temperature = snapshot.temperature
  }

  watch(selected, () => syncFromSelected(), { immediate: true })

  return { idPrefix, form, isLight, isClimate, validTemp, formValid, resetInputs, restoreSnapshot }
}
