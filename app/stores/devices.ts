import { defineStore } from 'pinia'

export type Device = {
  id: number | string
  name: string
  type?: string
  status?: string
  brightness?: number
  temperature?: number
}

type DevicesState = {
  devicesByRoom: Record<string, Device[]>
  selectedByRoom: Record<string, string | number | null>
}

export const useDevicesStore = defineStore('devices', () => {
  const state = reactive<DevicesState>({ devicesByRoom: {}, selectedByRoom: {} })

  function key(roomId: string | number) { return String(roomId) }

  /** Normalize backend device payload to the internal Device shape */
  function normalizeDevice(input: any): Device {
    const d: Device = {
      id: input.id,
      name: input.name ?? input.title ?? `Device ${input.id}`,
      type: input.type ?? input.category ?? input.kind,
      brightness: typeof input.brightness === 'number' ? input.brightness : (typeof input.level === 'number' ? input.level : undefined),
      temperature: typeof input.temperature === 'number' ? input.temperature : (typeof input.temp === 'number' ? input.temp : undefined),
      status: undefined
    }
    // Derive status from various shapes
    const rawStatus = input.status
    if (typeof rawStatus === 'string') {
      const s = rawStatus.toLowerCase()
      d.status = s === 'on' ? 'online' : s === 'off' ? 'offline' : s
    } else if (typeof rawStatus === 'boolean') {
      d.status = rawStatus ? 'online' : 'offline'
    } else if (typeof input.power === 'boolean') {
      d.status = input.power ? 'online' : 'offline'
    } else if (typeof input.isOn === 'boolean') {
      d.status = input.isOn ? 'online' : 'offline'
    } else if (typeof input.state === 'string') {
      const s = input.state.toLowerCase()
      d.status = s === 'on' ? 'online' : s === 'off' ? 'offline' : s
    }
    return d
  }

  /** Initialize room devices only once to prevent clobbering optimistic updates */
  function initFromRoom(roomId: string | number, list: Device[]) {
    const k = key(roomId)
    if (!state.devicesByRoom[k] || state.devicesByRoom[k].length === 0) {
      state.devicesByRoom[k] = (list || []).map(d => normalizeDevice(d))
      if (state.devicesByRoom[k].length > 0 && !state.selectedByRoom[k]) {
        state.selectedByRoom[k] = state.devicesByRoom[k][0].id
      }
    }
  }

  /** Get a computed list of devices for a room */
  function getDevices(roomId: string | number) {
    return computed<Device[]>(() => state.devicesByRoom[key(roomId)] || [])
  }

  /** Get a computed selected id for a room */
  function getSelectedId(roomId: string | number) {
    return computed<string | number | null>(() => state.selectedByRoom[key(roomId)] ?? null)
  }

  /** Get the computed selected device for a room */
  function getSelected(roomId: string | number) {
    const devices = getDevices(roomId)
    const selectedId = getSelectedId(roomId)
    return computed<Device | null>(() => devices.value.find(d => String(d.id) === String(selectedId.value)) || null)
  }

  /** Update the selected device id for a room */
  function selectDevice(roomId: string | number, deviceId: string | number) {
    state.selectedByRoom[key(roomId)] = deviceId
  }

  /** Merge an update into the local list */
  function mergeUpdate(roomId: string | number, partial: Partial<Device> & { id: string | number }) {
    const list = state.devicesByRoom[key(roomId)] || []
    const idx = list.findIndex(d => String(d.id) === String(partial.id))
    if (idx !== -1) list[idx] = { ...list[idx], ...partial }
  }

  /**
   * Update a device with optimistic UI and retry-capable POST.
   * Prefers the user's intent for status/brightness/temperature to avoid snapping back
   * if the backend returns a stale echo immediately.
   */
  async function updateDevice(roomId: string | number, deviceId: string | number, payload: Partial<{ power: boolean; brightness: number; temperature: number }>) {
    const list = state.devicesByRoom[key(roomId)] || []
    const prev = [...list]

    // optimistic
    if (typeof payload.power === 'boolean') mergeUpdate(roomId, { id: deviceId, status: payload.power ? 'online' : 'offline' })
    if (typeof payload.brightness === 'number') mergeUpdate(roomId, { id: deviceId, brightness: Math.max(0, Math.min(100, Math.round(payload.brightness))) })
    if (typeof payload.temperature === 'number') mergeUpdate(roomId, { id: deviceId, temperature: Math.max(10, Math.min(35, Math.round(payload.temperature))) })

    try {
      const nuxtApp = useNuxtApp()
      const res = await nuxtApp.$apiFetch<any>(`/rooms/${roomId}/devices/${deviceId}`, {
        method: 'POST',
        body: payload
      })
      // Prefer the user's intended changes (optimistic) over immediate server echo,
      // since some backends return stale status right after update.
      const normalized = normalizeDevice({ id: deviceId, ...res })
      const next: Device = { id: deviceId, ...normalized }
      if (typeof payload.power === 'boolean') {
        next.status = payload.power ? 'online' : 'offline'
      }
      if (typeof payload.brightness === 'number') {
        next.brightness = Math.max(0, Math.min(100, Math.round(payload.brightness)))
      }
      if (typeof payload.temperature === 'number') {
        next.temperature = Math.max(10, Math.min(35, Math.round(payload.temperature)))
      }
      mergeUpdate(roomId, next)
      return res
    } catch (e) {
      // rollback
      state.devicesByRoom[key(roomId)] = prev
      throw e
    }
  }

  return { state, initFromRoom, getDevices, getSelectedId, getSelected, selectDevice, updateDevice, mergeUpdate }
})
