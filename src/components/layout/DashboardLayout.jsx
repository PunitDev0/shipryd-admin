'use client'

import React, { useState } from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './header'

export function DashboardLayout({ children, noPadding = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white overflow-hidden">

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {noPadding ? (
          <div className="flex-1 relative overflow-hidden">
            {children}
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
        )}
      </div>

    </div>
  )
}
