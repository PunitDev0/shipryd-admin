import DriversPage from '@/components/drivers-management/page'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import React from 'react'

export default function page() {
  return (
    <DashboardLayout>
      <DriversPage />
    </DashboardLayout>
  )
}
