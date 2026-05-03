'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'

const notificationTabs = ['All', 'Payments', 'Support', 'Approve Rider']

const notificationsList = [
  {
    id: 1,
    title: 'New Payment Request',
    description: 'Payment of ₹1600 from User name',
    amount: '₹1600',
    type: 'MEDIUM',
    time: '12d ago',
  },
  {
    id: 2,
    title: 'New Payment Request',
    description: 'Payment of ₹1600 from User name',
    amount: '₹1600',
    type: 'MEDIUM',
    time: '12d ago',
  },
  {
    id: 3,
    title: 'New Payment Request',
    description: 'Payment of ₹1600 from User name',
    amount: '₹1600',
    type: 'MEDIUM',
    time: '12d ago',
  },
]

export function Notifications() {
  const [activeTab, setActiveTab] = useState('All')

  return (
    <div className="w-96 bg-white rounded-lg shadow-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Notifications</h3>
        <div className="flex items-center gap-2">
          <button className="text-xs text-accent hover:text-accent/80 font-medium">
            Mark all as Read
          </button>
          <button className="p-1 hover:bg-muted rounded transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-3 border-b border-border">
        {notificationTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm rounded transition-colors ${
              activeTab === tab
                ? 'bg-accent text-white font-medium'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            {tab} {tab === 'Payments' && '(45)'}
            {tab === 'Support' && '(45)'}
            {tab === 'Approve Rider' && '(45)'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notificationsList.map((notification) => (
          <div
            key={notification.id}
            className="p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex gap-3">
              <div className="size-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-yellow-600">💳</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {notification.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-semibold text-accent">
                    {notification.amount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border text-center text-xs text-muted-foreground bg-muted/30">
        and 983 more notifications
        <div className="mt-2 text-xs">Last Updated: 11:47 AM</div>
      </div>
    </div>
  )
}
