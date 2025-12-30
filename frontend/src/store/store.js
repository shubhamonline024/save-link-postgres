import { create } from "zustand";

const useStore = create((set) => ({
  urlStore: [],
  setUrlStore: (payload) => set(() => ({ urlStore: payload })),
  setIsAction: (id, payload) =>
    set((state) => {
      const updatedData = state.urlStore.map((row) => {
        if (row.id === id) {
          const newData = { ...row };
          newData.isAction = payload;
          return newData;
        }
        return row;
      });

      return { urlStore: updatedData };
    }),
}));

export default useStore;
