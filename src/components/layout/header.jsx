'use client'

import React, { useState } from 'react'
import { Search, Bell, User, Menu } from 'lucide-react'
import { Notifications } from './notifications'

export function TopBar({ onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <div className="bg-white border-b border-border sticky top-0 z-30 flex-shrink-0">
      <div className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6 gap-3">

        {/* Left: Hamburger + Search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Hamburger - mobile only */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
          >
            <Menu size={20} className="text-muted-foreground" />
          </button>

          {/* Search - hidden on very small screens */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search here..."
                className="w-full pl-9 pr-4 py-2 bg-muted/60 text-sm text-foreground rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-muted rounded-lg transition-colors relative"
            >
              <Bell size={20} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 size-2 bg-accent rounded-full" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 z-50">
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
