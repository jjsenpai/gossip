import { create } from 'zustand'

type roomDetails = {
    users: []
}

type userType = {
    userId: string,
    displayName: string,
    email: string,
    createdOn: Date,
    rooms: [],
}

type Store = {
  count: number
  userDetails: userType | object
  roomDetails: roomDetails | object
  inc: () => void
}

export const useStore = create<Store>()((set) => ({
  count: 1,
  userDetails: {},
  roomDetails: {},
  inc: () => set((state) => ({ count: state.count + 1 })),
}))