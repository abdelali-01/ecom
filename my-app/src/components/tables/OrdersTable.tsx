'use client';
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import { formatDateToISOWithTime } from '@/utils';
import Badge from '../ui/badge/Badge';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import Loader from '../ui/load/Loader';
import { useModal } from '@/hooks/useModal';
import { Modal } from '../ui/modal';
import OrderModal from '../modals/OrderModal';
import Image from 'next/image';
import { fetchProducts } from '@/store/products/productHandler';
import { fetchOrders } from '@/store/orders/orderHandler';
import ChartTab from '../common/ChartTab';
import { Order } from '@/store/orders/orderSlice';
import { parseISO, isSameDay, isSameWeek, isSameMonth } from 'date-fns';


export default function OrdersTable() {
    const dispatch = useDispatch<AppDispatch>()
    const orders = useSelector((state: RootState) => state.orders.orders) as Order[] | null;
    const { products } = useSelector((state: RootState) => state.products);

    const { openModal, closeModal, isOpen, selectedItem } = useModal();

    useEffect(() => {
        dispatch(fetchOrders());
        dispatch(fetchProducts())
    }, [dispatch])

    const [selectedFilter, setSelectedFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('daily');


    if (!orders || !products) return <Loader />;
    else if (orders.length === 0) return <div className='text-center text-gray-500 dark:text-gray-400'>No orders found</div>;
    // Filtering logic
    const now = new Date();
    const filteredOrders = orders.filter(order => {
        if (!order.created_at) return false;
        const createdRaw = order.created_at ?? '';
        const created = createdRaw ? parseISO(createdRaw) : new Date(0);
        if (selectedFilter === 'daily') {
            return isSameDay(created, now);
        } else if (selectedFilter === 'weekly') {
            return isSameWeek(created, now, { weekStartsOn: 1 });
        } else if (selectedFilter === 'monthly') {
            return isSameMonth(created, now);
        }
        return true; // 'all'
    });

    // Sorting logic by order_status
    const statusOrder = {
        pending: 1,
        confirmed: 2,
        completed: 3,
        canceled: 4
    };
    const sortedOrders = filteredOrders.slice().sort((a, b) => {
        const aStatus = statusOrder[a.order_status as keyof typeof statusOrder] || 99;
        const bStatus = statusOrder[b.order_status as keyof typeof statusOrder] || 99;
        if (aStatus !== bStatus) return aStatus - bStatus;
        // fallback: newest first
        const aDate = a.created_at ? new Date(a.created_at) : new Date(0);
        const bDate = b.created_at ? new Date(b.created_at) : new Date(0);
        return bDate.getTime() - aDate.getTime();
    });

    return (
        <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1000px]">
                <div className='mb-4 flex justify-between items-center'>
                    <div className="flex items-center gap-2">
                        <span className="inline-block bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            {sortedOrders.length}
                        </span>
                        <span className="text-gray-700 dark:text-gray-200 text-sm font-semibold">Order{sortedOrders.length !== 1 ? 's' : ''} found</span>
                    </div>
                    <ChartTab selected={selectedFilter} onSelect={setSelectedFilter} />
                </div>
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
                                    Client
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Wilaya
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Date
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Total Price
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Order Status
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {sortedOrders.map(order => (
                                <TableRow key={order.id}
                                    className='cursor-pointer hover:bg-gray-200 dark:hover:bg-white/[0.05] transition-all duration-200'
                                    onClick={() => openModal(order)}
                                >
                                    <TableCell className="px-4 py-3 text-gray-500 text-start font-semibold dark:text-gray-400">
                                        <div className='flex flex-col gap-2'>
                                            {order.is_pack  ? <div className='flex items-center gap-3'>
                                                {order.pack.image && <Image
                                                    src={`${process.env.NEXT_PUBLIC_SERVER}/${order.pack.image}`}
                                                    alt={order.pack.name}
                                                    width={60}
                                                    height={60}
                                                    className='object-cover rounded-md'
                                                />}
                                                {order.pack.name}
                                            </div> :
                                                order.products.map(product => (
                                                    <div key={product.id + product.name} className='flex items-center gap-3'>
                                                        <Image
                                                            src={`${process.env.NEXT_PUBLIC_SERVER}/${product.image}`}
                                                            alt={product.name}
                                                            width={60}
                                                            height={60}
                                                            className='object-cover rounded-md'
                                                        />
                                                        {product.name}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start font-semibold dark:text-gray-400">
                                        <div className="flex flex-col">
                                            {order.name}
                                            <span className="text-theme-sm">{order.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {order.wilaya}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {formatDateToISOWithTime(order.created_at || '')}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {order.total} DA
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <Badge
                                            color={
                                                order.order_status === "pending" ? "primary" :
                                                    order.order_status === "confirmed" ? "info" :
                                                        order.order_status === "completed" ? "success" :
                                                            order.order_status === "canceled" ? "error" : "default"
                                            }
                                            className="capitalize"
                                        >
                                            {order.order_status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {isOpen && selectedItem && (
                <Modal onClose={closeModal} isOpen={isOpen} className='max-w-[90%] p-5 lg:p-10 max-h-[90vh] overflow-hidden'>
                    <OrderModal closeModal={closeModal} order={selectedItem} />
                </Modal>
            )}
        </div>
    )
}
