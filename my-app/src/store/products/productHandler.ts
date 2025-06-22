import axios, { AxiosError } from "axios";
import { setError } from "../error/errorSlice";
import { AppDispatch } from "../store";
import { setCategories, setLoading, setProducts } from "./productSlice";
import { setSuccessAlert } from "../alert/alertSlice";
import { Product } from "@/components/modals/ProductModal";


const productsApi = `${process.env.NEXT_PUBLIC_SERVER}/api/unified`;

export const fetchProducts = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));

    try {
        const res = await axios.get(productsApi, { withCredentials: true });
        if (res) {
            dispatch(setProducts(res.data.products));
            dispatch(setCategories(res.data.categories));
        }
    } catch (error) {
        console.error('error during fetching products ', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something wrong !"
        }))
    } finally { dispatch(setLoading(false)) }
};

export const addProduct = (product: Product) => async (dispatch: AppDispatch) => {
    try {
        // Create FormData for handling images and product data
        const formData = new FormData();
        
        // Add product data
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price.toString());
        formData.append('show_on_homepage' , product.show_on_homepage);
        formData.append('category_id', product.category_id.toString());
        if(product.quantity) formData.append('quantity', product.quantity.toString());
        if(product.prevPrice) formData.append('prevPrice' , product?.prevPrice.toString());
        if(product.presentation) formData.append('presentation' , product.presentation)
        
        // Add attributes if they exist
        if (product.attributes) {
            formData.append('attributes', JSON.stringify(product.attributes));
        }
        // Add presentation if present
        if (product.presentation) {
            formData.append('presentation', product.presentation);
        }

        // Add images
        if (product.images) {
            product.images.forEach((image: string) => {
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

        const res = await axios.post(productsApi, formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res) {
            dispatch(setSuccessAlert('Product has been added successfully'));
            dispatch(fetchProducts());
        }
    } catch (error) {
        console.error('error adding product', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong !"
        }))
    }
};

export const updateProduct = (productId: number, product: Product) => async (dispatch: AppDispatch) => {    
    try {
        const formData = new FormData();
        
        // Validate required fields
        if (!product.name || product.price === undefined || !product.category_id) {
            return dispatch(setError({
                message : 'Missing required product fields'
            }));
        }
        
        // Add product data
        formData.append('name', product.name);
        if(product.description) formData.append('description', product.description);
        formData.append('show_on_homepage' , product.show_on_homepage);
        formData.append('price', product.price.toString());
        formData.append('category_id', product.category_id.toString());
        formData.append('quantity', product.quantity.toString());
        if(product.prevPrice) formData.append('prevPrice' , product?.prevPrice.toString());
        if(product.presentation) formData.append('presentation' , product.presentation)

        
        // Add attributes if they exist
        if (product.attributes) {
            formData.append('attributes', JSON.stringify(product.attributes));
        }
        // Add presentation if present
        if (product.presentation) {
            formData.append('presentation', product.presentation);
        }

        // Handle both existing and new images
        if (product.images && Array.isArray(product.images)) {
            // Separate existing images (URLs) and new images (base64)
            const existingImages: string[] = [];
            
            product.images.forEach((image: string) => {
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
                    formData.append('new_images', file);
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

        const res = await axios.put(`${productsApi}/${productId}`, formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res) {
            dispatch(setSuccessAlert('Product has been updated successfully'));
            dispatch(fetchProducts());
        }
    } catch (error) {
        console.error('error updating product', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong !"
        }))
    }
};

export const deleteProduct = (productId: number) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.delete(`${productsApi}/${productId}`, { withCredentials: true });

        if (res) {
            dispatch(setSuccessAlert('Product has been deleted successfully'));
            dispatch(fetchProducts());
        }
    } catch (error) {
        console.error('error deleting product', error);
        const axiosError = error as AxiosError;
        dispatch(setError({
            message: axiosError.response?.data?.message || "Something went wrong !"
        }))
    }
};

export const addCategory = (category: FormData) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.post(`${productsApi}/categories`, category, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res) {
            dispatch(setSuccessAlert('Category has been added successfully'));
            dispatch(fetchProducts());
        }
    } catch (error) {
        console.error('error adding category', error);
        dispatch(setError({
            message: error.response?.data.message || "Something went wrong !"
        }))
    }
};

export const updateCategory = (categoryId: number, category: FormData) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.put(`${productsApi}/categories/${categoryId}`, category, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (res) {
            dispatch(setSuccessAlert('Category has been updated successfully'));
            dispatch(fetchProducts());
        }
    } catch (error) {
        console.error('error updating category', error);
        dispatch(setError({
            message: error.response?.data.message || "Something went wrong !"
        }))
    }
};

export const deleteCategory = (categoryId: number) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.delete(`${productsApi}/categories/${categoryId}`, { withCredentials: true });

        if (res) {
            dispatch(setSuccessAlert('Category has been deleted successfully'));
            dispatch(fetchProducts());
        }
    } catch (error) {
        console.error('error deleting category', error);
        dispatch(setError({
            message: error.response?.data.message || "Something went wrong !"
        }))
    }
}

