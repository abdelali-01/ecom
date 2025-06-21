import { createSlice } from "@reduxjs/toolkit";

interface PopularProduct {
    id: number;
    name: string;
    price: number;
    image: string | null;
    total_sold: number;
}

interface MonthlySalesData {
    month: string;
    orders: number;
    revenue: number;
}

interface RecentOrder {
    id: number;
    name: string;
    phone: string;
    status: string;
    date: string;
    is_pack: boolean;
}

interface OrderStatusDistribution {
    pending?: number;
    confirmed?: number;
    completed?: number;
    canceled?: number;
}

interface StatisticsState {
    monthly_income: number;
    monthly_orders: number;
    popular_products: PopularProduct[];
    monthly_sales_chart: MonthlySalesData[];
    total_products: number;
    total_categories: number;
    pending_orders: number;
    total_orders: number;
    order_status_distribution: OrderStatusDistribution;
    recent_orders: RecentOrder[];
    loading: boolean;
    error: string | null;
}

const initialState: StatisticsState = {
    monthly_income: 0,
    monthly_orders: 0,
    popular_products: [],
    monthly_sales_chart: [],
    total_products: 0,
    total_categories: 0,
    pending_orders: 0,
    total_orders: 0,
    order_status_distribution: {},
    recent_orders: [],
    loading: false,
    error: null
};

const statisticsSlice = createSlice({
    name: 'statistics',
    initialState,
    reducers: {
        setStatistics: (state, action) => {
            return { ...state, ...action.payload, loading: false, error: null };
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearStatistics: (state) => {
            return initialState;
        }
    }
});

export const { setStatistics, setLoading, setError, clearStatistics } = statisticsSlice.actions;
export default statisticsSlice.reducer; 