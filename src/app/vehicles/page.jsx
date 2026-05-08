import { DashboardLayout } from '@/components/layout/DashboardLayout'
import VehicleManagement from '@/components/vehicle-management/page'
import React from 'react'

export default function page() {
  return (
    <DashboardLayout>
      <VehicleManagement />
    </DashboardLayout>
  )
}
