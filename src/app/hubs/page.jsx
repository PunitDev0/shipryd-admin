import { DashboardLayout } from '@/components/layout/DashboardLayout'
import HubList from '@/components/hub-management/hub-list'
import React from 'react'

export const metadata = {
    title: 'Hubs | ShipRyd Admin',
}

export default function HubsPage() {
    return (
        <DashboardLayout>
            <HubList />
        </DashboardLayout>
    )
}
