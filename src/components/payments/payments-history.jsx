'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Search,
    RotateCcw,
    CreditCard,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    ChevronRight,
    Eye,
    IndianRupee,
    Calendar,
    Filter,
    Download
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
    const [isSyncing, setIsSyncing] = useState(null)

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
            
            // Date Range Filtering
            if (startDate) {
                url += `&startDate=${startDate}`
            }
            if (endDate) {
                url += `&endDate=${endDate}`
            }

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
        switch (status) {
            case 'active':
                return (
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 rounded border border-green-200">
                        Active
                    </span>
                )
            case 'expired':
                return (
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 rounded border border-gray-200">
                        Expired
                    </span>
                )
            case 'pending':
                return (
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded border border-amber-200">
                        Pending
                    </span>
                )
            case 'failed':
                return (
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 rounded border border-red-200">
                        Failed
                    </span>
                )
            case 'cancelled':
                return (
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 rounded border border-zinc-200">
                        Cancelled
                    </span>
                )
            default:
                return (
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 rounded border border-gray-100">
                        {status}
                    </span>
                )
        }
    }

    // Note: Search, status, and expiry filters are now handled entirely by the backend

    return (
        <div className="min-h-screen p-2 bg-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold">Payment History</h1>
                    <p className="text-gray-500 text-sm">
                        Monitor all subscription transactions and payment statuses
                    </p>
                </div>
            </div>

            {/* Search & Actions */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-3 items-center">
                    <div className="relative w-80">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search by Driver, Phone or Transaction ID"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-black rounded"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none border border-gray-300 pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-black rounded bg-white w-40 cursor-pointer text-gray-700"
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

                    {/* Date Range Selectors */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden">
                            <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-300">From</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 text-sm focus:outline-none focus:bg-gray-50 text-gray-700"
                            />
                        </div>
                        <span className="text-gray-400 font-bold">-</span>
                        <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden">
                            <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-300">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 text-sm focus:outline-none focus:bg-gray-50 text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Optional Clear Filters Button */}
                {(searchQuery || statusFilter !== 'all' || startDate || endDate) && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setDebouncedSearch('');
                            setStatusFilter('all');
                            setStartDate('');
                            setEndDate('');
                        }}
                        className="text-xs text-red-500 font-medium hover:underline ml-3"
                    >
                        Clear Filters
                    </button>
                )}

                <div className="flex gap-4 text-gray-600">
                    <RotateCcw
                        size={20}
                        className={`cursor-pointer hover:text-black ${isLoading ? 'animate-spin' : ''}`}
                        onClick={fetchSubscriptions}
                    />
                    <Download
                        size={20}
                        className="cursor-pointer hover:text-black"
                        onClick={handleExport}
                        title="Export to Excel"
                    />
                </div>
            </div>

            {/* Table Wrapper */}
            <div className="bg-white border border-gray-300 flex flex-col h-[75vh] rounded-sm overflow-hidden">
                {/* Table Header */}
                <div className="border-b border-gray-300 bg-gray-100">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left font-semibold text-gray-700">
                                <th className="px-4 py-3 w-[20%]">Driver / Contact</th>
                                <th className="px-4 py-3 w-[15%]">Plan / Amount</th>
                                <th className="px-4 py-3 w-[20%]">Transaction ID</th>
                                <th className="px-4 py-3 w-[15%] text-center">Date</th>
                                <th className="px-4 py-3 w-[15%] text-center">Status</th>
                                <th className="px-4 py-3 w-[15%] text-right pr-6">Expiry</th>
                            </tr>
                        </thead>
                    </table>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto relative min-h-[400px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={40} className="animate-spin text-zinc-400" />
                                <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Fetching Transactions...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 gap-4">
                            <XCircle size={40} className="text-red-400" />
                            <p className="text-gray-500 font-medium">{error}</p>
                            <button onClick={fetchSubscriptions} className="bg-black text-white px-4 py-2 text-xs rounded">Retry Fetch</button>
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8">
                            <p className="text-gray-400 font-medium tracking-tight">No transactions found</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <tbody>
                                {subscriptions.map((sub, index) => (
                                    <tr
                                        key={sub._id}
                                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-4 w-[20%]">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-zinc-900">
                                                    {sub.driverId?.personalInformation?.fullName || 'Unknown Driver'}
                                                </span>
                                                <span className="text-[11px] text-zinc-400 font-medium">{sub.driverId?.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 w-[15%]">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-700 capitalize">{sub.plan} Plan</span>
                                                <span className="text-emerald-600 font-black text-xs">₹ {sub.totalAmount?.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 w-[20%]">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-mono text-zinc-500 truncate" title={sub.razorpayPaymentId}>
                                                    P: {sub.razorpayPaymentId || 'N/A'}
                                                </span>
                                                <span className="text-[10px] font-mono text-zinc-400 truncate mt-1" title={sub.razorpayOrderId}>
                                                    O: {sub.razorpayOrderId || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 w-[15%] text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-medium text-zinc-700">
                                                    {sub.paymentDate ? new Date(sub.paymentDate).toLocaleDateString() : new Date(sub.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-zinc-400">
                                                    {sub.paymentDate ? new Date(sub.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 w-[15%] text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                {getStatusBadge(sub.status)}
                                                {sub.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleSync(sub._id)}
                                                        disabled={isSyncing === sub._id}
                                                        className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 hover:text-black mt-1 transition-colors disabled:opacity-50"
                                                        title="Sync with Razorpay"
                                                    >
                                                        {isSyncing === sub._id ? (
                                                            <Loader2 size={10} className="animate-spin" />
                                                        ) : (
                                                            <RotateCcw size={10} />
                                                        )}
                                                        Manual Sync
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 w-[15%] text-right pr-6">
                                            <div className="flex flex-col items-end">
                                                <span className={`font-bold ${sub.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '--'}
                                                </span>
                                                <span className="text-[10px] text-zinc-400">
                                                    {sub.endDate ? new Date(sub.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                                {sub.status === 'active' && sub.endDate && (() => {
                                                    const now = new Date();
                                                    const end = new Date(sub.endDate);
                                                    const isPast = end < now;
                                                    const diffMs = end - now;
                                                    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                                    
                                                    if (isPast) {
                                                        return (
                                                            <span className="text-[10px] font-bold mt-1 text-red-600 bg-red-50 px-1 rounded border border-red-100">
                                                                Expired
                                                            </span>
                                                        );
                                                    }

                                                    if (diffDays <= 1) {
                                                        return (
                                                            <span className="text-[10px] font-bold mt-1 text-red-500 animate-pulse">
                                                                Expiring Soon
                                                            </span>
                                                        );
                                                    }

                                                    return (
                                                        <span className="text-[10px] font-bold mt-1 text-orange-500">
                                                            {diffDays} days left
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Fixed Footer */}
                <div className="flex justify-between items-center p-4 text-sm bg-gray-50 border-t border-gray-300">
                    <p className="text-gray-500 font-medium">Showing {subscriptions.length} Transactions</p>
                </div>
            </div>
        </div>
    )
}
