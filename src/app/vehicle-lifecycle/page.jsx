import { DashboardLayout } from '@/components/layout/DashboardLayout'
import VehicleLifecycle from '@/components/battery-management/vehicle-lifecycle'
import React from 'react'

export default function page() {
    return (
        <DashboardLayout>
            <VehicleLifecycle />
        </DashboardLayout>
    )
}
