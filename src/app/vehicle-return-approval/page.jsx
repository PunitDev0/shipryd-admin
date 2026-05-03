import { TopBar } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import React from 'react'
import ReturnApprovalList from '@/components/vehicle-management/return-approval-list'

export const metadata = {
    title: 'Vehicle Return Approval | Maxrd Admin',
}

export default function VehicleReturnApprovalPage() {
    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                    <div className="p-4">
                        <ReturnApprovalList />
                    </div>
                </main>
            </div>
        </div>
    )
}
