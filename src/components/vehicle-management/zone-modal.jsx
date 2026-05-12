'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Search, Loader2, Edit, Trash2 } from 'lucide-react'
import { BASE_URL } from '@/lib/baseUrl'

export function ZoneModal({ isOpen, onClose }) {
    const [zones, setZones] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingZone, setEditingZone] = useState(null)
    const [formData, setFormData] = useState({ name: '', description: '' })

    useEffect(() => {
        if (isOpen) {
            fetchZones()
        }
    }, [isOpen])

    const fetchZones = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${BASE_URL}/api/zone`)
            const data = await response.json()
            if (data.success && Array.isArray(data.data)) {
                setZones(data.data)
            } else if (Array.isArray(data)) {
                setZones(data)
            } else if (data.success && Array.isArray(data.zones)) {
                setZones(data.zones)
            }
        } catch (error) {
            console.error('Error fetching zones:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const url = editingZone ? `${BASE_URL}/api/zone/${editingZone._id}` : `${BASE_URL}/api/zone`
            const method = editingZone ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                fetchZones()
                setShowForm(false)
                setFormData({ name: '', description: '' })
                setEditingZone(null)
            }
        } catch (error) {
            console.error('Error saving zone:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this zone?')) return
        try {
            const response = await fetch(`${BASE_URL}/api/zone/${id}`, { method: 'DELETE' })
            if (response.ok) {
                fetchZones()
            }
        } catch (error) {
            console.error('Error deleting zone:', error)
        }
    }

    const filteredZones = zones.filter(zone =>
        zone.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50 text-zinc-800">
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Zone Management</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b bg-white flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter zones..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border p-2 pl-9 text-sm focus:outline-none focus:border-black"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingZone(null)
                            setFormData({ name: '', description: '' })
                            setShowForm(!showForm)
                        }}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${showForm ? 'bg-black text-white' : 'bg-white text-black border-black hover:bg-gray-50'
                            }`}
                    >
                        {showForm ? 'Cancel' : <><Plus size={14} /> New Zone</>}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-[400px]">
                    {showForm ? (
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                                {editingZone ? 'Edit Operational Zone' : 'Create Operational Zone'}
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Zone Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border p-2 text-sm focus:outline-none focus:border-black bg-gray-50"
                                        placeholder="e.g. North Sector 1"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border p-2 text-sm focus:outline-none focus:border-black bg-gray-50 min-h-[100px]"
                                        placeholder="Add operational details..."
                                    />
                                </div>
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save Zone Configuration'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-2 space-y-1 bg-gray-50 min-h-full">
                            {isLoading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 size={32} className="animate-spin text-gray-300" />
                                </div>
                            ) : filteredZones.length === 0 ? (
                                <div className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    No zones registered
                                </div>
                            ) : (
                                filteredZones.map((zone) => (
                                    <div key={zone._id} className="bg-white border p-4 flex justify-between items-center group transition-colors hover:border-black">
                                        <div>
                                            <h4 className="font-bold text-sm text-zinc-800">{zone.name}</h4>
                                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{zone.description || 'No description provided'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingZone(zone)
                                                    setFormData({ name: zone.name, description: zone.description || '' })
                                                    setShowForm(true)
                                                }}
                                                className="p-2 hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(zone._id)}
                                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-100 flex justify-end">
                    <button onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
