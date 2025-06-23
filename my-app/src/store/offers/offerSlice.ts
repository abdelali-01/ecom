import { createSlice } from "@reduxjs/toolkit";

export interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    attributes?: { [key: string]: string };
}

export interface Pack {
    id?: number;
    name: string;
    description: string;
    products: Product[];
    price: number;
    discount: number;
    images: string[];
}

export interface PromoCode {
    id?: number;
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    validFrom: string;
    validUntil: string;
    isActive: boolean;
}

interface OffersState {
    packs: Pack[] | null;
    promoCodes: PromoCode[] | null;
    loading: boolean;
    error: string | null;
}

const initialState: OffersState = {
    packs: null,
    promoCodes: null,
    loading: false,
    error: null
};

const offerSlice = createSlice({
    name: 'offers',
    initialState,
    reducers: {
        setPacks: (state, action) => {
            state.packs = action.payload;
        },
        addPack: (state, action) => {
            if (state.packs) {
                state.packs.push(action.payload);
            }
        },
        deletePack: (state, action) => {
            if (state.packs) {
                state.packs = state.packs.filter(pack => pack.id !== action.payload);
            }
        },
        setPromoCodes: (state, action) => {
            state.promoCodes = action.payload;
        },
        addPromoCode: (state, action) => {
            if (state.promoCodes) {
                state.promoCodes.push(action.payload);
            }
        },
        deletePromoCode: (state, action) => {
            if (state.promoCodes) {
                state.promoCodes = state.promoCodes.filter(code => code.id !== action.payload);
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setPacks,
    addPack,
    deletePack,
    setPromoCodes,
    addPromoCode,
    deletePromoCode,
    setLoading,
    setError
} = offerSlice.actions;

export default offerSlice.reducer; 