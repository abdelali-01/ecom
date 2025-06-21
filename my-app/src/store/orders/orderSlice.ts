import { createSlice } from "@reduxjs/toolkit";

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'canceled';

export interface OrderProduct {
    productId: number;
    quantity: number;
    attributes?: { [key: string]: string };
    name : string;
    price : number ;
    id : number ;
    image : string
}

export interface Order {
    id?: number;
    name: string;
    phone: string;
    wilaya: string;
    city: string;
    address?: string;
    remarks?: string;
    delivery_type: "home" | "desk";
    promoCode?: string;
    discountValue?: number;
    products: OrderProduct[];
    order_status?: OrderStatus;
    created_at?: string;
    total: number;
}

interface OrderState {
    orders: Order[] | null;
    loading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    orders: null,
    loading: false,
    error: null
};

const orderSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        setOrders(state, action) {
            state.orders = action.payload;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        }
    },
});

export const { setOrders, setLoading, setError } = orderSlice.actions;

export default orderSlice.reducer;