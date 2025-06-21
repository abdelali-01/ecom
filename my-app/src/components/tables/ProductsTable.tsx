'use client';
import React, { useEffect } from 'react'
import { Table, TableRow, TableHeader, TableCell, TableBody } from '../ui/table'
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import Loader from '../ui/load/Loader';
import Image from 'next/image';
import Badge from '../ui/badge/Badge';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useModal } from '@/hooks/useModal';
import { useDeleteModal } from '@/context/DeleteModalContext';
import { Modal } from '../ui/modal';
import ProductModal from '../modals/ProductModal';
import { deleteProduct, fetchProducts } from '@/store/products/productHandler';
import { Product } from '@/components/modals/ProductModal';

export default function ProductsTable() {
    const dispatch= useDispatch<AppDispatch>();
    const products = useSelector((state: RootState) => state.products.products) as Product[] | null;
    const { isOpen, openModal, closeModal, selectedItem } = useModal();
    const { openModal: openDeleteModal } = useDeleteModal();

    useEffect(()=>{
        dispatch(fetchProducts());
    },[dispatch])

    if (!products) return <Loader />
    else if (products.length === 0) return <div className='flex justify-center items-center h-full text-gray-400 dark:text-gray-500'>No products found</div>
    return (
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
                                    Product
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Category
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Quantity In Stock
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Price
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
                            {products.map(product => (
                                <TableRow key={product.id}
                                    className='cursor-pointer hover:bg-gray-200 dark:hover:bg-white/[0.05] transition-all duration-200'
                                onClick={() => openModal(product)}
                                >
                                    <TableCell className="px-4 py-3 text-gray-500 text-start font-semibold dark:text-gray-400">
                                        <div className='flex items-center gap-2'>
                                            {product.images && product.images[0] ? (
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_SERVER}/${product.images[0]}`}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded-md object-cover mr-2"
                                                    width={40}
                                                    height={40}
                                                    quality={100}
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-md bg-gray-200 mr-2 flex items-center justify-center text-xs text-gray-400">No Image</div>
                                            )}
                                            {product.name ?? '—'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start font-semibold dark:text-gray-400">
                                        {product.category ?? '—'}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {typeof product.quantity === 'number' && product.quantity > 0 ? product.quantity : <Badge color='error'>Out of Stock</Badge>}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {product.price} DA
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <TrashIcon 
                                            className="cursor-pointer size-6 text-red-500" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteModal(product.id, (id) => dispatch(deleteProduct(Number(id))));
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {isOpen && selectedItem && (
                <Modal onClose={closeModal} isOpen={isOpen} className='w-[95%] md:w-[80%] p-5 lg:p-10'>
                    <ProductModal closeModal={closeModal} selectedItem={selectedItem}/>
                </Modal>
            )}

            
        </div>
    )
}
