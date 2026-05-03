'use client'

import React, { useState } from 'react'
import { X, Loader2, Upload, ChevronDown } from 'lucide-react'
import { BASE_URL } from '@/lib/baseUrl'

export function AddVehicleModal({ isOpen, onClose, onSuccess }) {
    const [drivers, setDrivers] = useState([])
    const [isLoadingDrivers, setIsLoadingDrivers] = useState(false)
    const [selectedDriverId, setSelectedDriverId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hubs, setHubs] = useState([])
    const [isLoadingHubs, setIsLoadingHubs] = useState(false)

    const [formData, setFormData] = useState({
        vehicleId: '',
        chassisNo: '',
        type: 'electric',
        status: 'available',
        driverId: '',
        hub: ''
    })
    const [bulkFile, setBulkFile] = useState(null)
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

    React.useEffect(() => {
        if (isOpen) {
            fetchDrivers()
            fetchHubs()
        }
    }, [isOpen])

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

    const fetchDrivers = async () => {
        setIsLoadingDrivers(true)
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${BASE_URL}/api/driver/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (data.success && data.drivers) {
                // Filter only approved drivers if needed, but for now showing all
                setDrivers(data.drivers)
            }
        } catch (error) {
            console.error('Error fetching drivers:', error)
        } finally {
            setIsLoadingDrivers(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleDriverSelect = (e) => {
        const dId = e.target.value
        setSelectedDriverId(dId)

        if (dId) {
            const driver = drivers.find(d => d._id === dId)
            if (driver) {
                setFormData(prev => ({ ...prev, driverId: driver.driverId || '' }))
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const body = {
                ...formData,
                driverId: selectedDriverId || formData.driverId || undefined // Prefer mongo id if selected
            }

            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${BASE_URL}/api/vehicle/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            })

            const data = await response.json()

            if (response.ok && data.success) {
                alert('Vehicle registered successfully!')
                setFormData({
                    vehicleId: '',
                    chassisNo: '',
                    type: 'electric',
                    status: 'available',
                    driverId: '',
                    hub: ''
                })
                setSelectedDriverId('')
                onSuccess?.()
                onClose()
            } else {
                alert('Registration failed: ' + (data.message || 'Unknown error'))
            }
        } catch (error) {
            console.error('Error adding vehicle:', error)
            alert('Something went wrong.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBulkUpload = async (e) => {
        e.preventDefault()
        if (!bulkFile) {
            alert('Please select a file.')
            return
        }

        setIsBulkSubmitting(true)
        const uploadData = new FormData()
        uploadData.append('file', bulkFile)

        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${BASE_URL}/api/vehicle/bulk-add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            })

            const data = await response.json()

            if (response.ok && data.success) {
                alert(`Successfully imported vehicles!`)
                setBulkFile(null)
                onSuccess?.()
                onClose()
            } else {
                alert('Bulk import failed: ' + (data.error || data.message || 'Unknown error'))
            }
        } catch (error) {
            console.error('Error during bulk upload:', error)
            alert('Bulk import error.')
        } finally {
            setIsBulkSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50 text-zinc-800">
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Add New Vehicle</h2>
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
                                    placeholder="e.g. MH12AB1234"
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
                                    placeholder="e.g. ABC123DEF456"
                                    className="w-full border p-2 text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Driver ID (Manual)</label>
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
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Assign Driver (Optional)</label>
                                <div className="relative group">
                                    <select
                                        value={selectedDriverId}
                                        onChange={handleDriverSelect}
                                        className="w-full border p-2 text-sm focus:outline-none focus:border-black appearance-none bg-white cursor-pointer group-hover:bg-gray-50 transition-colors pr-10"
                                        disabled={isLoadingDrivers}
                                    >
                                        <option value="">Select a driver...</option>
                                        {drivers.map(driver => (
                                            <option key={driver._id} value={driver._id}>
                                                {driver.personalInformation?.fullName} ({driver.driverId || 'No ID'}) - {driver.phone}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black transition-colors">
                                        {isLoadingDrivers ? (
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
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Register Vehicle'}
                        </button>
                    </form>


                    <div className="pt-6 border-t">
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4">Bulk Import</h3>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={(e) => setBulkFile(e.target.files[0])}
                                className="text-xs border p-2 flex-1"
                            />
                            <button
                                onClick={handleBulkUpload}
                                disabled={!bulkFile || isBulkSubmitting}
                                className="bg-white border-2 border-black text-black px-4 py-2 text-xs font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isBulkSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Upload size={14} /> Import</>}
                            </button>
                        </div>
                    </div>
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
