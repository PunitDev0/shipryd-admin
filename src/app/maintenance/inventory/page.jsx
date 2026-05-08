import { DashboardLayout } from '@/components/layout/DashboardLayout'
import InventoryManagement from '@/components/maintenance/inventory-management'
import React from 'react'

export const metadata = {
    title: 'Inventory | ShipRyd Admin',
}

export default function InventoryPage() {
    return (
        <DashboardLayout>
            <InventoryManagement />
        </DashboardLayout>
    )
}
