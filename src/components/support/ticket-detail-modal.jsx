'use client'

import React from 'react'
import {
    X,
    User,
    Phone,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    Flag,
    Mic,
    Paperclip,
    ExternalLink,
    XCircle
} from 'lucide-react'

export function TicketDetailModal({ isOpen, onClose, ticket }) {
    if (!isOpen || !ticket) return null

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Ongoing',
                    color: 'bg-orange-100 text-orange-700 border-orange-200',
                    icon: <Clock size={16} />
                }
            case 'resolved':
                return {
                    label: 'Resolved',
                    color: 'bg-green-100 text-green-700 border-green-200',
                    icon: <CheckCircle2 size={16} />
                }
            case 'closed':
                return {
                    label: 'Closed',
                    color: 'bg-gray-100 text-gray-700 border-gray-200',
                    icon: <XCircle size={16} />
                }
            default:
                return {
                    label: status,
                    color: 'bg-gray-100 text-gray-700 border-gray-200',
                    icon: <AlertCircle size={16} />
                }
        }
    }

    const statusInfo = getStatusInfo(ticket.status)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-black text-white p-2 rounded-lg">
                            <Flag size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Ticket Details</h2>
                            <p className="text-sm text-gray-500 font-mono tracking-tighter uppercase">#{ticket._id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Status & Date */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block font-mono">Status</label>
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                                    {statusInfo.icon}
                                    {statusInfo.label}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block font-mono">Date Raised</label>
                                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <Calendar size={18} className="text-gray-400" />
                                    <span className="font-semibold">{new Date(ticket.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block font-mono">Customer Details</label>
                                <div className="border border-gray-100 rounded-lg overflow-hidden">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 border-b border-gray-100">
                                        <div className="bg-zinc-200 p-2 rounded-full">
                                            <User size={16} className="text-zinc-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-900 leading-none">{ticket.driver?.personalInformation?.fullName || 'Anonymous'}</p>
                                            <p className="text-xs text-zinc-500 mt-1">Driver Partner</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group cursor-pointer">
                                        <Phone size={16} className="text-green-500" />
                                        <span className="font-bold text-zinc-700">{ticket.driver?.phone || 'N/A'}</span>
                                        <ExternalLink size={12} className="ml-auto text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Issue Type */}
                    <div className="mb-8">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block font-mono">Issue Category</label>
                        <div className="bg-zinc-900 text-white p-4 rounded-xl shadow-lg shadow-zinc-200">
                            <h3 className="text-lg font-bold flex items-center gap-3">
                                <AlertCircle size={20} className="text-yellow-400" />
                                {ticket.problemType}
                            </h3>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 block font-mono italic">Description from Driver</label>
                        <p className="text-gray-700 leading-relaxed font-medium">
                            {ticket.description || "No description provided."}
                        </p>
                    </div>

                    {/* Media Attachments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Voice Recording */}
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 block font-mono flex items-center gap-2">
                                <Mic size={14} /> Voice Recording
                            </label>
                            {ticket.voiceRecording ? (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center gap-3 group">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                        <Mic size={24} />
                                    </div>
                                    <audio controls src={ticket.voiceRecording} className="w-full h-8 opacity-80" />
                                    <a
                                        href={ticket.voiceRecording}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-tight"
                                    >
                                        Open in New Tab
                                    </a>
                                </div>
                            ) : (
                                <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">No Voice Note</p>
                                </div>
                            )}
                        </div>

                        {/* Image Attachments */}
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 block font-mono flex items-center gap-2">
                                <Paperclip size={14} /> Attachments ({ticket.attachments?.length || 0})
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {ticket.attachments && ticket.attachments.length > 0 ? (
                                    ticket.attachments.map((url, idx) => (
                                        <a
                                            key={idx}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 hover:opacity-90 transition-opacity ring-2 ring-transparent hover:ring-black"
                                        >
                                            <img
                                                src={url}
                                                alt={`Attachment ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1">
                                                <p className="text-[8px] text-white text-center font-bold uppercase">Image {idx + 1}</p>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="col-span-2 p-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">No Attachments</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Close Preview
                    </button>
                    <button className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200">
                        Take Action
                    </button>
                </div>
            </div>
        </div>
    )
}
