import { DashboardLayout } from '@/components/layout/DashboardLayout'
import ReturnApprovalList from '@/components/vehicle-management/return-approval-list'
import React from 'react'

export const metadata = {
    title: 'Vehicle Return Approval | ShipRyd Admin',
}

export default function VehicleReturnApprovalPage() {
    return (
        <DashboardLayout>
            <ReturnApprovalList />
        </DashboardLayout>
    )
}
