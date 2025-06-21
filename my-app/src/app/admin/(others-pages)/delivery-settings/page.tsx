import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import WilayasTable from '@/components/tables/WilayasTable'
import React from 'react'

export default function DeliverySettings() {
  return (
    <div>
      <PageBreadcrumb pageTitle='Delivery settings page' />
      <ComponentCard title='Delivery costs Table'>
        <WilayasTable />
      </ComponentCard>
    </div>
  )
}
