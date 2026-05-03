import HelpCenter from '@/components/support/help-center'
import { TopBar } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import React from 'react'

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
                        <HelpCenter />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default HelpCenterPage
