import { createStore } from 'zustand/vanilla'

export type DashboardState = {
  // add self state here
}

export type DashboardActions = {
  // add self actions here
}

export type DashboardStore = DashboardState & DashboardActions

export const defaultInitState: DashboardState = {
  isProduction: false,
}

export const createDashboardStore = (
  initState: DashboardState = defaultInitState,
) => {
  return createStore<DashboardStore>()((set) => ({
    ...initState,
  }))
}
