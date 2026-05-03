'use client'

import React, { useState, useEffect } from 'react'
import { Check, X, Loader2, Info, RotateCcw, User, Truck, Clock, Calendar, Search, Filter } from 'lucide-react'
import { BASE_URL } from '@/lib/baseUrl'

export default function ReturnApprovalList() {
    const [requests, setRequests] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(null)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('pending') // 'pending' or 'history'
    
    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState('')

    useEffect(() => {
        fetchRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab])

    const fetchRequests = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${BASE_URL}/api/vehicle/return-requests?type=${activeTab}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (data.success) {
                setRequests(data.requests)
            } else {
                setError(data.message || 'Failed to fetch requests')
            }
        } catch (err) {
            console.error('Error fetching return requests:', err)
            setError('Connection error or server unreachable')
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async (assignmentId) => {
        if (!confirm('Are you sure you want to approve this vehicle return?')) return
        
        setIsProcessing(assignmentId)
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${BASE_URL}/api/vehicle/unassign/${assignmentId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (data.success) {
                alert('Return approved successfully!')
                fetchRequests()
            } else {
                alert(data.message || 'Approval failed')
            }
        } catch (error) {
            console.error('Approval error:', error)
        } finally {
            setIsProcessing(null)
        }
    }

    const handleReject = async (assignmentId) => {
        if (!confirm('Are you sure you want to reject this return request?')) return

        setIsProcessing(assignmentId)
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${BASE_URL}/api/vehicle/return-reject/${assignmentId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (data.success) {
                alert('Return request rejected')
                fetchRequests()
            } else {
                alert(data.message || 'Rejection failed')
            }
        } catch (error) {
            console.error('Rejection error:', error)
        } finally {
            setIsProcessing(null)
        }
    }

    // Client-side filtering
    const filteredRequests = requests.filter(req => {
        const matchesSearch = 
            (req.driver?.personalInformation?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (req.vehicle?.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (req.vehicle?.chassisNo?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (req.driver?.driverId?.toLowerCase().includes(searchTerm.toLowerCase()));

        const reqDate = new Date(req.returnRequestDate).toISOString().split('T')[0];
        const matchesDate = !dateFilter || reqDate === dateFilter;

        return matchesSearch && matchesDate;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-3 italic uppercase tracking-tighter">
                        <RotateCcw className="text-orange-500" /> Return Center
                    </h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage and audit vehicle handbacks</p>
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-none border">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'pending' ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:text-black'
                        }`}
                    >
                        Pending Requests
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'history' ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:text-black'
                        }`}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 border shadow-sm">
                <div className="md:col-span-2 flex items-center gap-3 bg-zinc-50 border px-4 py-2 hover:border-black transition-all">
                    <Search size={18} className="text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by Driver Name, ID, Vehicle No, or Chassis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none text-sm font-bold w-full uppercase placeholder:text-gray-300"
                    />
                </div>
                <div className="flex items-center gap-3 bg-zinc-50 border px-4 py-2 hover:border-black transition-all">
                    <Calendar size={18} className="text-gray-400" />
                    <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-transparent outline-none text-sm font-bold w-full uppercase"
                    />
                </div>
                <button 
                    onClick={() => {setSearchTerm(''); setDateFilter('')}}
                    className="flex items-center justify-center gap-2 bg-zinc-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all border"
                >
                    <Filter size={14} /> Clear { (searchTerm || dateFilter) ? 'Filters' : '' }
                </button>
            </div>

            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-orange-500" />
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Fetching fleet data...</p>
                </div>
            ) : error ? (
                <div className="bg-white border-2 border-red-50 p-12 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                        <X size={32} className="text-red-200" />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-tight text-red-600">Failed to Load</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{error}</p>
                    </div>
                    <button 
                        onClick={fetchRequests}
                        className="mt-4 px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white border p-20 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center">
                        <Check size={32} className="text-zinc-200" />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-tight text-zinc-900">No Records Found</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Try adjusting your filters or check back later.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredRequests.map((request) => (
                        <div key={request._id} className="bg-white border hover:border-black transition-all overflow-hidden flex flex-col xl:flex-row shadow-sm">
                            <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Driver Info */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-900 text-white flex items-center justify-center rounded-none shadow-sm font-black text-[10px]">
                                            PL
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilot Details</p>
                                            <p className="text-sm font-black uppercase tracking-tight">{request.driver?.personalInformation?.fullName || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pl-12 text-xs font-bold text-zinc-500">
                                        <p>ID: {request.driver?.driverId}</p>
                                        <p>+91 {request.driver?.phone}</p>
                                    </div>
                                </div>

                                {/* Vehicle Info */}
                                <div className="space-y-3 border-zinc-100 md:border-l md:pl-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-500 text-white flex items-center justify-center rounded-none shadow-sm font-black text-[10px]">
                                            VH
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehicle Details</p>
                                            <p className="text-sm font-black uppercase tracking-tight">{request.vehicle?.vehicleId || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pl-12 text-xs font-bold text-zinc-500">
                                        <p className="font-mono">{request.vehicle?.chassisNo}</p>
                                        <p className="text-orange-600 italic">Assigned: {new Date(request.assignedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Request Details */}
                                <div className="space-y-3 border-zinc-100 md:border-l md:pl-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-100 text-zinc-900 flex items-center justify-center rounded-none border shadow-sm font-black text-[10px]">
                                            RQ
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Request Info</p>
                                            <p className="text-[10px] font-bold uppercase text-zinc-900 flex items-center gap-1 mt-0.5">
                                                <Calendar size={10} /> {new Date(request.returnRequestDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pl-12">
                                        <p className="text-[11px] font-bold text-zinc-900 border-l-2 border-orange-500 pl-3 py-1 italic bg-zinc-50">
                                            "{request.returnReason || 'No reason provided.'}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions or Status */}
                            <div className="bg-zinc-50 border-t xl:border-t-0 xl:border-l flex xl:flex-col w-full xl:w-64">
                                {activeTab === 'pending' ? (
                                    <>
                                        <button 
                                            onClick={() => handleApprove(request._id)}
                                            disabled={isProcessing === request._id}
                                            className="flex-1 flex items-center justify-center gap-2 p-4 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all border-r xl:border-r-0 xl:border-b"
                                        >
                                            {isProcessing === request._id ? <Loader2 size={16} className="animate-spin" /> : 'Approve Return'}
                                        </button>
                                        <button 
                                            onClick={() => handleReject(request._id)}
                                            disabled={isProcessing === request._id}
                                            className="flex-1 flex items-center justify-center gap-2 p-4 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            Reject Request
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-none border border-emerald-200">
                                            Handback Complete
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Processed On {new Date(request.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
