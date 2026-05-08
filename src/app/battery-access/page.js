'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import BatteryAccessManagement from "@/components/battery-management/battery-access"
import React from 'react'

export default function BatteryAccessPage() {
    return (
        <DashboardLayout>
            <BatteryAccessManagement />
        </DashboardLayout>
    )
}
