import axios, { AxiosError } from "axios";
import { setError } from "../error/errorSlice";
import { AppDispatch } from "../store";
import { setOrders, setLoading } from "./orderSlice";
import { setSuccessAlert } from "../alert/alertSlice";
import { Order } from "./orderSlice";

interface ErrorResponseData {
  message?: string;
}

const ordersApi = `${process.env.NEXT_PUBLIC_SERVER}/api/orders`;

// Fetch all orders
export const fetchOrders = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));

    try {
        const res = await axios.get(ordersApi, { withCredentials: true });
        if (res) {
            dispatch(setOrders(res.data));
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: (axiosError.response?.data as ErrorResponseData)?.message || "Something went wrong!"
        }));
    } finally {
        dispatch(setLoading(false));
    }
};

// Create new order
export const createOrder = (order: Order) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.post(ordersApi, order, { withCredentials: true });

        if (res) {
            dispatch(setSuccessAlert('Order has been placed successfully'));
        }
    } catch (error) {
        console.error('Error creating order:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: (axiosError.response?.data as ErrorResponseData)?.message || "Something went wrong!"
        }));
    }
};

// Update order
export const updateOrder = (orderId: number, updates: Partial<Order>) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.patch(`${ordersApi}/${orderId}`, updates, { withCredentials: true });

        if (res) {
            dispatch(setSuccessAlert('Order has been updated successfully'));
            dispatch(fetchOrders());
        }
    } catch (error) {
        console.error('Error updating order:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: (axiosError.response?.data as ErrorResponseData)?.message || "Something went wrong!"
        }));
    }
};

// Delete order
export const deleteOrder = (orderId: number) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.delete(`${ordersApi}/${orderId}`, { withCredentials: true });

        if (res) {
            dispatch(setSuccessAlert('Order has been deleted successfully'));
            dispatch(fetchOrders());
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: (axiosError.response?.data as ErrorResponseData)?.message || "Something went wrong!"
        }));
    }
};
