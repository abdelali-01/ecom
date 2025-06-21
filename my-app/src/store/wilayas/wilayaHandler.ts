import axios, { AxiosError } from "axios";
import { setError } from "../error/errorSlice";
import { AppDispatch } from "../store";
import { setWilayas, setLoading } from "./wilayaSlice";
import { setSuccessAlert } from "../alert/alertSlice";
import { Wilaya } from "./wilayaSlice";

const wilayasApi = `${process.env.NEXT_PUBLIC_SERVER}/api/wilayas`;

export const fetchWilayas = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));

    try {
        const res = await axios.get(wilayasApi, { withCredentials: true });
        if (res) {
            dispatch(setWilayas(res.data));
        }
    } catch (error) {
        console.error('error during fetching wilayas ', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something wrong !"
        }))
    } finally { dispatch(setLoading(false)) }
};

export const updateWilaya = (wilayaId: number, wilaya: Partial<Wilaya>) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.put(`${wilayasApi}/${wilayaId}`, wilaya, { withCredentials: true });

        if (res) {
            dispatch(setSuccessAlert('Wilaya has been updated successfully'));
            dispatch(fetchWilayas());
        }
    } catch (error) {
        console.error('error updating wilaya', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong !"
        }))
    }
};
