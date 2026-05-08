import { DashboardLayout } from '@/components/layout/DashboardLayout'
import HelpCenter from '@/components/support/help-center'
import React from 'react'

export const metadata = {
    title: 'Help Center | ShipRyd Admin',
}

export default function HelpCenterPage() {
    return (
        <DashboardLayout>
            <HelpCenter />
        </DashboardLayout>
    )
}
