'use client';
import { AppDispatch, RootState } from '@/store/store';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table'
import { useEffect, useState } from 'react';
import { deleteAccounts, fetchAccounts } from '@/store/accounts/accountHandler';
import { useDispatch, useSelector } from 'react-redux';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useModal } from '@/hooks/useModal';
import { Modal } from '../ui/modal';
import AccountModal from '../example/ModalExample/AccountModal';
import { useSearch } from '@/context/SearchContext';
import { filterItems } from '@/utils';
import { useDeleteModal } from '@/context/DeleteModalContext';
import Loader from '../ui/load/Loader';

export default function AccountsTable() {
    const dispatch = useDispatch<AppDispatch>();
    const { accounts } = useSelector((state: RootState) => state.accounts);
    const {user} = useSelector((state: RootState)=> state.auth);


    const { isOpen, openModal, closeModal, selectedItem } = useModal();
    const {openModal : openDeleteModal} = useDeleteModal();

    useEffect(() => {
        dispatch(fetchAccounts())
    }, [dispatch]);

    if(!accounts) return <Loader/>
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
                                    Userame
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Phone
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Email
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Role
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
                            {accounts.map(account => (
                                <TableRow key={account.id}
                                >
                                    <TableCell className="px-4 py-3 text-gray-500 text-start font-semibold dark:text-gray-400">
                                        {account.username}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start font-semibold dark:text-gray-400">
                                        {account.phone || '-'}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {account.email}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {account.role === 'super' ? 'Super Admin' : account.role === 'sub-super' ? 'Admin' : 'Order Manager'}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 flex items-center gap-2">
                                        <PencilSquareIcon className='size-7 cursor-pointer text-brand-500' onClick={() => openModal(account)} />
                                        {user?.id != account.id && user?.role === 'super' &&<TrashIcon className="size-7 cursor-pointer text-brand-500" onClick={()=> openDeleteModal(account.id , (id)=> dispatch(deleteAccounts(id)))}/>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {isOpen && selectedItem && <Modal
                    isOpen={isOpen}
                    onClose={closeModal}
                    className="max-w-[584px] p-5 lg:p-10"
                >
                    <AccountModal account={selectedItem} closeModal={closeModal} />
                </Modal>}
            </div>
        </div>
    )
}
