'use client'

import React, { useState, useEffect } from 'react'
import {
    Search,
    RotateCcw,
    Truck,
    User,
    Calendar,
    ChevronDown,
    ChevronUp,
    History,
    CreditCard,
    Battery,
    Download,
    Loader2,
    CheckCircle2,
    Clock,
    Zap,
    Box,
    ArrowRightLeft,
    Activity,
    ExternalLink
} from 'lucide-react'
import { apiProxy } from '@/lib/proxy'
import { exportToExcel } from '@/lib/exportUtils'
import { formatDateIST } from '@/lib/utils'

export default function VehicleLifecycle() {
    const [data, setData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedVehicles, setExpandedVehicles] = useState(new Set())
    const [openSwapLogs, setOpenSwapLogs] = useState(new Set())

    const handleExport = () => {
        const fullHistoryData = [];

        filteredData.forEach(v => {
            if (!v.history || v.history.length === 0) {
                // Handle unassigned vehicles
                fullHistoryData.push({
                    'Vehicle ID': v.vehicleId,
                    'Chassis No': v.chassisNo,
                    'Vehicle Status': v.status,
                    'Driver Name': 'UNASSIGNED',
                    'Assignment Status': 'N/A',
                    'Assigned At': 'N/A',
                    'Returned At': 'N/A',
                    'Swaps In Session': 0,
                    'Driver Lifetime Swaps': 0,
                    'Driver Subscriptions': 0
                });
            } else {
                v.history.forEach(session => {
                    fullHistoryData.push({
                        'Vehicle ID': v.vehicleId,
                        'Chassis No': v.chassisNo,
                        'Vehicle Status': v.status,
                        'Driver Name': session.driverName || 'Unknown',
                        'Assignment Status': session.status === 'active' ? 'CURRENTLY ASSIGNED' : 'PREVIOUS DRIVER',
                        'Assigned At': formatDateIST(session.assignedAt),
                        'Returned At': session.returnedAt ? formatDateIST(session.returnedAt) : (session.status === 'active' ? 'STILL ASSIGNED' : 'N/A'),
                        'Swaps In Session': session.swapCount || 0,
                        'Driver Lifetime Swaps': session.totalDriverLifetimeSwaps || 0,
                        'Driver Subscriptions': session.totalDriverSubscriptions || 0
                    });
                });
            }
        });

        exportToExcel(fullHistoryData, 'Vehicle_Detailed_Lifecycle_Report');
    };

    useEffect(() => {
        fetchReport()
    }, [])

    useEffect(() => {
        if (!searchQuery) {
            setFilteredData(data)
            return
        }
        const query = searchQuery.toLowerCase()
        const filtered = data.filter(v =>
            v.vehicleId?.toLowerCase().includes(query) ||
            v.chassisNo?.toLowerCase().includes(query) ||
            v.currentDriver?.name?.toLowerCase().includes(query) ||
            v.currentDriver?.id?.toLowerCase().includes(query)
        )
        setFilteredData(filtered)
    }, [searchQuery, data])

    const fetchReport = async () => {
        try {
            setLoading(true)
            const { data, ok } = await apiProxy('/api/batterySwap/vehicle-lifecycle-report')
            if (ok) {
                setData(data.data || [])
                setFilteredData(data.data || [])
            }
        } catch (error) {
            console.error("Failed to fetch vehicle lifecycle report:", error)
        } finally {
            setLoading(false)
        }
    }

    const toggleVehicle = (id) => {
        const newExpanded = new Set(expandedVehicles)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedVehicles(newExpanded)
    }

    const toggleSwapLogs = (assignmentId) => {
        const newOpen = new Set(openSwapLogs)
        if (newOpen.has(assignmentId)) {
            newOpen.delete(assignmentId)
        } else {
            newOpen.add(assignmentId)
        }
        setOpenSwapLogs(newOpen)
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'assigned':
                return (
                    <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-full">
                        Assigned
                    </span>
                )
            case 'maintenance':
                return (
                    <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-full">
                        Maintenance
                    </span>
                )
            case 'available':
                return (
                    <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700 rounded-full">
                        Available
                    </span>
                )
            default:
                return (
                    <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 rounded-full">
                        {status || 'Unknown'}
                    </span>
                )
        }
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-80">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search Vehicle ID or Pilot..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                </div>

                <div className="flex gap-3">
                    <div className="bg-zinc-50 border border-zinc-200 px-4 py-2 rounded flex items-center gap-2">
                        <History size={16} className="text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{data.length} Registered</span>
                    </div>
                    <button
                        onClick={fetchReport}
                        className="p-2 hover:bg-zinc-100 rounded transition-colors text-zinc-500 hover:text-black"
                        title="Refresh"
                    >
                        <RotateCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="p-2 hover:bg-zinc-100 rounded transition-colors text-zinc-500 hover:text-black"
                        title="Export Summary"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Table Wrapper */}
            <div className="flex-1 bg-white border border-gray-300 overflow-hidden flex flex-col rounded-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b border-gray-300 text-left sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-gray-700 w-[15%]">Vehicle ID</th>
                                <th className="px-4 py-3 font-semibold text-gray-700 w-[15%]">Chassis No.</th>
                                <th className="px-4 py-3 font-semibold text-gray-700 w-[15%]">Current Pilot</th>
                                <th className="px-4 py-3 font-semibold text-gray-700 w-[10%] text-center">History</th>
                                <th className="px-4 py-3 font-semibold text-gray-700 w-[12%] text-center">Status</th>
                                <th className="px-4 py-3 font-semibold text-gray-700 w-[10%] text-center">Lifetime Swaps</th>
                                <th className="px-4 py-3 font-semibold text-gray-700 w-[18%]">Last Active</th>
                                <th className="px-4 py-3 font-semibold text-gray-700 w-[10%] text-right pr-6">Expand</th>
                            </tr>
                        </thead>
                    </table>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto relative min-h-[400px] custom-scrollbar">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={40} className="animate-spin text-zinc-400" />
                                <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Assembling Lifecycle Data...</p>
                            </div>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8">
                            <Box size={40} className="text-zinc-200 mb-4" />
                            <p className="text-gray-400 font-medium tracking-tight whitespace-pre-wrap">No vehicle nodes identified</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm border-collapse">
                            <tbody>
                                {filteredData.map((vehicle) => (
                                    <React.Fragment key={vehicle._id}>
                                        <tr
                                            className={`border-b border-zinc-200 hover:bg-zinc-50 transition-colors cursor-pointer ${expandedVehicles.has(vehicle._id) ? 'bg-zinc-50' : ''}`}
                                            onClick={() => toggleVehicle(vehicle._id)}
                                        >
                                            <td className="px-4 py-4 w-[15%]">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-zinc-900 uppercase tracking-tighter">{vehicle.vehicleId}</span>
                                                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Internal ID: {vehicle._id.slice(-6)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 w-[15%] font-mono text-zinc-500 font-bold">
                                                {vehicle.chassisNo}
                                            </td>
                                            <td className="px-4 py-4 w-[15%]">
                                                {vehicle.currentDriver ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-zinc-900">{vehicle.currentDriver.name}</span>
                                                        <span className="text-[10px] text-zinc-400 font-mono">{vehicle.currentDriver.id}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-300 italic font-medium">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 w-[10%] text-center">
                                                <div className="inline-flex flex-col items-center bg-zinc-900 text-white px-2 py-1 rounded min-w-[3rem]">
                                                    <span className="text-xs font-black">{vehicle.assignmentCount}</span>
                                                    <span className="text-[7px] font-black uppercase tracking-tighter text-zinc-500">Nodes</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 w-[12%] text-center">
                                                {getStatusBadge(vehicle.status)}
                                            </td>
                                            <td className="px-4 py-4 w-[10%] text-center">
                                                <div className="inline-flex flex-col items-center bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 min-w-[3rem]">
                                                    <span className="text-xs font-black">{vehicle.vehicleLifetimeSwaps || 0}</span>
                                                    <span className="text-[7px] font-black uppercase tracking-tighter text-blue-400">Total</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 w-[18%] text-zinc-600">
                                                {vehicle.history[0] ? (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} className="text-zinc-400" />
                                                        <span className="text-xs font-bold">{new Date(vehicle.history[0].assignedAt).toLocaleDateString()}</span>
                                                    </div>
                                                ) : '--'}
                                            </td>
                                            <td className="px-4 py-4 w-[10%] text-right pr-6">
                                                <div className={`p-1.5 rounded transition-all inline-block ${expandedVehicles.has(vehicle._id) ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-black'}`}>
                                                    {expandedVehicles.has(vehicle._id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Expandable Lifecycle Content */}
                                        {expandedVehicles.has(vehicle._id) && (
                                            <tr>
                                                <td colSpan={8} className="px-8 py-8 bg-zinc-50/50">
                                                    <div className="relative pl-12">
                                                        {/* Timeline Line */}
                                                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-200 rounded-full"></div>

                                                        <div className="flex flex-col gap-6">
                                                            {vehicle.history.length > 0 ? (
                                                                vehicle.history.map((entry, idx) => (
                                                                    <div key={entry.assignmentId || idx} className="relative">
                                                                        {/* Timeline Node */}
                                                                        <div className={`absolute -left-[41px] top-0 w-8 h-8 rounded-lg flex items-center justify-center border-2 border-white shadow-sm transition-all ${entry.status === 'active' ? 'bg-zinc-900 text-yellow-400' : 'bg-zinc-200 text-zinc-500'}`}>
                                                                            {entry.status === 'active' ? <Zap size={15} className="fill-yellow-400" /> : <Clock size={15} />}
                                                                        </div>

                                                                        <div className={`rounded-xl border border-zinc-200 p-4 bg-white shadow-sm transition-all ${entry.status === 'active' ? 'ring-2 ring-emerald-50 border-emerald-100' : ''}`}>
                                                                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                                                                                {/* Pilot Identity */}
                                                                                <div className="space-y-2">
                                                                                    <div className="text-[9px] uppercase font-black text-zinc-400 tracking-widest">A-PILOT IDENTITY</div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center shadow-inner">
                                                                                            <User size={18} className="text-yellow-500" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="font-bold text-zinc-900 uppercase text-[13px]">{entry.driverName}</div>
                                                                                            <div className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest">ID: {entry.driverId}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                    {entry.status === 'active' && (
                                                                                        <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase rounded border border-emerald-200 animate-pulse">
                                                                                            ACTIVE NOW
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                {/* Timestamp Repository */}
                                                                                <div className="space-y-2">
                                                                                    <div className="text-[9px] uppercase font-black text-zinc-400 tracking-widest">TEMPORAL LOG</div>
                                                                                    <div className="space-y-1.5">
                                                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-700">
                                                                                            <Calendar size={13} className="text-zinc-400" />
                                                                                            <span>In: {formatDateIST(entry.assignedAt)}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500">
                                                                                            <RotateCcw size={13} className="text-zinc-400" />
                                                                                            <span>Out: {entry.returnedAt ? formatDateIST(entry.returnedAt) : <span className="text-emerald-600 uppercase tracking-tighter">Persistence</span>}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Metric Summary */}
                                                                                <div className="xl:col-span-2 grid grid-cols-2 gap-3">
                                                                                    <div
                                                                                        className={`p-3 rounded-xl border border-zinc-100 flex flex-col justify-between cursor-pointer transition-all ${openSwapLogs.has(entry.assignmentId) ? 'bg-zinc-900 text-white shadow-xl translate-y-[-2px]' : 'bg-zinc-50 hover:border-zinc-300'}`}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            toggleSwapLogs(entry.assignmentId);
                                                                                        }}
                                                                                    >
                                                                                        <div className="flex justify-between items-start">
                                                                                            <Battery size={16} className={openSwapLogs.has(entry.assignmentId) ? 'text-yellow-400' : 'text-zinc-400'} />
                                                                                            {openSwapLogs.has(entry.assignmentId) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="text-[8px] font-black uppercase tracking-widest opacity-60">Session Swaps</div>
                                                                                            <div className="text-xl font-black">{entry.swapCount}</div>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="p-3 rounded-xl border border-zinc-100 bg-zinc-50 flex flex-col justify-between">
                                                                                        <CreditCard size={16} className="text-blue-500" />
                                                                                        <div>
                                                                                            <div className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Total Plans</div>
                                                                                            <div className="text-xl font-black text-zinc-900">{entry.totalDriverSubscriptions}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Chrono Logs Expansion */}
                                                                            {openSwapLogs.has(entry.assignmentId) && (
                                                                                <div className="mt-6 pt-6 border-t border-dashed border-zinc-200 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                                    <div className="flex items-center gap-2 mb-4">
                                                                                        <Activity size={18} className="text-yellow-600" />
                                                                                        <h5 className="font-black text-zinc-900 uppercase text-xs tracking-widest underline decoration-yellow-400 decoration-2 underline-offset-4">Chronological Transaction Log</h5>
                                                                                    </div>

                                                                                    {entry.swapRecords && entry.swapRecords.length > 0 ? (
                                                                                        <div className="flex flex-col gap-3">
                                                                                            {entry.swapRecords.map((swap, sIdx) => {
                                                                                                const formattedDate = formatDateIST(swap.dateTime);

                                                                                                return (
                                                                                                    <div key={sIdx} className="bg-white border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-all border-l-4 border-l-emerald-500">
                                                                                                        <div className="flex justify-between items-start mb-2">
                                                                                                            <div className="flex items-center gap-2">
                                                                                                                <div className="p-1.5 bg-emerald-50 rounded">
                                                                                                                    <Battery className="w-3.5 h-3.5 text-emerald-600" />
                                                                                                                </div>
                                                                                                                <div>
                                                                                                                    <h6 className="text-[13px] font-bold text-zinc-900">{swap.city || 'Battery Swap'}</h6>
                                                                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                                                                        <span className="text-[10px] font-medium text-gray-500">Partner: {swap.partnerId || 'N/A'}</span>
                                                                                                                        <span className="text-[10px] text-gray-400">•</span>
                                                                                                                        <span className="text-[10px] text-gray-400 font-medium">{formattedDate}</span>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            {swap.isExtraSwap && (
                                                                                                                <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded">EXTRA</span>
                                                                                                            )}
                                                                                                        </div>

                                                                                                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-50">
                                                                                                            <div>
                                                                                                                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2">Issued</p>
                                                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                                                    {swap.batteriesIssued?.length > 0 ? swap.batteriesIssued.map((b, bIdx) => (
                                                                                                                        <span key={bIdx} className="text-[10px] font-bold text-blue-800 font-mono bg-blue-50 px-2 py-1 rounded border border-blue-100">{b}</span>
                                                                                                                    )) : <span className="text-[10px] text-gray-400 italic">None</span>}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Returned</p>
                                                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                                                    {swap.batteriesReceived?.length > 0 ? swap.batteriesReceived.map((b, bIdx) => (
                                                                                                                        <span key={bIdx} className="text-[10px] font-bold text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200">{b}</span>
                                                                                                                    )) : <span className="text-[10px] text-gray-400 italic">None</span>}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="py-12 border-2 border-dashed border-zinc-100 rounded-xl text-center">
                                                                                            <p className="text-xs font-bold text-zinc-400 tracking-widest italic uppercase">Zero swap operations recorded in this node</p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="py-20 text-center flex flex-col items-center">
                                                                    <Box size={32} className="text-zinc-200 mb-3" />
                                                                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No Assignment History Repository Found</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Fixed Footer - Matching Drivers/Vehicles UI */}
                <div className="flex justify-between items-center p-4 text-sm bg-gray-50 border-t border-gray-300">
                    <p className="text-gray-500 font-medium tracking-tight whitespace-pre-wrap">Aggregation of {filteredData.length} Operational Nodes</p>

                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 border border-gray-300 text-xs shadow-sm hover:bg-white rounded font-bold text-zinc-600">
                            Previous
                        </button>
                        <button className="px-3 py-1 bg-black text-white text-xs rounded font-bold shadow-md shadow-zinc-200">1</button>
                        <button className="px-3 py-1 border border-gray-300 text-xs shadow-sm hover:bg-white rounded font-bold text-zinc-600">
                            Next →
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-[9px] font-black text-zinc-300 uppercase tracking-[0.4em]">
                Ridezzy Fleet Lifecycle Management System // Internal Terminal
            </div>
        </div>
    )
}
