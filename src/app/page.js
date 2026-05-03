'use client'

import Dashboard from '@/components/dashboard/page'
import { TopBar } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function Page() {
  return (
    <div className="flex h-screen bg-zinc-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-transparent custom-scrollbar">
          <div className="p-8 max-w-7xl mx-auto">
            <Dashboard />
          </div>
        </main>
      </div>
    </div>
  )
}
