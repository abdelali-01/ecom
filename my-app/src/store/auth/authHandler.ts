import axios from 'axios';
import { setIsFeching, setUser } from './authSlice';
import { AppDispatch } from '../store';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { setError } from '../error/errorSlice';
import { User } from '@/components/auth/SignUpForm';
import { setSuccessAlert } from '../alert/alertSlice';
import { fetchAccounts } from '../accounts/accountHandler';

const server = process.env.NEXT_PUBLIC_SERVER;

// Global axios configuration
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const registerUser = (user: User, clearFrom: () => void) => async (dispatch: AppDispatch) => {
    dispatch(setIsFeching(true));
    try {
        const res = await axios.post(`${server}/api/auth/register`, user, { withCredentials: true });
        if (res) {
            dispatch(setSuccessAlert('Your admin is registred successfully'))
            clearFrom();

            setTimeout(() => {
                dispatch(setSuccessAlert(null)); // Clear alert after 3 seconds
            }, 3000);
        }

    } catch (error: any) {
        console.log('Error during registring the user ', error);
        const errorDetails = {
            status: error.response?.data.status || 400,
            message: error.response?.data.message || error.message
        }
        dispatch(setError(errorDetails));
    } finally { dispatch(setIsFeching(false)) }
}

export const loggedIn = (user: { email: string, password: string }, router: AppRouterInstance) => async (dispatch: AppDispatch) => {
    dispatch(setIsFeching(true));
    try {
        const res = await axios.post(`${server}/api/auth/login`, user, { withCredentials: true });
        const userLogged = res.data?.user;
        if (userLogged) {
            dispatch(setUser(userLogged));
            router.push('/admin')
        }
    } catch (error: any) {
        console.log('error during the login', error);
        const errorDetails = {
            status: error.response?.data.status || 400,
            message: error.response?.data.message || error.message
        }
        dispatch(setError(errorDetails));
    } finally {
        dispatch(setIsFeching(false));
    }
}

export const checkIfLoggedIn = (pathname: string, router: AppRouterInstance) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.get(`${server}/api/auth/me`, { withCredentials: true });
        const userLogged = res.data?.user;
        if (userLogged) {
            dispatch(setUser(userLogged));
            // Only redirect to admin if currently on signin page
            if (pathname === '/signin') {
                router.push('/admin');
            }
        } else {
            // If not logged in and on a protected page, redirect to signin
            if (pathname.startsWith('/admin')) {
                router.push('/signin');
            }
        }
    } catch (error: any) {
        console.log('error during check if logged in', error);
        // If auth check fails and on a protected page, redirect to signin
        if (pathname.startsWith('/admin')) {
            router.push('/signin');
        }
    }
}

export const getUser = () => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.get(`${server}/api/auth/me`, { withCredentials: true });

        if (res)
            dispatch(setUser(res.data.user))
    } catch (error: any) {
        console.log('error during getting the user', error);
        dispatch(setError({
            message: error.response?.data.message || error.message
        }))
    }
}

export const updateAccount = (userInfo: User) => async (dispatch: AppDispatch) => {
    console.log(userInfo);
    
    try {
        await axios.put(`${server}/api/auth/${userInfo.id}`, userInfo, { withCredentials: true });

        dispatch(setSuccessAlert('Your Account has been updated successfully'));
        dispatch(getUser());
        dispatch(fetchAccounts());

    

    } catch (error: any) {
        console.log('error during updating the account', error);
        dispatch(setError({
            message: error.response?.data.message || error.message
        }))
    }
}

export const loggedOut = (router: AppRouterInstance) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.post(`${server}/api/auth/logout`, {}, { withCredentials: true });

        if (res.statusText === 'OK') {
            dispatch(setUser(null)); // Clear user state
            router.push('/signin')
        }
    } catch (error: any) {
        console.log('error during the login', error);
        const errorDetails = {
            status: error.response?.data.status,
            message: error.response?.data.message || error.message
        }
        dispatch(setError(errorDetails));
    }
}


export const SendEmailReset = (email: string, setState: () => void) => async (dispatch: AppDispatch) => {
    dispatch(setIsFeching(true))
    try {
        await axios.post(`${server}/api/auth/reset-password`, { email }, { withCredentials: true });
        setState();
    } catch (error: any) {
        dispatch(setError({
            message: error.response?.data.message || error.message
        }))
    } finally {
        dispatch(setIsFeching(false))
    }
}

export const sendPasswordResset = (password: string, token: string, router: AppRouterInstance) => async (dispatch: AppDispatch) => {
    try {
        await axios.post(`${server}/api/auth/reset-password/${token}`, { password }, { withCredentials: true });

        dispatch(setSuccessAlert('Your password has been updated'));
        router.push('/signin');

    
    } catch (error: any) {
        dispatch(setError({
            message: error.response?.data.message || error.message
        }))
    }
}