import { DashboardLayout } from '@/components/layout/DashboardLayout'
import BatterySwaps from '@/components/battery-management/battery-swaps'
import React from 'react'

export default function page() {
    return (
        <DashboardLayout>
            <BatterySwaps />
        </DashboardLayout>
    )
}
