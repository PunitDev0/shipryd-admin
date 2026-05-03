'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Search, Plus, Trash2, Loader2, User, Package } from 'lucide-react'
import { apiProxy } from '@/lib/proxy'

export function CreateTicketModal({ isOpen, onClose, ticket }) {
    const [drivers, setDrivers] = useState([])
    const [inventory, setInventory] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const driverDropdownRef = useRef(null)

    const [selectedDriver, setSelectedDriver] = useState('')
    const [selectedParts, setSelectedParts] = useState([]) // Array of { partId: '', quantity: 1, name: '', price: 0 }
    const [notes, setNotes] = useState('')
    const [error, setError] = useState(null)
    const [driverSearch, setDriverSearch] = useState('')
    const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (driverDropdownRef.current && !driverDropdownRef.current.contains(event.target)) {
                setIsDriverDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (isOpen) {
            setDriverSearch('')
            setIsDriverDropdownOpen(false)
            fetchData()
            if (ticket) {
                setSelectedDriver(ticket.driver?._id || ticket.driver || '')
                setSelectedParts(ticket.parts.map(p => ({
                    partId: p.part?._id || p.part,
                    quantity: p.quantity,
                    name: p.part?.name || '',
                    price: p.priceAtIssue || 0
                })))
                setNotes(ticket.notes || '')
            } else {
                setSelectedDriver('')
                setSelectedParts([])
                setNotes('')
            }
        }
    }, [isOpen, ticket])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [driversRes, inventoryRes] = await Promise.all([
                apiProxy('/api/driver/all'),
                apiProxy('/api/inventory')
            ])

            if (driversRes.ok) setDrivers(driversRes.data.drivers)
            if (inventoryRes.ok) setInventory(inventoryRes.data)
        } catch (err) {
            setError('Failed to load data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddPart = () => {
        setSelectedParts([...selectedParts, { partId: '', quantity: 1, name: '', price: 0 }])
    }

    const handleRemovePart = (index) => {
        setSelectedParts(selectedParts.filter((_, i) => i !== index))
    }

    const handlePartChange = (index, partId) => {
        const part = inventory.find(i => i._id === partId)
        const newParts = [...selectedParts]
        newParts[index] = {
            partId,
            quantity: 1,
            name: part?.name || '',
            price: part?.price || 0,
            maxQty: part?.quantity || 0
        }
        setSelectedParts(newParts)
    }

    const handleQtyChange = (index, qty) => {
        const newParts = [...selectedParts]
        newParts[index].quantity = parseInt(qty) || 1
        setSelectedParts(newParts)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedDriver) {
            setError('Please select a driver')
            return
        }
        if (selectedParts.length === 0 || selectedParts.some(p => !p.partId)) {
            setError('Please add at least one valid part')
            return
        }

        setIsLoading(true)
        setError(null)
        const url = ticket ? `/api/maintenance-ticket/${ticket._id}` : '/api/maintenance-ticket'
        const method = ticket ? 'PUT' : 'POST'

        try {
            const { data, ok } = await apiProxy(url, {
                method,
                body: JSON.stringify({
                    driverId: selectedDriver,
                    parts: selectedParts.map(p => ({ partId: p.partId, quantity: p.quantity })),
                    notes
                }),
            })

            if (ok) {
                onClose()
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to process request')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-gray-300 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900">{ticket ? 'Edit Service Ticket' : 'Raise Service Ticket'}</h2>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Issue parts to delivery partner</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Driver Selection */}
                    <div className="space-y-2 relative" ref={driverDropdownRef}>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <User size={14} /> Select Driver
                        </label>

                        <div
                            onClick={() => setIsDriverDropdownOpen(!isDriverDropdownOpen)}
                            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all cursor-pointer bg-white flex justify-between items-center"
                        >
                            <span className={selectedDriver ? "text-zinc-900 font-medium" : "text-gray-400"}>
                                {selectedDriver
                                    ? `${drivers.find(d => d._id === selectedDriver)?.personalInformation?.fullName} (${drivers.find(d => d._id === selectedDriver)?.phone})`
                                    : "Choose a driver..."
                                }
                            </span>
                            <Search size={16} className="text-gray-400" />
                        </div>

                        {isDriverDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                <div className="p-2 border-b border-gray-100 bg-gray-50">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or phone..."
                                            value={driverSearch}
                                            onChange={(e) => setDriverSearch(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-black"
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {drivers
                                        .filter(d =>
                                            d.personalInformation?.fullName?.toLowerCase().includes(driverSearch.toLowerCase()) ||
                                            d.phone?.includes(driverSearch)
                                        )
                                        .map(d => (
                                            <div
                                                key={d._id}
                                                onClick={() => {
                                                    setSelectedDriver(d._id)
                                                    setIsDriverDropdownOpen(false)
                                                    setDriverSearch('')
                                                }}
                                                className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 flex flex-col ${selectedDriver === d._id ? 'bg-black text-white hover:bg-black' : 'text-zinc-700'}`}
                                            >
                                                <span className="font-bold">{d.personalInformation?.fullName}</span>
                                                <span className={`text-[11px] ${selectedDriver === d._id ? 'text-zinc-400' : 'text-gray-500'}`}>{d.phone}</span>
                                            </div>
                                        ))
                                    }
                                    {drivers.filter(d =>
                                        d.personalInformation?.fullName?.toLowerCase().includes(driverSearch.toLowerCase()) ||
                                        d.phone?.includes(driverSearch)
                                    ).length === 0 && (
                                            <div className="p-4 text-center text-gray-400 text-sm italic">
                                                No drivers found matching "{driverSearch}"
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Parts Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Package size={14} /> Parts to Issue
                            </label>
                            <button
                                type="button"
                                onClick={handleAddPart}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <Plus size={14} /> Add Part
                            </button>
                        </div>

                        <div className="space-y-3">
                            {selectedParts.map((part, index) => (
                                <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                                    <div className="flex-1">
                                        <select
                                            required
                                            value={part.partId}
                                            onChange={(e) => handlePartChange(index, e.target.value)}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:border-black outline-none"
                                        >
                                            <option value="">Select Part...</option>
                                            {inventory.map(i => (
                                                <option key={i._id} value={i._id} disabled={selectedParts.some((p, pIdx) => p.partId === i._id && pIdx !== index)}>
                                                    {i.name} (₹{i.price} | Stock: {i.quantity})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Qty"
                                            value={part.quantity}
                                            onChange={(e) => handleQtyChange(index, e.target.value)}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:border-black outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePart(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}

                            {selectedParts.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                                    <p className="text-sm text-gray-400">No parts added yet. Click "Add Part" to start.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total Calculation */}
                    {selectedParts.length > 0 && selectedParts.some(p => p.partId) && (
                        <div className="bg-zinc-900 rounded-xl p-4 text-white flex justify-between items-center shadow-lg">
                            <div>
                                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Estimated Total</p>
                                <p className="text-2xl font-black">₹{selectedParts.reduce((acc, p) => acc + (p.price * p.quantity), 0).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{selectedParts.length} Items Selected</p>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Additional Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Record any details about the repair or part condition..."
                            className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:border-black outline-none min-h-[100px] resize-none"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-zinc-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-black text-white px-8 py-2.5 text-sm font-bold rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-xl shadow-black/10 active:scale-95 transition-all"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : (ticket ? 'Update Ticket' : 'Confirm & Create Ticket')}
                    </button>
                </div>
            </div>
        </div>
    )
}
