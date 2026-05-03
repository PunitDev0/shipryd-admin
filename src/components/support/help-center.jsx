'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Search,
    Plus,
    RotateCcw,
    Download,
    MoreVertical,
    Paperclip,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    User,
    Ticket as TicketIcon,
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
    const [activeTab, setActiveTab] = useState('All') // Retaining activeTab for filtering if needed, or we can use a dropdown
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
                // Optimistically update or just refresh
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
        switch (status) {
            case 'pending':
                return (
                    <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded">
                        Ongoing
                    </span>
                )
            case 'resolved':
                return (
                    <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700 rounded">
                        Resolved
                    </span>
                )
            case 'closed':
                return (
                    <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 rounded">
                        Closed
                    </span>
                )
            default:
                return (
                    <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 rounded">
                        {status}
                    </span>
                )
        }
    }

    return (
        <div className="min-h-screen p-2 bg-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold">Help Center Admin</h1>
                    <p className="text-gray-500 text-sm">
                        Manage customer support tickets
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAddTicket(true)}
                        className="bg-black text-white px-4 py-2 text-sm flex items-center gap-2 shadow-md hover:bg-zinc-800 rounded transition-all"
                    >
                        <Plus size={16} /> Add New Ticket
                    </button>
                </div>
            </div>

            {/* Search & Actions */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-72">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search Ticket, Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-black rounded"
                        />
                    </div>
                    {/* Simple Filter Dropdown simulating tabs */}
                    <div className="relative">
                        <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded text-sm focus:outline-none focus:border-black cursor-pointer font-medium text-gray-700"
                        >
                            <option value="All">All Status</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
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

            {/* Table Wrapper */}
            <div className="bg-white border border-gray-300 flex flex-col h-[75vh] rounded-sm overflow-hidden">
                {/* Table Header */}
                <div className="border-b border-gray-300 bg-gray-100">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left font-semibold text-gray-700">
                                <th className="px-4 py-3 w-[15%]">Ticket ID</th>
                                <th className="px-4 py-3 w-[15%]">Customer</th>
                                <th className="px-4 py-3 w-[20%]">Issue</th>
                                <th className="px-4 py-3 w-[10%]">Date</th>
                                <th className="px-4 py-3 w-[10%] text-center">Status</th>
                                <th className="px-4 py-3 w-[15%] text-center">Attachments</th>
                                <th className="px-4 py-3 w-[15%] text-right pr-6">Actions</th>
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
                                <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Syncing Tickets...</p>
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
                            <p className="text-gray-400 font-medium tracking-tight">No tickets found</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <tbody>
                                {filteredTickets.map((ticket, index) => (
                                    <tr
                                        key={ticket._id}
                                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-4 w-[15%]">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-zinc-900">#{ticket._id.slice(-6).toUpperCase()}</span>
                                                <span className="text-[10px] text-zinc-400 font-mono tracking-tight flex items-center gap-1">
                                                    {ticket.status === 'pending' ? <Flag size={10} className="text-orange-400" /> : <CheckCircle2 size={10} className="text-green-400" />}
                                                    {ticket.status === 'pending' ? 'Unread' : 'Archived'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 w-[15%]">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-zinc-900">{ticket.driver?.personalInformation?.fullName || 'Anonymous'}</span>
                                                <span className="text-xs text-zinc-500">{ticket.driver?.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 w-[20%]">
                                            <div className="flex flex-col max-w-xs">
                                                <span className="font-bold text-zinc-900">{ticket.problemType}</span>
                                                <span className="text-xs text-zinc-500 truncate" title={ticket.description}>{ticket.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 w-[10%]">
                                            <span className="font-medium text-zinc-700 text-xs">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 w-[10%] text-center">
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                        <td className="px-4 py-4 w-[15%] text-center">
                                            <div className="flex items-center justify-center gap-3 text-zinc-500">
                                                {ticket.voiceRecording && <Mic size={16} className="text-blue-500 cursor-pointer hover:text-blue-600" title="Voice Recording" />}
                                                <div className="flex items-center gap-1 cursor-pointer hover:text-zinc-700" title="Attachments">
                                                    <Paperclip size={16} />
                                                    <span className="text-xs font-bold">{ticket.attachments?.length || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 w-[15%] text-right pr-6 relative">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTicket(ticket)
                                                        setShowTicketDetail(true)
                                                    }}
                                                    className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-black"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                                                    className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-black"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>

                                            {openDropdown === index && (
                                                <div className="absolute right-6 mt-2 w-32 bg-white border border-gray-300 shadow-xl z-20 rounded-md overflow-hidden py-1 text-left">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTicket(ticket)
                                                            setShowTicketDetail(true)
                                                            setOpenDropdown(null)
                                                        }}
                                                        className="block w-full px-4 py-2 hover:bg-gray-100 text-[11px] font-bold text-gray-700"
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(ticket._id, 'resolved')}
                                                        className="block w-full px-4 py-2 hover:bg-gray-100 text-[11px] font-bold text-gray-700"
                                                    >
                                                        Resolve Ticket
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(ticket._id, 'closed')}
                                                        className="block w-full px-4 py-2 text-red-600 hover:bg-red-50 text-[11px] font-bold border-t border-gray-100 mt-1"
                                                    >
                                                        Close Ticket
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Fixed Footer Pagination */}
                <div className="flex justify-between items-center p-4 text-sm bg-gray-50 border-t border-gray-300">
                    <p className="text-gray-500 font-medium">Total {filteredTickets.length} Tickets</p>

                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 border border-gray-300 text-xs shadow-sm hover:bg-white rounded">
                            Previous
                        </button>
                        <button className="px-3 py-1 bg-black text-white text-xs rounded">1</button>
                        <button className="px-3 py-1 border border-gray-300 text-xs shadow-sm hover:bg-white rounded">2</button>
                        <button className="px-3 py-1 border border-gray-300 text-xs shadow-sm hover:bg-white rounded">
                            Next →
                        </button>
                    </div>
                </div>
            </div>

            <AddTicketDialog
                isOpen={showAddTicket}
                onClose={() => setShowAddTicket(false)}
                onSuccess={() => {
                    fetchTickets()
                }}
            />

            <TicketDetailModal
                isOpen={showTicketDetail}
                onClose={() => {
                    setShowTicketDetail(false)
                    setSelectedTicket(null)
                }}
                ticket={selectedTicket}
            />
        </div>
    )
}
