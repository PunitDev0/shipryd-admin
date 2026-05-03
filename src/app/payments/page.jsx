import PaymentsPageContent from '@/components/payments/payments-history'
import { TopBar } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import React from 'react'

export const metadata = {
    title: 'Payment History | Ridezzy Electric',
    description: 'View and manage all subscription transactions.',
}

function page() {
    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                    <div className="p-4 lg:p-6">
                        <PaymentsPageContent />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default page
