'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Search,
    RotateCcw,
    Plus,
    Loader2,
    XCircle,
    Wrench,
    User,
    Package,
    Eye,
    Calendar,
    Edit,
    Trash2,
    Download
} from 'lucide-react'
import { apiProxy } from '@/lib/proxy'
import { CreateTicketModal } from './create-ticket-modal'
import { exportToExcel } from '@/lib/exportUtils'

export default function ServiceTickets() {
    const [tickets, setTickets] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    const handleExport = () => {
        const exportData = filteredTickets.map(t => ({
            'Ticket ID': t._id,
            'Date': new Date(t.createdAt).toLocaleString(),
            'Driver Name': t.driver?.personalInformation?.fullName || 'N/A',
            'Phone': t.driver?.phone || 'N/A',
            'Parts Issued': t.parts.map(p => p.part?.name).join(', '),
            'Total Cost': t.totalAmount,
            'Status': t.status
        }));
        exportToExcel(exportData, 'Service_Tickets_Report');
    };
    const [error, setError] = useState(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingTicket, setEditingTicket] = useState(null)

    const fetchTickets = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const { data, ok } = await apiProxy('/api/maintenance-ticket')
            if (ok) {
                setTickets(data)
            } else {
                setError(data.message || 'Failed to fetch tickets')
            }
        } catch (err) {
            console.error('Fetch error:', err)
            setError('Connection error. Please ensure the backend is running.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTickets()
    }, [fetchTickets])

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this ticket? Inventory stock will be reverted.')) return
        try {
            const { data, ok } = await apiProxy(`/api/maintenance-ticket/${id}`, { method: 'DELETE' })
            if (ok) {
                fetchTickets()
            } else {
                alert(data.message)
            }
        } catch (err) {
            alert('Failed to delete ticket')
        }
    }

    const filteredTickets = tickets.filter(ticket =>
        ticket.driver?.personalInformation?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.driver?.phone?.includes(searchQuery) ||
        ticket._id.includes(searchQuery)
    )

    return (
        <div className="min-h-screen p-2 bg-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold">Service Tickets</h1>
                    <p className="text-gray-500 text-sm">
                        Track parts issued to drivers and maintenance history
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setEditingTicket(null)
                            setShowCreateModal(true)
                        }}
                        className="bg-black text-white px-4 py-2 text-sm flex items-center gap-2 shadow-md hover:bg-zinc-800 rounded transition-all"
                    >
                        <Plus size={16} /> Raise New Ticket
                    </button>
                </div>
            </div>


            <div className="flex justify-between items-center mb-4">
                <div className="relative w-72">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search Driver or Ticket ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-black rounded"
                    />
                </div>

                <div className="flex gap-4 text-gray-600">
                    <RotateCcw
                        size={20}
                        className={`cursor-pointer hover:text-black ${isLoading ? 'animate-spin' : ''}`}
                        onClick={fetchTickets}
                    />
                    <Download
                        size={20}
                        className="cursor-pointer hover:text-black"
                        onClick={handleExport}
                        title="Export to Excel"
                    />
                </div>
            </div>


            <div className="bg-white border border-gray-300 flex flex-col h-[75vh] rounded-sm overflow-hidden">
                <div className="border-b border-gray-300 bg-gray-100 uppercase text-[11px] font-bold tracking-wider text-gray-600">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 w-[20%]">Ticket ID / Date</th>
                                <th className="px-6 py-4 w-[25%]">Driver</th>
                                <th className="px-6 py-4 w-[15%]">Parts Issued</th>
                                <th className="px-6 py-4 w-[12%]">Cost (₹)</th>
                                <th className="px-6 py-4 w-[13%] text-center">Status</th>
                                <th className="px-6 py-4 w-[15%] text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                    </table>
                </div>

                <div className="flex-1 overflow-y-auto relative min-h-[400px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={40} className="animate-spin text-zinc-400" />
                                <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Updating Tickets...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 gap-4">
                            <XCircle size={40} className="text-red-400" />
                            <p className="text-gray-500 font-medium">{error}</p>
                            <button onClick={fetchTickets} className="bg-black text-white px-4 py-2 text-xs rounded">Retry Fetch</button>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8">
                            <Wrench size={40} className="text-gray-300 mb-2" />
                            <p className="text-gray-400 font-medium tracking-tight">No service tickets found</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <tbody>
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 w-[20%]">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-[11px] text-gray-400 uppercase tracking-tighter">#{ticket._id.slice(-8)}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar size={12} className="text-gray-400" />
                                                    <span className="text-zinc-900 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 w-[25%]">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-zinc-900">{ticket.driver?.personalInformation?.fullName || 'Unknown'}</span>
                                                <span className="text-xs text-gray-500">{ticket.driver?.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 w-[15%]">
                                            <div className="flex flex-wrap gap-1">
                                                {ticket.parts.slice(0, 2).map((p, idx) => (
                                                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                        {p.part?.name}
                                                    </span>
                                                ))}
                                                {ticket.parts.length > 2 && (
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                                        +{ticket.parts.length - 2} More
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 w-[12%] font-bold text-zinc-900">
                                            ₹{ticket.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 w-[13%] text-center">
                                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${ticket.status === 'paid' || ticket.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                ticket.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                    ticket.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 w-[15%] text-right pr-6">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingTicket(ticket)
                                                        setShowCreateModal(true)
                                                    }}
                                                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ticket._id)}
                                                    className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <CreateTicketModal
                isOpen={showCreateModal}
                ticket={editingTicket}
                onClose={() => {
                    setShowCreateModal(false)
                    setEditingTicket(null)
                    fetchTickets()
                }}
            />
        </div>
    )
}

