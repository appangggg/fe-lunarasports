import { create } from 'zustand';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: any) => void;
  decreaseQuantity: (productId: number) => void; // Fungsi Baru
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addToCart: (product) => set((state) => {
    const existingItem = state.items.find((item) => item.id === product.id);
    if (existingItem) {
      return {
        items: state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { items: [...state.items, { ...product, quantity: 1 }] };
  }),

  // Fungsi mengurangi jumlah barang
  decreaseQuantity: (productId) => set((state) => {
    const existingItem = state.items.find((item) => item.id === productId);
    if (existingItem && existingItem.quantity > 1) {
      return {
        items: state.items.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        ),
      };
    }
    // Jika qty tinggal 1 dan dikurangi lagi, hapus barang dari keranjang
    return { items: state.items.filter((item) => item.id !== productId) };
  }),

  removeFromCart: (productId) => set((state) => ({
    items: state.items.filter((item) => item.id !== productId),
  })),

  clearCart: () => set({ items: [] }),

  getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),

  getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));