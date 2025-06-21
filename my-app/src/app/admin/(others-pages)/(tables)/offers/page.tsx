'use client';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PackModal from '@/components/modals/PackModal';
import PromoCodeModal from '@/components/modals/PromoCodeModal';
import PacksTable from '@/components/tables/PacksTable';
import PromoCodesTable from '@/components/tables/PromoCodesTable';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';

export default function Offers() {
    const { closeModal: closePackModal, openModal: openPackModal, isOpen: isPackModalOpen } = useModal();
    const { closeModal: closePromoCodeModal, openModal: openPromoCodeModal, isOpen: isPromoCodeModalOpen } = useModal();

    return (
        <div className='space-y-5'>
            <PageBreadcrumb pageTitle='Offers Management' />
            
            <ComponentCard title='Product Packs' cta={{
                content: 'Create Pack', onClick: () => {
                    openPackModal()
                }
            }}>
                <PacksTable />
            </ComponentCard>

            <ComponentCard title='Promo Codes' cta={{
                content: 'Create Promo Code', onClick: () => {
                    openPromoCodeModal()
                }
            }}>
                <PromoCodesTable />
            </ComponentCard>

            {isPackModalOpen && (
                <Modal isOpen={isPackModalOpen} onClose={closePackModal} className='max-w-[800px] p-5 lg:p-10'>
                    <PackModal closeModal={closePackModal} />
                </Modal>
            )}

            {isPromoCodeModalOpen && (
                <Modal isOpen={isPromoCodeModalOpen} onClose={closePromoCodeModal} className='max-w-[600px] p-5 lg:p-10'>
                    <PromoCodeModal closeModal={closePromoCodeModal} />
                </Modal>
            )}
        </div>
    )
} 