import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

type CartContextType = {
  cartCount: number;
  refreshCartCount: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }

    try {
      const response = await api.get("/cart/me");
      const items = response.data.data || [];

      const count = items.reduce(
        (sum: number, item: { quantity: number }) => sum + item.quantity,
        0
      );

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    refreshCartCount();
  }, [isAuthenticated]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}