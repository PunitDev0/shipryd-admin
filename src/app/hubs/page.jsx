import { TopBar } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import React from 'react'
import HubList from '@/components/hub-management/hub-list'

export const metadata = {
    title: 'Help Center | Maxrd Admin',
}

function HelpCenterPage() {
    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                    <div className="p-4">
                        <HubList />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default HelpCenterPage
