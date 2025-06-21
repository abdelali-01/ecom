import { createSlice } from "@reduxjs/toolkit";

export interface Wilaya {
    id: number;
    name: string;
    cities: string[];
    shipping_prices: {
        home: number;
        desk: number;
    };
    is_active: boolean;
}

const wilayaSlice = createSlice({
    name: 'wilayas',
    initialState: {
        wilayas: null as Wilaya[] | null,
        loading: false as boolean,
        error: null
    },
    reducers: {
        setWilayas: (state, action) => {
            state.wilayas = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const { setWilayas, setLoading, setError } = wilayaSlice.actions;
export default wilayaSlice.reducer;
