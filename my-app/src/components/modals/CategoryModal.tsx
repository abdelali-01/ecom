import React, { useState } from 'react'
import Button from '../ui/button/Button'
import Input from '../form/input/InputField';
import Label from '../form/Label';
import { useDispatch } from 'react-redux';
import TextArea from '../form/input/TextArea';
import { addCategory, updateCategory } from '@/store/products/productHandler';
import { AppDispatch } from '@/store/store';

interface Category {
    id?: number;
    name: string;
    description: string;
    image?: string;
}

interface CategoryModalProps {
    closeModal: () => void;
    selectedItem?: Category;
}

export default function CategoryModal({ closeModal, selectedItem }: CategoryModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [category, setCategory] = useState<Category>(selectedItem || {
        name: '',
        description: '',
        image: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(selectedItem?.image ? `${process.env.NEXT_PUBLIC_SERVER}/${selectedItem.image}` : null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', category.name);
        formData.append('description', category.description);
        if (imageFile) {
            formData.append('image', imageFile);
        }
        if (selectedItem) {
            dispatch(updateCategory(selectedItem.id, formData));
        } else {
            dispatch(addCategory(formData));
        }
        closeModal();
    };

    return (
        <form onSubmit={handleSave}>
            <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
                {selectedItem ? 'Edit Category' : 'Create New Category'}
            </h4>

            <div className='space-y-4'>
                <div>
                    <Label className='font-semibold text-gray-400'>Category Name</Label>
                    <Input
                        type="text"
                        value={category.name}
                        onChange={(e) => setCategory(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full"
                        placeholder="Enter category name"
                        required
                    />
                </div>
                <div>
                    <Label className='font-semibold text-gray-400'>Description</Label>
                    <TextArea
                        value={category.description}
                        onChange={(value) => setCategory(prev => ({ ...prev, description: value }))}
                        className="w-full p-2 border border-gray-200 dark:border-white/[0.05] rounded-lg"
                        rows={3}
                        placeholder="Enter category description"
                    />
                </div>
                <div>
                    <Label className='font-semibold text-gray-400'>Category Image</Label>
                    <div className="flex gap-3">
                        {preview && (
                            <div className="relative group">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="rounded-lg object-cover min-w-[140px] md:min-w-[200px] aspect-square bg-white"
                                    style={{ width: 140, height: 140 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageFile(null);
                                        setPreview(null);
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {!preview && (
                            <label className="min-w-[140px] md:min-w-[200px] aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </label>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end w-full gap-3 mt-8">
                <Button size="sm" variant="outline" onClick={closeModal} type="button">
                    Cancel
                </Button>
                <Button size="sm" type="submit">
                    {selectedItem ? 'Save Changes' : 'Create Category'}
                </Button>
            </div>
        </form>
    )
} 