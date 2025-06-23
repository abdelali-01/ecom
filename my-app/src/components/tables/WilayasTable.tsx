'use client';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { Table, TableRow, TableHeader, TableCell, TableBody } from '../ui/table';
import { PencilIcon } from '@heroicons/react/24/outline';
import Badge from '../ui/badge/Badge';
import Loader from '../ui/load/Loader';
import { fetchWilayas } from '@/store/wilayas/wilayaHandler';
import { useModal } from '@/hooks/useModal';
import { Modal } from '../ui/modal';
import WilayaModal from '../modals/WilayaModal';
import { Wilaya } from '@/store/wilayas/wilayaSlice';

export default function WilayasTable() {
    const dispatch = useDispatch<AppDispatch>();
    const { wilayas, loading } = useSelector((state: RootState) => state.wilayas);
    const { isOpen, openModal, closeModal, selectedItem } = useModal();

    useEffect(() => {
        dispatch(fetchWilayas());
    }, [dispatch]);



    if (loading) return <Loader />;
    if (!wilayas || wilayas.length < 1) return <div className='flex justify-center items-center h-full text-gray-400 dark:text-gray-500'>No wilayas found</div>;

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
                                    N°
                                </TableCell>
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
                                    Home Delivery
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Desk Delivery
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Status
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
                            {wilayas.map((wilaya: Wilaya , index : number) => {
                                const prices =typeof wilaya.shipping_prices === 'string' ?  JSON.parse(wilaya.shipping_prices) : wilaya.shipping_prices;
                            return (
                                    <TableRow key={wilaya.id} className="hover:bg-gray-200 dark:hover:bg-white/[0.05] transition-all duration-200">

                                        <TableCell className="px-4 py-3 text-gray-500 text-start font-semibold dark:text-gray-400">
                                            {index+1}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start font-semibold dark:text-gray-400">
                                            {wilaya.name}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {prices?.home || 0} DA
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {prices?.desk || 0} DA
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            <Badge color={wilaya.is_active ? "success" : "error"}>
                                                {wilaya.is_active ? "Available" : "Not Available"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            <button
                                                onClick={() => openModal(wilaya)}
                                                className="p-1 text-gray-500 hover:text-primary-500 transition-colors"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {isOpen && selectedItem && (
                <Modal isOpen={isOpen} onClose={closeModal} className='max-w-[800px] p-5 lg:p-10'>
                    <WilayaModal closeModal={closeModal} selectedItem={selectedItem} />
                </Modal>
            )}
    </div>
    );
}
