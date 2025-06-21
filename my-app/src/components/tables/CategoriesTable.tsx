'use client';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useModal } from '@/hooks/useModal';
import CategoryModal from '../modals/CategoryModal';
import { Modal } from '../ui/modal';
import { Table, TableRow, TableHeader, TableCell, TableBody } from '../ui/table';
import { AppDispatch, RootState } from '@/store/store';
import Badge from '../ui/badge/Badge';
import Loader from '../ui/load/Loader';
import { useDeleteModal } from '@/context/DeleteModalContext';
import { deleteCategory } from '@/store/products/productHandler';
import Image from 'next/image';

export interface Category {
    id: number;
    name: string;
    image : string ;
    description: string;
}

export default function CategoriesTable() {
    const { openModal, closeModal, isOpen } = useModal();
    const {openModal : openDeleteModal} = useDeleteModal()
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
    const { products , categories} = useSelector((state: RootState) => state.products);

    const dispatch = useDispatch<AppDispatch>();

    const getProductCount = (categoryName: string) => {
        return products?.filter(product => product.category === categoryName).length || 0;
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        openModal();
    };

    const handleDelete = (id: number) => {
        // Here you would typically make an API call to delete the category
        console.log("Deleting category:", id);
    };

    if (!categories) return <Loader/>
    if(categories.length < 1) return <div className='flex justify-center items-center h-full text-gray-400 dark:text-gray-500'>No categories found</div>

    return (
        <>
            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1000px]">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Name
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Description
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Products Count
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start font-semibold dark:text-gray-400">
                                        <div className='flex items-center gap-2'>
                                            {category.image && (
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_SERVER}/${category.image}`}
                                                    alt={category.name}
                                                    className="w-10 h-10 rounded-md object-cover mr-2"
                                                    width={40}
                                                    height={40}
                                                />)}
                                            {category.name}
                                        </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {category.description}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {getProductCount(category.name) > 0 ? (
                                                <Badge color="success">{getProductCount(category.name)} products</Badge>
                                            ) : (
                                                <Badge color="error">No products</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-1 text-gray-500 hover:text-primary-500 transition-colors"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                                >
                                                    <TrashIcon className="w-5 h-5" onClick={()=> openDeleteModal(category.id , (id)=> dispatch(deleteCategory(id)) )}/>
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {isOpen && (
                <Modal isOpen={isOpen} onClose={closeModal} className='max-w-[600px] p-5 lg:p-10'>
                    <CategoryModal 
                        closeModal={() => {
                            closeModal();
                            setSelectedCategory(null);
                        }} 
                        selectedItem={selectedCategory}
                    />
                </Modal>
            )}
        </>
    )
} 