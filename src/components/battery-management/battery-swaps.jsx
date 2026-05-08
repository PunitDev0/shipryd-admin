'use client'

import React, { useState, useEffect } from 'react'
import {
    Search,
    RotateCcw,
    Calendar,
    LayoutGrid,
    Loader2,
    Download,
    MapPin,
} from 'lucide-react'
import { apiProxy } from '@/lib/proxy'
import { exportToExcel } from '@/lib/exportUtils'

export default function BatterySwaps() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' })

    useEffect(() => {
        fetchLogs()
    }, [dateFilter, searchQuery])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const start = formatDateForApi(dateFilter.start)
            const end = formatDateForApi(dateFilter.end)

            const params = new URLSearchParams()
            if (start) params.append('startDate', start)
            if (end) params.append('endDate', end)
            if (searchQuery) params.append('searchQuery', searchQuery)

            const { data, ok } = await apiProxy(`/api/batterySwap/admin/all-swap-logs?${params.toString()}`)
            if (ok) {
                setLogs(data.data || [])
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatDateForApi = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }

    const handleExport = () => {
        const exportData = logs.map(log => ({
            'Date': new Date(log.dateTime).toLocaleString(),
            'Driver Name': log.driverName,
            'Driver ID': log.driverId,
            'Partner/Station': log.partnerId,
            'City': log.city,
            'Issued Batteries': log.batteriesIssued?.join(', '),
            'Returned Batteries': log.batteriesReceived?.join(', '),
            'Status': log.driverStatus
        }));
        exportToExcel(exportData, `Battery_Swap_Logs_${new Date().toLocaleDateString()}`);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center flex-1">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Driver Name, ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-black transition-colors rounded"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded overflow-hidden">
                        <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                        <input
                            type="date"
                            value={dateFilter.start}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                            className="text-[10px] sm:text-xs focus:outline-none w-full bg-transparent"
                        />
                        <span className="text-gray-300 text-xs">to</span>
                        <input
                            type="date"
                            value={dateFilter.end}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                            className="text-[10px] sm:text-xs focus:outline-none w-full bg-transparent"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-50 px-3 py-2 border border-zinc-200 rounded">
                        Swaps: {logs.length}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchLogs}
                            className="p-2 hover:bg-zinc-100 rounded transition-colors text-zinc-500 hover:text-black border border-transparent hover:border-zinc-200"
                            title="Refresh"
                        >
                            <RotateCcw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={handleExport}
                            className="p-2 hover:bg-zinc-100 rounded transition-colors text-zinc-500 hover:text-black border border-transparent hover:border-zinc-200"
                            title="Export to Excel"
                        >
                            <Download size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 bg-white border border-gray-300 overflow-hidden flex flex-col rounded-sm shadow-sm" style={{ height: 'calc(100vh - 280px)', minHeight: '450px' }}>
                <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead className="bg-gray-100 border-b border-gray-300 text-left sticky top-0 z-10">
                            <tr>
                                <th className="px-5 py-3 font-semibold text-gray-700">Time & Date</th>
                                <th className="px-5 py-3 font-semibold text-gray-700">Pilot & Vehicle</th>
                                <th className="px-5 py-3 font-semibold text-gray-700">Station / Partner</th>
                                <th className="px-5 py-3 font-semibold text-gray-700">Battery Transaction</th>
                                <th className="px-5 py-3 font-semibold text-gray-700 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-zinc-400" size={32} />
                                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Assembling transaction logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-zinc-400 italic font-medium uppercase text-[10px] tracking-widest">
                                        No swap transactions identified for the selected criteria.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, index) => (
                                    <tr key={log._id || index} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-900">
                                                    {new Date(log.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                                    {new Date(log.dateTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-zinc-900">{log.driverName}</span>
                                                    <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 font-mono italic">
                                                        {log.driverId}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter mt-1">Vehicle: {log.vehicleId || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 text-zinc-700">
                                                    <LayoutGrid size={14} className="text-emerald-500" />
                                                    <span className="font-bold text-xs">{log.partnerId}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-zinc-400 mt-0.5">
                                                    <MapPin size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-tighter">{log.city || 'Location N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest min-w-[3.5rem]">Issued:</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {log.batteriesIssued?.length > 0 ? log.batteriesIssued.map((id, i) => (
                                                            <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-mono font-bold rounded border border-blue-100">{id}</span>
                                                        )) : <span className="text-[10px] text-zinc-300 italic">None</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest min-w-[3.5rem]">Returned:</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {log.batteriesReceived?.length > 0 ? log.batteriesReceived.map((id, i) => (
                                                            <span key={i} className="px-1.5 py-0.5 bg-zinc-50 text-zinc-500 text-[10px] font-mono font-bold rounded border border-zinc-200">{id}</span>
                                                        )) : <span className="text-[10px] text-zinc-300 italic">None</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${log.driverStatus === 'active'
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                : 'bg-red-100 text-red-700 border-red-200'
                                                }`}>
                                                {log.driverStatus}
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
