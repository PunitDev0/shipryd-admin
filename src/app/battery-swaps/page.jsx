import BatterySwaps from '@/components/battery-management/battery-swaps'
import { TopBar } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import React from 'react'

export default function page() {
    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                    <div className="p-4">
                        <BatterySwaps />
                    </div>
                </main>
            </div>
        </div>
    )
}
