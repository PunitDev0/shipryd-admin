'use client'

import React, { useState, useEffect } from 'react'
import { X, Search, Loader2, Check } from 'lucide-react'
import { BASE_URL } from '@/lib/baseUrl'

export function AssignDriverModal({ isOpen, onClose, vehicleId, onSuccess }) {
    const [drivers, setDrivers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchDrivers()
        }
    }, [isOpen])

    const fetchDrivers = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${BASE_URL}/api/driver/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            })
            const data = await response.json()
            if (data.success && data.drivers) {
                setDrivers(data.drivers)
            }
        } catch (error) {
            console.error('Error fetching drivers:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAssign = async () => {
        if (!selectedDriver || !vehicleId) return

        setIsSubmitting(true)
        try {
            const response = await fetch(`${BASE_URL}/api/vehicle/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    driverId: selectedDriver._id,
                    vehicleId: vehicleId
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                alert('Vehicle assigned successfully!')
                onSuccess?.()
                onClose()
            } else {
                alert('Assignment failed: ' + (data.message || 'Unknown error'))
            }
        } catch (error) {
            console.error('Error assigning vehicle:', error)
            alert('Something went wrong.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredDrivers = drivers.filter(driver =>
        driver.personalInformation?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.phone?.includes(searchQuery) ||
        driver.driverId?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50 text-zinc-800">
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Assign Driver</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search driver by name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border p-2 pl-9 text-sm focus:outline-none focus:border-black"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 bg-gray-50 space-y-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                            <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                    ) : (
                        filteredDrivers.map((driver) => (
                            <button
                                key={driver._id}
                                onClick={() => setSelectedDriver(driver)}
                                className={`w-full flex items-center justify-between p-3 border transition-colors ${selectedDriver?._id === driver._id
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white hover:bg-gray-100 border-transparent'
                                    }`}
                            >
                                <div className="text-left">
                                    <p className="text-sm font-semibold">{driver.personalInformation?.fullName}</p>
                                    <p className={`text-[10px] ${selectedDriver?._id === driver._id ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {driver.phone} • {driver.driverId || 'No ID'}
                                        <span className={`ml-2 px-1 rounded ${driver.status === 'approved' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'}`}>
                                            {driver.status}
                                        </span>
                                    </p>
                                </div>
                                {selectedDriver?._id === driver._id && <Check size={16} />}
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedDriver || isSubmitting}
                        className="flex-1 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Assign Driver'}
                    </button>
                </div>
            </div>
        </div>
    )
}
