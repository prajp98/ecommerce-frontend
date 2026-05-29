export type OrderItem = {
    orderItemId: number;
    productId: number;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
    totalPrice: number;
  };
  
  export type Order = {
    orderId: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    userId: number;
    userEmail: string;
    addressId: number;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    paymentMethod: string;
    orderItems: OrderItem[];
    createdAt: string;
  };
  
  export type OrdersResponseWrapper = {
    timestamp: string;
    status: number;
    message: string;
    data: Order[];
  };

  export type OrderResponseWrapper = {
    timestamp: string;
    status: number;
    message: string;
    data: Order;
};