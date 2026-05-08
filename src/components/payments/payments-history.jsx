'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Search,
    RotateCcw,
    XCircle,
    Loader2,
    Download,
    Filter,
} from 'lucide-react'
import { BASE_URL } from '@/lib/baseUrl'
import { exportToExcel } from '@/lib/exportUtils'

export default function PaymentsPageContent() {
    const [subscriptions, setSubscriptions] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isSyncing, setIsSyncing] = useState(null)

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleExport = () => {
        const exportData = subscriptions.map(sub => ({
            'Driver Name': sub.driverId?.personalInformation?.fullName || 'N/A',
            'Phone': sub.driverId?.phone || 'N/A',
            'Plan': sub.plan,
            'Amount': sub.totalAmount,
            'Payment ID': sub.razorpayPaymentId || 'N/A',
            'Order ID': sub.razorpayOrderId || 'N/A',
            'Payment Date': sub.paymentDate ? new Date(sub.paymentDate).toLocaleString() : new Date(sub.createdAt).toLocaleString(),
            'Status': sub.status,
            'Expiry Date': sub.endDate ? new Date(sub.endDate).toLocaleString() : 'N/A'
        }));
        exportToExcel(exportData, 'Payment_History_Report');
    };

    const handleSync = async (subscriptionId) => {
        setIsSyncing(subscriptionId)
        try {
            const response = await fetch(`${BASE_URL}/api/subscription/sync/${subscriptionId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            })
            const data = await response.json()
            if (data.success) {
                alert("Subscription activated successfully!")
                fetchSubscriptions()
            } else {
                alert(data.message || "Sync failed. Driver might not have paid yet.")
            }
        } catch (err) {
            console.error("Sync error:", err)
            alert("Connection error during sync.")
        } finally {
            setIsSyncing(null)
        }
    }

    const fetchSubscriptions = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem('adminToken')
            let url = `${BASE_URL}/api/subscription/all?limit=100&status=${statusFilter}`
            
            if (debouncedSearch) {
                url += `&search=${encodeURIComponent(debouncedSearch)}`
            }
            
            if (startDate) url += `&startDate=${startDate}`
            if (endDate) url += `&endDate=${endDate}`

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()

            if (data.success) {
                setSubscriptions(data.subscriptions)
            } else {
                setError(data.message || 'Failed to fetch payment history')
            }
        } catch (err) {
            console.error('Fetch error:', err)
            setError('Connection error. Please ensure the backend is running.')
        } finally {
            setIsLoading(false)
        }
    }, [statusFilter, startDate, endDate, debouncedSearch])

    useEffect(() => {
        fetchSubscriptions()
    }, [fetchSubscriptions])

    const getStatusBadge = (status) => {
        const baseClass = "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded border"
        switch (status) {
            case 'active':
                return <span className={`${baseClass} bg-green-50 text-green-700 border-green-100`}>Active</span>
            case 'expired':
                return <span className={`${baseClass} bg-gray-50 text-gray-700 border-gray-100`}>Expired</span>
            case 'pending':
                return <span className={`${baseClass} bg-amber-50 text-amber-700 border-amber-100`}>Pending</span>
            case 'failed':
                return <span className={`${baseClass} bg-red-50 text-red-700 border-red-100`}>Failed</span>
            case 'cancelled':
                return <span className={`${baseClass} bg-zinc-50 text-zinc-700 border-zinc-100`}>Cancelled</span>
            default:
                return <span className={`${baseClass} bg-gray-50 text-gray-500 border-gray-100`}>{status}</span>
        }
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900">Payment History</h1>
                    <p className="text-gray-500 text-sm">Monitor subscription transactions</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-bold rounded hover:bg-zinc-800 transition-colors shadow-sm"
                    >
                        <Download size={14} /> Export Report
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                    <div className="relative flex-1 lg:max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Driver, Phone or Transaction..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-black rounded transition-colors"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative flex-1 sm:max-w-[180px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none w-full border border-gray-300 pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-black rounded bg-white cursor-pointer text-gray-700"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <Filter size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                            <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden flex-1">
                                <span className="px-2 py-2 text-[10px] font-bold text-gray-400 bg-gray-50 border-r border-gray-300 uppercase">From</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-2 py-2 text-xs focus:outline-none w-full text-gray-700"
                                />
                            </div>
                            <span className="text-gray-300 text-xs font-bold">/</span>
                            <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden flex-1">
                                <span className="px-2 py-2 text-[10px] font-bold text-gray-400 bg-gray-50 border-r border-gray-300 uppercase">To</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-2 py-2 text-xs focus:outline-none w-full text-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={fetchSubscriptions}
                        className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-500 hover:text-black hidden lg:block"
                    >
                        <RotateCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {(searchQuery || statusFilter !== 'all' || startDate || endDate) && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setDebouncedSearch('');
                            setStatusFilter('all');
                            setStartDate('');
                            setEndDate('');
                        }}
                        className="text-[10px] text-red-500 font-black uppercase tracking-wider hover:underline w-fit"
                    >
                        Clear All Filters
                    </button>
                )}
            </div>

            {/* Table Container */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col shadow-sm" style={{ height: 'calc(100vh - 340px)', minHeight: '400px' }}>
                <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full text-sm min-w-[950px]">
                        <thead className="bg-gray-50 border-b border-gray-200 text-left sticky top-0 z-10">
                            <tr>
                                <th className="px-5 py-3 font-semibold text-gray-600">Driver / Contact</th>
                                <th className="px-5 py-3 font-semibold text-gray-600">Plan / Amount</th>
                                <th className="px-5 py-3 font-semibold text-gray-600">Transaction Details</th>
                                <th className="px-5 py-3 font-semibold text-gray-600 text-center">Date</th>
                                <th className="px-5 py-3 font-semibold text-gray-600 text-center">Status</th>
                                <th className="px-5 py-3 font-semibold text-gray-600 text-right pr-6">Expiry</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={36} className="animate-spin text-zinc-300" />
                                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Assembling Records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <XCircle size={36} className="text-red-300" />
                                            <p className="text-gray-500 font-medium">{error}</p>
                                            <button onClick={fetchSubscriptions} className="bg-black text-white px-4 py-2 text-xs rounded font-bold uppercase">Retry</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <p className="text-gray-400 font-medium">No transactions found</p>
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-900 text-sm">
                                                    {sub.driverId?.personalInformation?.fullName || 'Unknown Driver'}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 font-mono tracking-tight">{sub.driverId?.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-700 capitalize text-xs">{sub.plan} Plan</span>
                                                <span className="text-emerald-600 font-black text-xs">₹ {sub.totalAmount?.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col max-w-[200px]">
                                                <span className="text-[9px] font-mono text-zinc-400 truncate uppercase">PID: {sub.razorpayPaymentId || 'N/A'}</span>
                                                <span className="text-[9px] font-mono text-zinc-400 truncate uppercase mt-1">OID: {sub.razorpayOrderId || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-zinc-700 text-xs">
                                                    {sub.paymentDate ? new Date(sub.paymentDate).toLocaleDateString() : new Date(sub.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-zinc-400">
                                                    {sub.paymentDate ? new Date(sub.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                {getStatusBadge(sub.status)}
                                                {sub.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleSync(sub._id)}
                                                        disabled={isSyncing === sub._id}
                                                        className="flex items-center gap-1 text-[9px] font-black text-zinc-500 hover:text-black uppercase tracking-tighter mt-1 transition-colors"
                                                    >
                                                        {isSyncing === sub._id ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />}
                                                        Sync
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right pr-6">
                                            <div className="flex flex-col items-end">
                                                <span className={`font-bold text-xs ${sub.status === 'active' ? 'text-zinc-900' : 'text-zinc-300'}`}>
                                                    {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '--'}
                                                </span>
                                                {sub.status === 'active' && sub.endDate && (() => {
                                                    const now = new Date();
                                                    const end = new Date(sub.endDate);
                                                    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                                                    if (daysLeft < 0) return <span className="text-[9px] font-black mt-1 text-red-500 uppercase">Expired</span>;
                                                    return (
                                                        <span className={`text-[9px] font-black mt-1 uppercase ${daysLeft <= 1 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
                                                            {daysLeft}D Left
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Metrics */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Records: {subscriptions.length}</p>
                    <p className="text-zinc-300 font-bold uppercase text-[9px] tracking-[0.2em]">Live Transaction Ledger</p>
                </div>
            </div>
        </div>
    )
}
