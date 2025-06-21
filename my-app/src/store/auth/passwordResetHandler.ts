import axios from "axios";
import { setError } from "../error/errorSlice";
import { AppDispatch } from "../store";
import { setSuccessAlert } from "../alert/alertSlice";

const server = process.env.NEXT_PUBLIC_SERVER;

// Request password reset
export const requestPasswordReset = (email: string) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.post(`${server}/api/auth/forgot-password`, { email });
        
        if (res.data) {
            dispatch(setSuccessAlert('Password reset link has been sent to your email.'));
            setTimeout(() => {
                dispatch(setSuccessAlert(null));
            }, 5000);
        }
        
        return { success: true };
    } catch (error) {
        console.log('Error requesting password reset:', error);
        dispatch(setError({
            message: error.response?.data?.message || error.message
        }));
        return { success: false };
    }
};

// Verify reset token
export const verifyResetToken = (token: string) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.get(`${server}/api/auth/reset-password/${token}`);
        
        if (res.data) {
            return { success: true, email: res.data.email };
        }
        
        return { success: false };
    } catch (error) {
        console.log('Error verifying reset token:', error);
        dispatch(setError({
            message: error.response?.data?.message || 'Invalid or expired reset token'
        }));
        return { success: false };
    }
};

// Reset password with token
export const resetPassword = (token: string, password: string) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.post(`${server}/api/auth/reset-password/${token}`, { password });
        
        if (res.data) {
            dispatch(setSuccessAlert('Password reset successfully. You can now log in with your new password.'));
            setTimeout(() => {
                dispatch(setSuccessAlert(null));
            }, 5000);
        }
        
        return { success: true };
    } catch (error) {
        console.log('Error resetting password:', error);
        dispatch(setError({
            message: error.response?.data?.message || error.message
        }));
        return { success: false };
    }
}; 