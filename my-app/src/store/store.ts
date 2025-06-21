import { configureStore } from "@reduxjs/toolkit"
import authReducer from './auth/authSlice'
import errorReducer from './error/errorSlice'
import alertReducer from './alert/alertSlice';
import accountReducer from './accounts/accountsSlice';
import calendarReducer from './calendar/calendarSlice';
import ordersReducer from './orders/orderSlice';
import productReducer from './products/productSlice';
import offersReducer from './offers/offerSlice';
import wilayasReducer from './wilayas/wilayaSlice';
import cartReducer from './cart/cartSlice';
import statisticsReducer from './statistics/statisticsSlice';

export const store = configureStore({
    reducer : {
        auth : authReducer ,
        error : errorReducer ,
        alert : alertReducer ,
        accounts : accountReducer,
        calendar : calendarReducer ,
        orders : ordersReducer,
        products : productReducer,
        offers : offersReducer ,
        wilayas : wilayasReducer,
        cart: cartReducer,
        statistics: statisticsReducer,
    }
});


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch ;