'use client'

import Dashboard from '@/components/dashboard/page'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import React from 'react'

export default function Page() {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  )
}
