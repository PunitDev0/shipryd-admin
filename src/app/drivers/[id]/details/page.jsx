import { DashboardLayout } from '@/components/layout/DashboardLayout'
import DriverProfilePage from '@/components/drivers-management/driver-details'
import React from 'react'

export default function page() {
    return (
        <DashboardLayout>
            <DriverProfilePage />
        </DashboardLayout>
    )
}
