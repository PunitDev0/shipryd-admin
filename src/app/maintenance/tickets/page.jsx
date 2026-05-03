import ServiceTickets from '@/components/maintenance/service-tickets'
import { TopBar } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import React from 'react'

export const metadata = {
    title: 'Service Tickets | Maxrd Admin',
}

function ServiceTicketsPage() {
    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                    <div className="p-4">
                        <ServiceTickets />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default ServiceTicketsPage
