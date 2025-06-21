import axios, { AxiosError } from "axios";
import { setError } from "../error/errorSlice";
import { AppDispatch } from "../store";
import { setPacks, setPromoCodes, setLoading } from "./offerSlice";
import { setSuccessAlert } from "../alert/alertSlice";
import { Pack, PromoCode } from "./offerSlice";

const offersApi = `${process.env.NEXT_PUBLIC_SERVER}/api/offers`;

// Pack Handlers
export const fetchPacks = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));

    try {
        const res = await axios.get(`${offersApi}/packs`, { withCredentials: true });
        if (res) {
            dispatch(setPacks(res.data));
        }
    } catch (error) {
        console.error('Error fetching packs:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong!"
        }));
    } finally {
        dispatch(setLoading(false));
    }
};

export const addPack = (pack: Pack) => async (dispatch: AppDispatch) => {
    try {
        const formData = new FormData();

        // Add pack data
        formData.append('name', pack.name);
        formData.append('description', pack.description);
        formData.append('price', pack.price.toString());
        formData.append('discount', pack.discount.toString());
        formData.append('products', JSON.stringify(pack.products));

        // Add images
        if (pack.images) {
            pack.images.forEach((image: string) => {
                // If it's a base64 image, convert it to a file
                if (image.startsWith('data:image')) {
                    const byteString = atob(image.split(',')[1]);
                    const mimeString = image.split(',')[0].split(':')[1].split(';')[0];
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);

                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }

                    const blob = new Blob([ab], { type: mimeString });
                    const file = new File([blob], `image-${Date.now()}.${mimeString.split('/')[1]}`, { type: mimeString });
                    formData.append('images', file);
                }
            });
        }

        const res = await axios.post(`${offersApi}/packs`, formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res) {
            dispatch(setSuccessAlert('Pack has been added successfully'));
            dispatch(fetchPacks());
        }
    } catch (error) {
        console.error('Error adding pack:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong!"
        }));
    }
};

export const updatePack = (packId: number, pack: Pack) => async (dispatch: AppDispatch) => {
    try {
        const formData = new FormData();

        // Add pack data
        formData.append('name', pack.name);
        formData.append('description', pack.description);
        formData.append('price', pack.price.toString());
        formData.append('discount', pack.discount.toString());
        formData.append('products', JSON.stringify(pack.products));

        // Handle both existing and new images
        if (pack.images && Array.isArray(pack.images)) {
            // Separate existing images (URLs) and new images (base64)
            const existingImages: string[] = [];

            pack.images.forEach((image: string) => {
                if (image.startsWith('data:image')) {
                    // Handle new base64 images
                    const byteString = atob(image.split(',')[1]);
                    const mimeString = image.split(',')[0].split(':')[1].split(';')[0];
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);

                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }

                    const blob = new Blob([ab], { type: mimeString });
                    const file = new File([blob], `image-${Date.now()}.${mimeString.split('/')[1]}`, { type: mimeString });
                    formData.append('images', file);
                } else {
                    // Collect existing image URLs
                    existingImages.push(image);
                }
            });

            // Add existing images as JSON array
            if (existingImages.length > 0) {
                formData.append('existing_images', JSON.stringify(existingImages));
            }
        }

        const res = await axios.put(`${offersApi}/packs/${packId}`, formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res) {
            dispatch(setSuccessAlert('Pack has been updated successfully'));
            dispatch(fetchPacks());
        }
    } catch (error) {
        console.error('Error updating pack:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong!"
        }));
    }
};

export const deletePack = (packId: number) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.delete(`${offersApi}/packs/${packId}`, { withCredentials: true });

        if (res) {
            dispatch(setSuccessAlert('Pack has been deleted successfully'));
            dispatch(fetchPacks());
        }
    } catch (error) {
        console.error('Error deleting pack:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong!"
        }));
    }
};

// Promo Code Handlers
export const fetchPromoCodes = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));

    try {
        const res = await axios.get(`${offersApi}/promo-codes`, { withCredentials: true });
        if (res) {
            dispatch(setPromoCodes(res.data));
        }
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong!"
        }));
    } finally {
        dispatch(setLoading(false));
    }
};

export const addPromoCode = (promoCode: PromoCode) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.post(`${offersApi}/promo-codes`, promoCode, { withCredentials: true });

        if (res) {
            dispatch(setSuccessAlert('Promo code has been added successfully'));
            dispatch(fetchPromoCodes());
        }
    } catch (error) {
        console.error('Error adding promo code:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong!"
        }));
    }
};

export const updatePromoCode = (promoCodeId: number, promoCode: PromoCode) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.put(`${offersApi}/promo-codes/${promoCodeId}`, promoCode, { withCredentials: true });

        if (res) {
            dispatch(setSuccessAlert('Promo code has been updated successfully'));
            dispatch(fetchPromoCodes());
        }
    } catch (error) {
        console.error('Error updating promo code:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong!"
        }));
    }
};

export const deletePromoCode = (promoCodeId: number) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.delete(`${offersApi}/promo-codes/${promoCodeId}`, { withCredentials: true });

        if (res) {
            dispatch(setSuccessAlert('Promo code has been deleted successfully'));
            dispatch(fetchPromoCodes());
        }
    } catch (error) {
        console.error('Error deleting promo code:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong!"
        }));
    }
};

export const checkCode = (promoCode: string) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));

    try {
        const res = await axios.get(`${offersApi}/check/${promoCode}`, { withCredentials: true });
        console.log(res);
        if (res.data.status == 200) {
            dispatch(setSuccessAlert(`Congrats , You have ${res.data.discount}${res.data.type === "fixed" ? 'DA' : '%'} discount `))
            return res.data
        }
    } catch (error) {
        console.error('Error checking promo code:', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong!"
        }));
    } finally {
        dispatch(setLoading(false))
    }
} 
