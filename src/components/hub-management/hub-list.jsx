'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, MapPin, Building, Phone, User, Edit, Trash2, Loader2, Warehouse } from 'lucide-react'
import { BASE_URL } from '@/lib/baseUrl'

export default function HubList() {
    const [hubs, setHubs] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newHub, setNewHub] = useState({
        name: '',
        location: '',
        city: '',
        description: '',
        contactPerson: '',
        contactPhone: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchHubs()
    }, [])

    const fetchHubs = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${BASE_URL}/api/hub/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (data.success) {
                setHubs(data.hubs)
            }
        } catch (error) {
            console.error('Error fetching hubs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateHub = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${BASE_URL}/api/hub/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newHub)
            })
            const data = await response.json()
            if (data.success) {
                alert('Hub created successfully!')
                setIsCreateModalOpen(false)
                setNewHub({
                    name: '',
                    location: '',
                    city: '',
                    description: '',
                    contactPerson: '',
                    contactPhone: ''
                })
                fetchHubs()
            } else {
                alert(data.message || 'Error creating hub')
            }
        } catch (error) {
            console.error('Create error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteHub = async (id) => {
        if (!confirm('Are you sure you want to delete this hub?')) return
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${BASE_URL}/api/hub/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (data.success) {
                alert('Hub deleted!')
                fetchHubs()
            } else {
                alert(data.message || 'Check if vehicles are assigned to this hub')
            }
        } catch (error) {
            console.error('Delete error:', error)
        }
    }

    const filteredHubs = hubs.filter(hub => 
        hub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hub.city.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-3 italic uppercase tracking-tighter">
                        <Warehouse className="text-orange-500" /> Hub Management
                    </h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage vehicle distribution centers</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-black text-white px-6 py-2.5 rounded-none text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2"
                >
                    <Plus size={16} strokeWidth={3} /> Add New Hub
                </button>
            </div>

            <div className="bg-white border p-4 flex items-center gap-3">
                <Search size={18} className="text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by hub name or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm font-medium"
                />
            </div>

            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-orange-500" />
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Loading Hubs...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHubs.map(hub => (
                        <div key={hub._id} className="bg-white border group hover:border-black transition-all">
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900">{hub.name}</h3>
                                    <div className="flex gap-2">
                                        <button className="text-gray-400 hover:text-black transition-colors"><Edit size={16} /></button>
                                        <button 
                                            onClick={() => handleDeleteHub(hub._id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs font-medium text-gray-500">
                                    <div className="flex items-start gap-2">
                                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                                        <span>{hub.location}, {hub.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="flex-shrink-0" />
                                        <span>{hub.contactPerson || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-900 font-bold">
                                        <Phone size={14} className="flex-shrink-0" />
                                        <span>{hub.contactPhone || 'N/A'}</span>
                                    </div>
                                </div>

                                {hub.description && (
                                    <p className="text-[10px] text-gray-400 italic line-clamp-2 pt-2 border-t">{hub.description}</p>
                                )}
                            </div>
                            <div className="bg-zinc-50 px-5 py-3 border-t flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${hub.status === 'active' ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                    {hub.status}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    Vehicles: {hub.vehiclesCount || 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Hub Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-5 border-b bg-zinc-900 text-white flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-widest">Register New Hub</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-white uppercase text-[10px] font-black">Close</button>
                        </div>
                        <form onSubmit={handleCreateHub} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Hub Name</label>
                                <input 
                                    required
                                    className="w-full border-2 border-zinc-100 p-3 text-sm font-bold focus:outline-none focus:border-orange-500 transition-all"
                                    placeholder="e.g. DL-01 HUB"
                                    value={newHub.name}
                                    onChange={e => setNewHub({...newHub, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-0.5">City</label>
                                    <input 
                                        required
                                        className="w-full border-2 border-zinc-100 p-3 text-sm font-bold focus:outline-none focus:border-orange-500 transition-all"
                                        placeholder="Gurugram"
                                        value={newHub.city}
                                        onChange={e => setNewHub({...newHub, city: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Contact Phone</label>
                                    <input 
                                        className="w-full border-2 border-zinc-100 p-3 text-sm font-bold focus:outline-none focus:border-orange-500 transition-all"
                                        placeholder="+91 98XXX XXXX"
                                        value={newHub.contactPhone}
                                        onChange={e => setNewHub({...newHub, contactPhone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Full Address/Location</label>
                                <textarea 
                                    required
                                    rows={2}
                                    className="w-full border-2 border-zinc-100 p-3 text-sm font-bold focus:outline-none focus:border-orange-500 transition-all resize-none"
                                    placeholder="Complete hub address..."
                                    value={newHub.location}
                                    onChange={e => setNewHub({...newHub, location: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-0.5">In-charge Person</label>
                                <input 
                                    className="w-full border-2 border-zinc-100 p-3 text-sm font-bold focus:outline-none focus:border-orange-500 transition-all"
                                    placeholder="Name of manager"
                                    value={newHub.contactPerson}
                                    onChange={e => setNewHub({...newHub, contactPerson: e.target.value})}
                                />
                            </div>
                            <button 
                                disabled={isSubmitting}
                                type="submit" 
                                className="w-full bg-orange-500 text-white py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm Registration'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
