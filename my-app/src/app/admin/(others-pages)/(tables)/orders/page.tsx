import React from 'react'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import OrdersTable from '@/components/tables/OrdersTable'


export default function OrdersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Orders page"/>
      <ComponentCard title='Orders Table'>
        <OrdersTable/>
      </ComponentCard>
    </div>
  )
}
