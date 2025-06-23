'use client';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import Switch from '../form/switch/Switch';
import { updateWilaya } from '@/store/wilayas/wilayaHandler';
import { Wilaya } from '@/store/wilayas/wilayaSlice';

interface WilayaModalProps {
    closeModal: () => void;
    selectedItem: Wilaya;
}

export default function WilayaModal({ closeModal, selectedItem }: WilayaModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    
    const prices =typeof selectedItem.shipping_prices === 'string' ? JSON.parse(selectedItem.shipping_prices) : selectedItem.shipping_prices;
    const [wilaya, setWilaya] = useState({
        shipping_prices: {
            home: prices.home,
            desk: prices.desk
        },
        is_active: selectedItem.is_active
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(updateWilaya(selectedItem.id, wilaya));
        closeModal();
    };

    return (
        <form onSubmit={handleSave}>
            <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
                Update {selectedItem.name} Shipping Prices
            </h4>

            <div className='max-h-[60vh] overflow-y-auto'>
                <div className='border border-gray-200 dark:border-white/[0.05] rounded-lg p-5 mb-5'>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <Label className='font-semibold text-gray-400'>Home Delivery Price</Label>
                            <Input
                                type="number"
                                value={wilaya.shipping_prices.home}
                                onChange={(e) => setWilaya(prev => ({
                                    ...prev,
                                    shipping_prices: {
                                        ...prev.shipping_prices,
                                        home: Number(e.target.value)
                                    }
                                }))}
                                className="w-full"
                                placeholder="e.g., 1200"
                                required
                            />
                        </div>
                        <div>
                            <Label className='font-semibold text-gray-400'>Desk Delivery Price</Label>
                            <Input
                                type="number"
                                value={wilaya.shipping_prices.desk}
                                onChange={(e) => setWilaya(prev => ({
                                    ...prev,
                                    shipping_prices: {
                                        ...prev.shipping_prices,
                                        desk: Number(e.target.value)
                                    }
                                }))}
                                className="w-full"
                                placeholder="e.g., 800"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                                    <div className="text-lg font-semibold text-gray-800 dark:text-white">
                                        {wilaya.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                                <Switch 
                                    defaultChecked={wilaya.is_active} 
                                    onChange={() => setWilaya(prev => ({ ...prev, is_active: !prev.is_active }))} 
                                />
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
                    Save Changes
                </Button>
            </div>
        </form>
    );
} 