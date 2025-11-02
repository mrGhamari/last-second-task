export type MenuItem = {
  to: string
  label: string
  exact?: boolean
}

// Primary navigation items used in the header menu
export const MENU_ITEMS: MenuItem[] = [
  { to: '/', label: 'Home', exact: true },
  { to: '/rooms', label: 'Rooms' },
]

