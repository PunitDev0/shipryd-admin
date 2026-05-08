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
  X,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Sidebar({ onClose }) {
  const pathname = usePathname()
  const [permissions, setPermissions] = React.useState(null)

  React.useEffect(() => {
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
    { href: '/battery-access', label: 'Swap Access', icon: ZapOff, id: 'batterySwaps' },
    { href: '/vehicle-lifecycle', label: 'Vehicle Lifecycle', icon: History, id: 'vehicleLifecycle' },
    { href: '/payments', label: 'Payments', icon: CreditCard, id: 'payments' },
    { href: '/companies', label: 'Companies', icon: Building2, id: 'companies' },
    { href: '/help-center', label: 'Help Center', icon: HelpCircle, id: 'helpCenter' },
    { href: '/notification', label: 'Notification', icon: Bell, id: 'notification' },
    { href: '/admin-users', label: 'Admin Users', icon: UserCheck, id: 'adminUsers' },
  ].filter(item => {
    if (!permissions) return true;
    return permissions[item.id] === true;
  })

  const hasMaintenanceAccess = !permissions || permissions.maintenance === true;
  const isMaintenanceActive = pathname.startsWith('/maintenance')

  return (
    <div className="h-full w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">

      {/* Logo + Close button (mobile only) */}
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-sidebar-primary">ShipRyd</span>
          <div className="text-xs font-semibold tracking-wider text-sidebar-foreground/60">electric</div>
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Maintenance Dropdown */}
        {hasMaintenanceAccess && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors text-sm font-medium ${
                  isMaintenanceActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <Wrench size={18} />
                <span>Maintenance</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/maintenance/inventory" onClick={onClose} className={`w-full ${pathname === '/maintenance/inventory' ? 'font-semibold text-primary' : ''}`}>
                  Inventory
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/maintenance/tickets" onClick={onClose} className={`w-full ${pathname === '/maintenance/tickets' ? 'font-semibold text-primary' : ''}`}>
                  Service Tickets
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => {
            localStorage.removeItem('adminToken')
            localStorage.removeItem('adminUser')
            window.location.href = '/login'
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )
}
