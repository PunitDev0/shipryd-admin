'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Truck,
  Battery,
  CreditCard,
  Building2,
  HelpCircle,
  Bell,
  Wrench,
  UserCheck,
  History,
  LogOut,
  ZapOff,
  MapPin,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Sidebar() {
  const pathname = usePathname()
  const [permissions, setPermissions] = React.useState(null)

  React.useEffect(() => {
    // Get stored permissions from localStorage
    const storedAdmin = localStorage.getItem('adminUser')
    if (storedAdmin) {
      const admin = JSON.parse(storedAdmin)
      setPermissions(admin.permissions)
    }
  }, [])

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
    { href: '/drivers', label: 'Drivers', icon: Users, id: 'drivers' },
    { href: '/live-tracking', label: 'Live Tracking', icon: MapPin, id: 'drivers' },
    { href: '/vehicles', label: 'Vehicles', icon: Truck, id: 'vehicles' },
    { href: '/hubs', label: 'Hubs', icon: MapPin, id: 'vehicles' },
    { href: '/vehicle-return-approval', label: 'Vehicle Return', icon: Truck, id: 'vehicleReturn' },
    { href: '/battery-swaps', label: 'Battery swaps', icon: Battery, id: 'batterySwaps' },
    { href: '/battery-access', label: 'Swap Access', icon: ZapOff, id: 'batterySwaps' }, // Using same permission id as battery swaps for simplicity, or I can add a new one
    { href: '/vehicle-lifecycle', label: 'Vehicle Lifecycle', icon: History, id: 'vehicleLifecycle' },
    { href: '/payments', label: 'Payments', icon: CreditCard, id: 'payments' },
    { href: '/companies', label: 'Companies', icon: Building2, id: 'companies' },
    { href: '/help-center', label: 'Help Center', icon: HelpCircle, id: 'helpCenter' },
    { href: '/notification', label: 'Notification', icon: Bell, id: 'notification' },
    { href: '/admin-users', label: 'Admin Users', icon: UserCheck, id: 'adminUsers' },
  ].filter(item => {
    // If permissions not loaded, show nothing or all (depending on UX preference)
    // Here we show only if permission is true
    if (!permissions) return true; // Default to showing while loading or if not found
    return permissions[item.id] === true;
  })

  // Check maintenance permission
  const hasMaintenanceAccess = !permissions || permissions.maintenance === true;

  const isMaintenanceActive = pathname.startsWith('/maintenance')

  return (
    <div className="h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-sidebar-primary">ShipRyd</span>
          <div className="text-xs font-semibold tracking-wider text-sidebar-foreground/60">
            electric
          </div>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">

        {/* Normal Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}

        {/* 🔥 Maintenance Dropdown */}
        {hasMaintenanceAccess && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${isMaintenanceActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
              >
                <Wrench size={20} />
                <span className="text-sm font-medium">Maintenance</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="right"
              align="start"
              className="w-48"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/maintenance/inventory"
                  className={`w-full ${pathname === '/maintenance/inventory'
                    ? 'font-semibold text-primary'
                    : ''
                    }`}
                >
                  Inventory
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/maintenance/tickets"
                  className={`w-full ${pathname === '/maintenance/tickets'
                    ? 'font-semibold text-primary'
                    : ''
                    }`}
                >
                  Service Tickets
                </Link>
              </DropdownMenuItem>

              {/* Add more maintenance routes here */}
              {/* 
              <DropdownMenuItem asChild>
                <Link href="/maintenance/service">
                  Service
                </Link>
              </DropdownMenuItem>
              */}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => {
            localStorage.removeItem('adminToken')
            localStorage.removeItem('adminUser')
            window.location.href = '/login'
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>

    </div>
  )
}
