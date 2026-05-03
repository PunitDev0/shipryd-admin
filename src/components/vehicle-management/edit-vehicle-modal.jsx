'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, ChevronDown } from 'lucide-react'
import { BASE_URL } from '@/lib/baseUrl'

export function EditVehicleModal({ isOpen, vehicle, onClose, onSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        vehicleId: '',
        chassisNo: '',
        type: 'electric',
        status: 'available',
        driverId: '',
        hub: ''
    })
    const [hubs, setHubs] = useState([])
    const [isLoadingHubs, setIsLoadingHubs] = useState(false)

    useEffect(() => {
        if (isOpen && vehicle) {
            setFormData({
                vehicleId: vehicle.vehicleId || '',
                chassisNo: vehicle.chassisNo || '',
                type: vehicle.type || 'electric',
                status: vehicle.status || 'available',
                driverId: vehicle.currentDriverId || vehicle.driverId || '',
                hub: vehicle.hub?._id || vehicle.hub || ''
            })
            fetchHubs()
        }
    }, [isOpen, vehicle])

    const fetchHubs = async () => {
        setIsLoadingHubs(true)
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${BASE_URL}/api/hub/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (data.success && data.hubs) {
                setHubs(data.hubs)
            }
        } catch (error) {
            console.error('Error fetching hubs:', error)
        } finally {
            setIsLoadingHubs(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!vehicle?._id) return

        setIsSubmitting(true)

        try {
            const response = await fetch(`${BASE_URL}/api/vehicle/${vehicle._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok && data.success) {
                alert('Vehicle updated successfully!')
                onSuccess?.()
                onClose()
            } else {
                alert('Update failed: ' + (data.message || 'Unknown error'))
            }
        } catch (error) {
            console.error('Error updating vehicle:', error)
            alert('Something went wrong.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50 text-zinc-800">
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Edit Vehicle</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vehicle ID</label>
                                <input
                                    type="text"
                                    name="vehicleId"
                                    required
                                    value={formData.vehicleId}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Chassis Number</label>
                                <input
                                    type="text"
                                    name="chassisNo"
                                    required
                                    value={formData.chassisNo}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Driver ID</label>
                                <input
                                    type="text"
                                    name="driverId"
                                    value={formData.driverId}
                                    onChange={handleInputChange}
                                    placeholder="e.g. D123"
                                    className="w-full border p-2 text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 text-sm focus:outline-none focus:border-black"
                                >
                                    <option value="electric">Electric</option>
                                    <option value="scooter">Scooter</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 text-sm focus:outline-none focus:border-black"
                                >
                                    <option value="available">Available</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="pre-booked">Pre-booked</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Hub</label>
                                <div className="relative group">
                                    <select
                                        name="hub"
                                        value={formData.hub}
                                        onChange={handleInputChange}
                                        className="w-full border p-2 text-sm focus:outline-none focus:border-black appearance-none bg-white cursor-pointer group-hover:bg-gray-50 transition-colors pr-10"
                                        disabled={isLoadingHubs}
                                    >
                                        <option value="">Select a Hub...</option>
                                        {hubs.map(hub => (
                                            <option key={hub._id} value={hub._id}>
                                                {hub.name} ({hub.city})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black transition-colors">
                                        {isLoadingHubs ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <ChevronDown size={14} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white py-3 text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Update Vehicle'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
