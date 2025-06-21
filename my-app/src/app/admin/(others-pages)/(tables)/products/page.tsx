'use client';
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ProductModal from '@/components/modals/ProductModal';
import CategoryModal from '@/components/modals/CategoryModal';
import ProductsTable from '@/components/tables/ProductsTable';
import CategoriesTable from '@/components/tables/CategoriesTable';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';

export default function Products() {
    const { closeModal: closeProductModal, openModal: openProductModal, isOpen: isProductModalOpen } = useModal();
    const { closeModal: closeCategoryModal, openModal: openCategoryModal, isOpen: isCategoryModalOpen } = useModal();

    return (
        <div className='space-y-5'>
            <PageBreadcrumb pageTitle='Products and Categories Page' />
            
            

            <ComponentCard title='Products List' cta={{
                content: 'Add Product', onClick: () => {
                    openProductModal()
                }
            }}>
                <ProductsTable />
            </ComponentCard>

            <ComponentCard title='Categories' cta={{
                content: 'Add Category', onClick: () => {
                    openCategoryModal()
                }
            }}>
                <CategoriesTable />
            </ComponentCard>

            {isProductModalOpen && (
                <Modal isOpen={isProductModalOpen} onClose={closeProductModal} className='max-w-[800px] p-5 lg:p-10'>
                    <ProductModal closeModal={closeProductModal} />
                </Modal>
            )}

            {isCategoryModalOpen && (
                <Modal isOpen={isCategoryModalOpen} onClose={closeCategoryModal} className='max-w-[600px] p-5 lg:p-10'>
                    <CategoryModal closeModal={closeCategoryModal} />
                </Modal>
            )}
        </div>
    )
}
