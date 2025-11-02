type DeviceBase = {
  id: number | string
  name: string
  type?: string
  status?: string
  brightness?: number
  temperature?: number
}

export function useDevices(roomId: string | number) {
  const keyBase = `devices-${roomId}`
  const devices = useState<DeviceBase[]>(`${keyBase}-list`, () => [])
  const selectedId = useState<string | number | null>(`${keyBase}-selected`, () => null)

  const selected = computed(() =>
    devices.value.find(d => String(d.id) === String(selectedId.value)) || null
  )

  function initFromRoomDevices(roomDevices: DeviceBase[]) {
    if (!Array.isArray(roomDevices)) return
    if (devices.value.length === 0) {
      devices.value = roomDevices.map(d => ({
        ...d,
        // derive defaults
        brightness: typeof d.brightness === 'number' ? d.brightness : (d.type?.toLowerCase() === 'light' ? 60 : undefined),
        temperature: typeof d.temperature === 'number' ? d.temperature : (d.type?.toLowerCase() === 'climate' ? 22 : undefined)
      }))
      if (devices.value.length > 0 && selectedId.value == null) {
        selectedId.value = devices.value[0].id
      }
    }
  }

  function selectDevice(id: string | number) {
    selectedId.value = id
  }

  function applyUpdate(partial: Partial<DeviceBase> & { id: string | number }) {
    const idx = devices.value.findIndex(d => String(d.id) === String(partial.id))
    if (idx !== -1) {
      devices.value[idx] = { ...devices.value[idx], ...partial }
    }
  }

  async function updateDevice(id: string | number, payload: Partial<{ power: boolean; brightness: number; temperature: number }>) {
    const res = await $fetch<DeviceBase>(`/api/devices/${id}`, {
      method: 'PATCH',
      body: payload
    })
    applyUpdate({ id: res.id, ...res })
    return res
  }

  return { devices, selectedId, selected, initFromRoomDevices, selectDevice, applyUpdate, updateDevice }
}

