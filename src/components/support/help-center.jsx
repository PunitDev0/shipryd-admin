'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Search,
    Plus,
    RotateCcw,
    Download,
    MoreVertical,
    Paperclip,
    CheckCircle2,
    ChevronDown,
    Flag,
    Mic,
    Eye,
    Loader2,
    XCircle
} from 'lucide-react'
import { BASE_URL } from '@/lib/baseUrl'
import { exportToExcel } from '@/lib/exportUtils'
import { AddTicketDialog } from './add-ticket-dialog'
import { TicketDetailModal } from './ticket-detail-modal'

export default function HelpCenter() {
    const [tickets, setTickets] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('All')
    const [error, setError] = useState(null)
    const [openDropdown, setOpenDropdown] = useState(null)
    const [showAddTicket, setShowAddTicket] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [showTicketDetail, setShowTicketDetail] = useState(false)

    const handleExport = () => {
        const exportData = filteredTickets.map(ticket => ({
            'Ticket ID': ticket._id,
            'Customer Name': ticket.driver?.personalInformation?.fullName || 'Anonymous',
            'Phone': ticket.driver?.phone || 'N/A',
            'Issue Type': ticket.problemType,
            'Description': ticket.description,
            'Date': new Date(ticket.createdAt).toLocaleDateString(),
            'Status': ticket.status
        }));
        exportToExcel(exportData, 'Help_Center_Tickets');
    };

    const fetchTickets = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(`${BASE_URL}/api/ticket/admin/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            })
            const data = await response.json()
            if (data.success) {
                setTickets(data.tickets)
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

    const handleUpdateStatus = async (ticketId, newStatus) => {
        try {
            const response = await fetch(`${BASE_URL}/api/ticket/status/${ticketId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ status: newStatus })
            })
            const data = await response.json()
            if (data.success) {
                fetchTickets()
                setOpenDropdown(null)
            } else {
                alert(data.message || 'Failed to update status')
            }
        } catch (err) {
            console.error('Update status error:', err)
            alert('Failed to update ticket status')
        }
    }

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.driver?.personalInformation?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.driver?.phone?.includes(searchQuery) ||
            ticket.problemType?.toLowerCase().includes(searchQuery.toLowerCase())

        if (activeTab === 'All') return matchesSearch
        if (activeTab === 'Ongoing') return matchesSearch && ticket.status === 'pending'
        if (activeTab === 'Resolved') return matchesSearch && ticket.status === 'resolved'
        if (activeTab === 'Closed') return matchesSearch && ticket.status === 'closed'
        return matchesSearch
    })

    const getStatusBadge = (status) => {
        const baseClass = "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded"
        switch (status) {
            case 'pending':
                return <span className={`${baseClass} bg-orange-50 text-orange-600 border border-orange-100`}>Ongoing</span>
            case 'resolved':
                return <span className={`${baseClass} bg-green-50 text-green-600 border border-green-100`}>Resolved</span>
            case 'closed':
                return <span className={`${baseClass} bg-gray-50 text-gray-500 border border-gray-100`}>Closed</span>
            default:
                return <span className={`${baseClass} bg-gray-50 text-gray-500 border border-gray-100`}>{status}</span>
        }
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900">Help Center</h1>
                    <p className="text-gray-500 text-sm">Manage support tickets</p>
                </div>

                <button
                    onClick={() => setShowAddTicket(true)}
                    className="w-full sm:w-auto bg-black text-white px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-zinc-800 rounded transition-all"
                >
                    <Plus size={16} /> New Ticket
                </button>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-black rounded transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="appearance-none w-full sm:w-40 bg-white border border-gray-300 px-4 py-2 pr-8 rounded text-sm focus:outline-none focus:border-black cursor-pointer font-bold text-gray-600"
                        >
                            <option value="All">All Status</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex justify-end items-center gap-4 text-gray-500">
                    <RotateCcw
                        size={18}
                        className={`cursor-pointer hover:text-black transition-colors ${isLoading ? 'animate-spin' : ''}`}
                        onClick={fetchTickets}
                    />
                    <Download
                        size={18}
                        className="cursor-pointer hover:text-black transition-colors"
                        onClick={handleExport}
                        title="Export"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col shadow-sm" style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}>
                <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full text-sm min-w-[950px]">
                        <thead className="bg-gray-50 border-b border-gray-200 text-left sticky top-0 z-10">
                            <tr>
                                <th className="px-5 py-3 font-semibold text-gray-600">ID</th>
                                <th className="px-5 py-3 font-semibold text-gray-600">Customer</th>
                                <th className="px-5 py-3 font-semibold text-gray-600">Issue Details</th>
                                <th className="px-5 py-3 font-semibold text-gray-600 text-center">Date</th>
                                <th className="px-5 py-3 font-semibold text-gray-600 text-center">Status</th>
                                <th className="px-5 py-3 font-semibold text-gray-600 text-center">Resources</th>
                                <th className="px-5 py-3 font-semibold text-gray-600 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={36} className="animate-spin text-zinc-300" />
                                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Syncing Tickets...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <XCircle size={36} className="text-red-300" />
                                            <p className="text-gray-500 font-medium">{error}</p>
                                            <button onClick={fetchTickets} className="bg-black text-white px-4 py-2 text-xs rounded font-bold uppercase">Retry</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center text-gray-400 font-medium">No tickets found</td>
                                </tr>
                            ) : (
                                filteredTickets.map((ticket, index) => (
                                    <tr key={ticket._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-900">#{ticket._id.slice(-6).toUpperCase()}</span>
                                                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-tighter flex items-center gap-1 mt-0.5">
                                                    {ticket.status === 'pending' ? <Flag size={10} className="text-orange-400" /> : <CheckCircle2 size={10} className="text-green-400" />}
                                                    {ticket.status === 'pending' ? 'Unread' : 'Archived'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-900 text-sm">{ticket.driver?.personalInformation?.fullName || 'Anonymous'}</span>
                                                <span className="text-[10px] text-zinc-400 font-mono">{ticket.driver?.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col max-w-xs">
                                                <span className="font-bold text-zinc-800 text-xs">{ticket.problemType}</span>
                                                <span className="text-[11px] text-zinc-500 truncate" title={ticket.description}>{ticket.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="font-bold text-zinc-700 text-xs">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-3 text-zinc-400">
                                                {ticket.voiceRecording && <Mic size={14} className="text-blue-500" />}
                                                <div className="flex items-center gap-1">
                                                    <Paperclip size={14} />
                                                    <span className="text-[10px] font-black">{ticket.attachments?.length || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right pr-6 relative">
                                            <div className="flex justify-end items-center gap-1">
                                                <button
                                                    onClick={() => { setSelectedTicket(ticket); setShowTicketDetail(true); }}
                                                    className="p-1.5 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-900 transition-all"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                                                    className="p-1.5 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-900 transition-all"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>

                                            {openDropdown === index && (
                                                <div className="absolute right-6 top-full mt-1 w-36 bg-white border border-gray-200 shadow-xl z-20 rounded-xl overflow-hidden py-1 text-left">
                                                    <button
                                                        onClick={() => { setSelectedTicket(ticket); setShowTicketDetail(true); setOpenDropdown(null); }}
                                                        className="block w-full px-4 py-2 hover:bg-gray-50 text-[10px] font-black uppercase text-zinc-600"
                                                    >
                                                        Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(ticket._id, 'resolved')}
                                                        className="block w-full px-4 py-2 hover:bg-gray-50 text-[10px] font-black uppercase text-emerald-600"
                                                    >
                                                        Resolve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(ticket._id, 'closed')}
                                                        className="block w-full px-4 py-2 text-red-500 hover:bg-red-50 text-[10px] font-black uppercase border-t border-gray-100 mt-1"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Tickets: {filteredTickets.length}</p>
                    <div className="flex items-center gap-1.5">
                        <button className="px-3 py-1 border border-gray-200 text-xs hover:bg-white rounded transition-colors">Prev</button>
                        <button className="px-3 py-1 bg-black text-white text-xs rounded">1</button>
                        <button className="px-3 py-1 border border-gray-200 text-xs hover:bg-white rounded transition-colors">Next</button>
                    </div>
                </div>
            </div>

            <AddTicketDialog isOpen={showAddTicket} onClose={() => setShowAddTicket(false)} onSuccess={fetchTickets} />
            <TicketDetailModal isOpen={showTicketDetail} onClose={() => { setShowTicketDetail(false); setSelectedTicket(null); }} ticket={selectedTicket} />
        </div>
    )
}
