import React, { useState } from 'react'
import Button from '../ui/button/Button'
import Image from 'next/image';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import { useDispatch, useSelector } from 'react-redux';
import TextArea from '../form/input/TextArea';
import { TrashIcon } from '@heroicons/react/24/outline';
import Select from '../form/Select';
import { AppDispatch, RootState } from '@/store/store';
import { addProduct, updateProduct } from '@/store/products/productHandler';
import PresentationEditor from '../form/PresentationEditor';
import Switch from '../form/switch/Switch';

interface Attribute {
    [key: string]: number;
}

export interface Product {
    id?: number;
    name: string;
    category?: string;
    category_id: number;
    description: string;
    presentation?: string;
    price: number;
    prevPrice?: number;
    quantity: number;
    images: string[];
    show_on_homepage?: boolean;
    attributes?: {
        [key: string]: Attribute;
    };
    featured?: boolean;
    inStock?: boolean;
}

interface ProductModalProps {
    closeModal: () => void;
    selectedItem?: Product;
}

export default function ProductModal({ closeModal, selectedItem }: ProductModalProps) {
    const { categories } = useSelector((state: RootState) => state.products);
    const [product, setProduct] = useState<Product>(selectedItem || {
        name: '',
        category_id: 1,
        description: '',
        presentation: '',
        price: 0,
        prevPrice: 0,
        quantity: 0,
        images: [],
        show_on_homepage: false,
        attributes: {}
    });

    const dispatch = useDispatch<AppDispatch>()

    const [newAttribute, setNewAttribute] = useState({
        name: '',
        options: ''
    });

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
                setProduct(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...newImages]
                }));
            });
        }
    };

    const handleRemoveImage = (index: number) => {
        setProduct(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    const handleAddAttribute = () => {
        if (!newAttribute.name || !newAttribute.options) return;

        const options = newAttribute.options.split(',').reduce((acc, option) => {
            const [key, value] = option.trim().split(':');
            if (key && value) {
                acc[key] = parseInt(value);
            }
            return acc;
        }, {} as Attribute);

        setProduct(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [newAttribute.name]: options
            }
        }));

        setNewAttribute({ name: '', options: '' });
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Here you would typically make an API call to save the product
        if (selectedItem) {
            console.log('updating product', product);
            dispatch(updateProduct(selectedItem.id, product));

        } else {
            dispatch(addProduct(product));
        }
        closeModal();
    };

    return (
        <form onSubmit={handleSave}>
            <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
                {selectedItem ? 'Edit Product' : 'Create New Product'}
            </h4>

            <div className='max-h-[60vh] overflow-y-auto'>
                <div className='border border-gray-200 dark:border-white/[0.05] rounded-lg p-5 mb-5'>
                    <div className='flex flex-col gap-3'>
                        <Label className='font-semibold text-gray-400'>Product Images</Label>
                        <div className='flex flex-col gap-3'>
                            <div className='flex gap-3 max-h-[300px] p-2 overflow-x-auto'>
                                {product?.images?.map((image, index) => (
                                    <div key={index} className='relative group'>
                                        <Image
                                            src={image.startsWith('data:image')
                                                ? image
                                                : `${process.env.NEXT_PUBLIC_SERVER}/${image}`}
                                            alt={`Product image ${index + 1}`}
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
                                <label className=' min-w-[140px] md:min-w-[200px] aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors'>
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
                        <div>
                            <Label className="font-semibold text-gray-700 dark:text-gray-400">Product Name</Label>
                            <Input
                                type="text"
                                value={product.name}
                                onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full placeholder-gray-500"
                                required
                                placeholder="Enter product name"
                            />
                        </div>
                        <div>
                            <Label className="font-semibold text-gray-700 dark:text-gray-400">Category</Label>
                            <Select
                                defaultValue={selectedItem && product.category_id}
                                onChange={(value) => setProduct(prev => ({ ...prev, category_id: Number(value) }))}
                                className="w-full"
                                options={categories.map(category => ({
                                    label: category.name,
                                    value: category.id
                                }))}
                                required
                            />
                        </div>
                        <div className="md:col-span-2 flex flex-col md:flex-row gap-3 items-end">
                            <div className="flex-1">
                                <Label className="font-semibold text-gray-700 dark:text-gray-400">Price</Label>
                                <Input
                                    type="number"
                                    value={product.price}
                                    onChange={(e) => setProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    className="w-full placeholder-gray-500"
                                    required
                                    placeholder="Enter product price"
                                />
                            </div>
                            <div className="flex-1">
                                <Label className="font-semibold text-gray-700 dark:text-gray-400">Previous Price</Label>
                                <Input
                                    type="number"
                                    value={product.prevPrice}
                                    onChange={e => setProduct(prev => ({ ...prev, prevPrice: Number(e.target.value) }))}
                                    className="w-full placeholder-gray-500"
                                    placeholder="Enter previous price"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="font-semibold text-gray-700 dark:text-gray-400">Quantity</Label>
                            <Input
                                type="number"
                                value={product.quantity}
                                onChange={(e) => setProduct(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                className="w-full placeholder-gray-500"
                                min='0'
                                placeholder="Enter quantity"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <Switch
                                label="Show on Home Page"
                                defaultChecked={!!product.show_on_homepage}
                                onChange={checked => setProduct(prev => ({ ...prev, show_on_homepage: checked }))}
                                color="blue"
                            />
                            <span className="text-xs text-gray-400 ml-2">Feature this product on the landing page</span>
                        </div>
                        <div className='col-span-2'>
                            <Label className="font-semibold text-gray-700 dark:text-gray-400">Description</Label>
                            <TextArea
                                value={product.description}
                                onChange={(value) => setProduct(prev => ({ ...prev, description: value }))}
                                className="w-full p-2 border border-gray-200 dark:border-white/[0.05] rounded-lg text-gray-700 dark:text-gray-400 placeholder-gray-500"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="border border-gray-200 dark:border-white/[0.05] my-5"></div>

                    <div className="border border-gray-200 dark:border-white/[0.05] my-5"></div>
                    <div className='space-y-4 '>
                        <PresentationEditor
                            value={product.presentation || ''}
                            onChange={(value) => setProduct(prev => ({ ...prev, presentation: value }))}
                        />
                    </div>

                    <div className="border border-gray-200 dark:border-white/[0.05] my-5"></div>

                    <div className='space-y-4'>
                        <h5 className='font-semibold text-gray-800 dark:text-white'>Attributes</h5>

                        {product.attributes && Object.entries(product.attributes).map(([key, values]) => (
                            <div key={key} className='p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg'>
                                <div className='flex justify-between items-center mb-3'>
                                    <span className='font-medium text-gray-700 dark:text-gray-300 capitalize'>{key}</span>
                                    <TrashIcon className='cursor-pointer size-8 text-red-500'
                                        onClick={() => {
                                            const newAttributes = { ...product.attributes };
                                            delete newAttributes[key];
                                            setProduct(prev => ({ ...prev, attributes: newAttributes }));
                                        }}
                                    />
                                </div>
                                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                                    {Object.entries(values).map(([option, quantity]) => (
                                        <div key={option}
                                            className='flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700'>
                                            <div className='flex items-center gap-2'>
                                                <span className='w-2 h-2 rounded-full bg-primary-500'></span>
                                                <span className='text-sm font-medium text-gray-700 dark:text-gray-300 capitalize'>{option}</span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-sm text-gray-500 dark:text-gray-400'>Quantity:</span>
                                                <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>{quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className='p-4 border border-gray-200 dark:border-white/[0.05] rounded-lg'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                <div>
                                    <Label className="font-semibold text-gray-700 dark:text-gray-400">Attribute Name</Label>
                                    <Input
                                        type="text"
                                        value={newAttribute.name}
                                        onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Color, Size"
                                        className="w-full placeholder-gray-500"
                                    />
                                </div>
                                <div>
                                    <Label className="font-semibold text-gray-700 dark:text-gray-400">Options (key:value,key:value)</Label>
                                    <Input
                                        type="text"
                                        value={newAttribute.options}
                                        onChange={(e) => setNewAttribute(prev => ({ ...prev, options: e.target.value }))}
                                        placeholder="e.g., red:50,blue:30"
                                        className="w-full placeholder-gray-500"
                                    />
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={handleAddAttribute}
                                disabled={!newAttribute.name || !newAttribute.options}
                            >
                                Add Attribute
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end w-full gap-3 mt-8">
                <Button size="sm" variant="outline" onClick={closeModal}>
                    Cancel
                </Button>
                <Button size="sm">
                    {selectedItem ? 'Save Changes' : 'Create Product'}
                </Button>
            </div>
        </form>
    )
}
