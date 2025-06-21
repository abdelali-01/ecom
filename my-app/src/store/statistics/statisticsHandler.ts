import axios from "axios";
import { setError } from "../error/errorSlice";
import { AppDispatch } from "../store";
import { setStatistics, setLoading } from "./statisticsSlice";

const server = process.env.NEXT_PUBLIC_SERVER;

export const fetchStatistics = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));
        const res = await axios.get(`${server}/api/statistics`, { withCredentials: true });
        
        if (res.data) {
            dispatch(setStatistics(res.data));
        }
    } catch (error) {
        console.log('Error fetching statistics:', error);
        dispatch(setError({
            message: error.response?.data?.message || error.message
        }));
    }
}; 