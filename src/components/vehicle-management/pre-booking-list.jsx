'use client'

import React, { useState, useEffect } from 'react'
import { Search, RotateCcw, Loader2, CheckCircle2, XCircle, Clock, Calendar, Phone, User, Download } from 'lucide-react'
import { BASE_URL } from '@/lib/baseUrl'
import { exportToExcel } from '@/lib/exportUtils'

export default function PreBookingList() {
    const [preBookings, setPreBookings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    const handleExport = () => {
        const exportData = filteredPreBookings.map(pb => ({
            'Driver Name': pb.driver?.personalInformation?.fullName || 'N/A',
            'Driver ID': pb.driver?.driverId || 'N/A',
            'Phone': pb.driver?.phone || 'N/A',
            'Booking Amount': pb.bookingAmount,
            'Status': pb.status,
            'Delivery Date': new Date(pb.expectedDeliveryDate).toLocaleDateString(),
            'Created At': new Date(pb.createdAt).toLocaleString()
        }));
        exportToExcel(exportData, 'Pre_Bookings_Report');
    };

    const fetchPreBookings = async () => {
        setIsLoading(true)
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const response = await fetch(`${BASE_URL}/api/pre-booking/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (data.success) {
                setPreBookings(data.preBookings)
            }
        } catch (error) {
            console.error('Error fetching pre-bookings:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPreBookings()
    }, [])

    const filteredPreBookings = preBookings.filter(pb => {
        const driverName = pb.driver?.personalInformation?.fullName?.toLowerCase() || ''
        const driverPhone = pb.driver?.phone || ''
        const driverId = pb.driver?.driverId?.toLowerCase() || ''
        const query = searchQuery.toLowerCase()

        return driverName.includes(query) || driverPhone.includes(query) || driverId.includes(query)
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-emerald-100 text-emerald-700'
            case 'pending': return 'bg-amber-100 text-amber-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            case 'confirmed': return 'bg-blue-100 text-blue-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <CheckCircle2 size={14} />
            case 'pending': return <Clock size={14} />
            case 'cancelled': return <XCircle size={14} />
            case 'confirmed': return <Calendar size={14} />
            default: return null
        }
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-80">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by driver name, ID or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchPreBookings}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-black"
                    >
                        <RotateCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-black"
                        title="Export to Excel"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white border border-gray-300 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-300 text-left">
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-gray-600">Driver Details</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-gray-600">Booking Amount</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-gray-600">Payment Status</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-gray-600">Delivery Date</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-gray-600">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="animate-spin text-gray-400" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Pre-bookings...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPreBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-gray-400">
                                        No pre-booking records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPreBookings.map((pb) => (
                                    <tr key={pb._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-zinc-900">{pb.driver?.personalInformation?.fullName || 'N/A'}</span>
                                                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono italic">
                                                        {pb.driver?.driverId || 'NO_ID'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-gray-400 text-xs mt-1">
                                                    <span className="flex items-center gap-1.5"><Phone size={12} /> {pb.driver?.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-zinc-800">₹{pb.bookingAmount}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(pb.status)}`}>
                                                    {getStatusIcon(pb.status)}
                                                    {pb.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-zinc-700 font-medium">
                                                    {new Date(pb.expectedDeliveryDate).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Expected</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-500 text-xs">
                                                {new Date(pb.createdAt).toLocaleString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
