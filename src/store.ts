import { create } from 'zustand';

export type messageType = {
  sentBy: string;
  timeStamp: Date;
  message: string;
  messageId: string;
};

export type roomDetailsType = {
  roomId?:string;
  users?: string[];
  messages?: messageType[];
};

export type userType = {
  userId?: string;
  displayName?: string;
  email?: string;
  createdOn?: Date;
  roomsJoined?: string[];
  photo?: string;
};

type Store = {
  userDetails: userType;
  roomDetails: roomDetailsType[];
  setUserDetails: (userDetails : userType) => void,
  setRoomDetails: (roomDetailsPara : roomDetailsType[]) => void,
};

export const useStore = create<Store>((set) => ({
  userDetails: {},
  roomDetails: [],
  setUserDetails: (userDetails: userType) => set(() => ({ userDetails: userDetails })),
  setRoomDetails: (roomDetailsPara: roomDetailsType[]) => set(() => ({ roomDetails: roomDetailsPara })),
}));