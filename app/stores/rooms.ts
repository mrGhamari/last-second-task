import { defineStore } from 'pinia'

export type Device = {
  id: number | string
  name: string
  type?: string
  status?: string
  brightness?: number
  temperature?: number
}

export type RoomSummary = { id: number | string; name: string; description?: string; deviceCount?: number; devices?: Device[] }
export type RoomDetail = { id: number | string; name: string; description?: string; devices?: Device[] }

export const useRoomsStore = defineStore('rooms', () => {
  const rooms = ref<RoomSummary[]>([])
  const current = ref<RoomDetail | null>(null)

  function setRooms(list: RoomSummary[]) {
    rooms.value = list
  }

  function setCurrent(room: RoomDetail | null) {
    current.value = room
  }

  return { rooms, current, setRooms, setCurrent }
})

