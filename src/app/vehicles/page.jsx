import { TopBar } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import VehicleManagement from '@/components/vehicle-management/page'
import React from 'react'

function page() {
  return (
     <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-white h-[75vh]">
          <div className="p-4">
            <VehicleManagement />
            </div>
        </main>
      </div>
    </div>

  )
}

export default page
