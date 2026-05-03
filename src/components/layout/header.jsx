'use client'

import React, { useState } from 'react'
import { Search, Bell, User, ChevronLeft } from 'lucide-react'
import { Notifications } from './notifications'

export function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <div className="bg-white border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-8 gap-6">
        <div className="flex items-center gap-4 flex-1">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-muted-foreground" />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Here"
                className="w-full pl-10 pr-4 py-2 bg-muted text-foreground rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-muted rounded-lg transition-colors relative"
            >
              <Bell size={20} className="text-muted-foreground" />
              <span className="absolute top-1 right-1 size-2 bg-accent rounded-full"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2">
                <Notifications />
              </div>
            )}
          </div>

          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <User size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
