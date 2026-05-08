import { DashboardLayout } from '@/components/layout/DashboardLayout'
import PaymentsPageContent from '@/components/payments/payments-history'
import React from 'react'

export const metadata = {
    title: 'Payment History | ShipRyd Admin',
    description: 'View and manage all subscription transactions.',
}

export default function page() {
    return (
        <DashboardLayout>
            <PaymentsPageContent />
        </DashboardLayout>
    )
}
