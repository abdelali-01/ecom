'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import TextArea from '../form/input/TextArea';
import Image from 'next/image';
import Loader from '../ui/load/Loader';
import { fetchProducts } from '@/store/products/productHandler';
import { Pack , Product} from '@/store/offers/offerSlice';
import { addPack, updatePack } from '@/store/offers/offersHandler';
import { Product as mainProduct} from './ProductModal';

interface ProductWithImages extends Product {
    images?: string[];
}

interface PackModalProps {
    closeModal: () => void;
    selectedItem?: Pack;
}

export default function PackModal({ closeModal, selectedItem }: PackModalProps) {
    const { products } = useSelector((state: RootState) => state.products);
    const dispatch = useDispatch<AppDispatch>()
    const [pack, setPack] = useState<Pack>(selectedItem || {
        name: '',
        description: '',
        products: [],
        price: 0,
        discount: 0,
        images: []
    });

    useEffect(() => {
        const totalProductsPrice = pack.products.reduce((sum, product) => sum + Number(product.price), 0);
        if (totalProductsPrice === 0 || pack.price === 0) return;
        const discount = ((totalProductsPrice - pack.price) / totalProductsPrice) * 100;
        setPack(prev => ({...prev , discount : Math.round(discount)}));
    }, [pack.price, pack.products])

    const handleProductToggle = (product: Product) => {
        setPack(prev => {
            const isProductSelected = prev.products.some(p => p.id === product.id);
            if (isProductSelected) {
                return {
                    ...prev,
                    products: prev.products.filter(p => p.id !== product.id)
                };
            } else {
                return {
                    ...prev,
                    products: [...prev.products, {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1
                    }]
                };
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages: string[] = [];
            const processFile = (file: File) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        newImages.push(reader.result as string);
                        resolve(null);
                    };
                    reader.readAsDataURL(file);
                });
            };

            Promise.all(Array.from(files).map(processFile)).then(() => {
                setPack(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...newImages]
                }));
            });
        }
    };

    const handleRemoveImage = (index: number) => {
        setPack(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Here you would typically make an API call to save the pack
        console.log("Saving pack:", pack);
        if (selectedItem) {
            dispatch(updatePack(pack.id, pack))
        } else {
            dispatch(addPack(pack))
        }
        closeModal();
    };

    useEffect(() => {
        if (!products) dispatch(fetchProducts())
    }, [products, dispatch]);

    if (!products) return <Loader />
    return (
        <form onSubmit={handleSave}>
            <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
                {selectedItem ? 'Edit Pack' : 'Create New Pack'}
            </h4>

            <div className='max-h-[60vh] overflow-y-auto'>
                <div className='border border-gray-200 dark:border-white/[0.05] rounded-lg p-5 mb-5'>
                    <div className='flex flex-col gap-3'>
                        <Label className='font-semibold text-gray-400'>Pack Images</Label>
                        <div className='flex flex-col gap-3'>
                            <div className='flex gap-3 max-h-[300px] p-2 overflow-x-auto'>
                                {pack?.images?.map((image, index) => (
                                    <div key={index} className='relative group'>
                                        <Image
                                            src={image.startsWith('data:image')
                                                ? image
                                                : `${process.env.NEXT_PUBLIC_SERVER}/${image}`}
                                            alt={`Pack image ${index + 1}`}
                                            width={100}
                                            height={100}
                                            className="rounded-lg object-cover min-w-[140px] md:min-w-[200px] aspect-square bg-white"
                                            quality={100}
                                            unoptimized
                                        />
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                <label className='min-w-[140px] md:min-w-[200px] aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors'>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        multiple
                                        className="hidden"
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                        <div className='col-span-2'>
                            <Label className='font-semibold text-gray-400'>Pack Name</Label>
                            <Input
                                type="text"
                                value={pack.name}
                                onChange={(e) => setPack(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full"
                            />
                        </div>
                        <div className='col-span-2'>
                            <Label className='font-semibold text-gray-400'>Description</Label>
                            <TextArea
                                value={pack.description}
                                onChange={(value: string) => setPack(prev => ({ ...prev, description: value }))}
                                className="w-full"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="border border-gray-200 dark:border-white/[0.05] my-5"></div>

                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <h5 className='font-semibold text-gray-800 dark:text-white'>Products</h5>
                            <span className='text-sm text-gray-500 dark:text-gray-400'>
                                {pack.products.length} products selected
                            </span>
                        </div>

                        <div className='flex items-center gap-4 max-h-[300px] overflow-x-auto p-2'>
                            {products?.map((product : ProductWithImages | mainProduct) => {
                                const isSelected = pack.products.some(p => p.id === product.id);
                                return (
                                    <div
                                        key={product.id}
                                        className={`relative min-w-[160px] group cursor-pointer rounded-lg border transition-all duration-200 ${isSelected
                                                ? 'border-success-500 bg-success-50 dark:bg-success-500/10'
                                                : 'border-gray-200 dark:border-white/[0.05] hover:border-primary-500'
                                            }`}
                                        onClick={() => handleProductToggle(product)}
                                    >
                                        <div className='aspect-square relative'>
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_SERVER}/${product.images?.[0]}` || '/placeholder.png'}
                                                alt={product.name}
                                                fill
                                                className='object-cover rounded-t-lg'
                                            />
                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center ${isSelected ? 'bg-success-500/40' : 'bg-black/40'
                                                }`}>
                                                <span className='text-white text-sm font-medium'>
                                                    {isSelected ? 'Remove' : 'Add'}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <div className='absolute top-2 left-2 bg-success-500 text-white px-2 py-1 rounded-full text-xs font-medium'>
                                                    Selected
                                                </div>
                                            )}
                                        </div>
                                        <div className='p-3'>
                                            <div className='font-medium text-gray-800 dark:text-white truncate'>
                                                {product.name}
                                            </div>
                                            <div className='text-sm text-gray-500 dark:text-gray-400'>
                                                {product.price} DA
                                            </div>
                                        </div>
                                        <div className='absolute top-2 right-2'>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                                    ? 'border-success-500 bg-success-500'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border border-gray-200 dark:border-white/[0.05] my-5"></div>

                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                            <div>
                                <Label className='font-semibold text-gray-400'>Pack Price</Label>
                                <Input
                                    type="number"
                                    value={pack.price}
                                    onChange={(e) => setPack(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <Label className='font-semibold text-gray-400'>Total Products Price</Label>
                                <div className='p-3 bg-gray-50 dark:bg-white/[0.02] rounded-lg'>
                                    <div className='text-lg font-semibold text-gray-800 dark:text-white'>
                                        {pack.products.reduce((sum, product) => sum + Number(product.price), 0)} DA
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <div className='text-sm text-gray-500 dark:text-gray-400'>Discount</div>
                                    <div className='text-lg font-semibold text-gray-800 dark:text-white'>
                                        {pack.discount}%
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <div className='text-sm text-gray-500 dark:text-gray-400'>Your Client Save</div>
                                    <div className='text-lg font-semibold text-success-500'>
                                        {(() => {
                                            const totalProductsPrice = pack.products.reduce((sum, product) => sum + Number(product.price), 0);
                                            return `${totalProductsPrice - pack.price} DA`;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end w-full gap-3 mt-8">
                <Button size="sm" variant="outline" onClick={closeModal}>
                    Cancel
                </Button>
                <Button size="sm">
                    {selectedItem ? 'Save Changes' : 'Create Pack'}
                </Button>
            </div>
        </form>
    );
} 