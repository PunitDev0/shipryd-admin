import { DashboardLayout } from '@/components/layout/DashboardLayout'
import ServiceTickets from '@/components/maintenance/service-tickets'
import React from 'react'

export const metadata = {
    title: 'Service Tickets | ShipRyd Admin',
}

export default function ServiceTicketsPage() {
    return (
        <DashboardLayout>
            <ServiceTickets />
        </DashboardLayout>
    )
}
