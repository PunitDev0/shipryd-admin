'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Search,
    RotateCcw,
    Plus,
    MoreVertical,
    Loader2,
    XCircle,
    Package,
    Edit,
    Trash2,
    Check,
    Download
} from 'lucide-react'
import { apiProxy } from '@/lib/proxy'
import { exportToExcel } from '@/lib/exportUtils'

export default function InventoryManagement() {
    const [inventory, setInventory] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    const handleExport = () => {
        const exportData = filteredInventory.map(item => ({
            'Part Name': item.name,
            'Category': item.category,
            'Price (INR)': item.price,
            'Stock Quantity': item.quantity,
            'Last Updated': new Date(item.updatedAt || Date.now()).toLocaleString()
        }));
        exportToExcel(exportData, 'Inventory_Report');
    };
    const [error, setError] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({ name: '', price: '', quantity: '', category: 'General' })

    const fetchInventory = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const { data, ok } = await apiProxy('/api/inventory')
            if (ok) {
                setInventory(data)
            } else {
                setError(data.message || 'Failed to fetch inventory')
            }
        } catch (err) {
            console.error('Fetch error:', err)
            setError('Connection error. Please ensure the backend is running.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchInventory()
    }, [fetchInventory])

    const handleSeed = async () => {
        if (!confirm('This will reset inventory with default parts. Continue?')) return
        setIsLoading(true)
        try {
            await apiProxy('/api/inventory/seed', { method: 'POST' })
            fetchInventory()
        } catch (err) {
            setError('Failed to seed data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const url = editingItem
            ? `/api/inventory/${editingItem._id}`
            : '/api/inventory'
        const method = editingItem ? 'PUT' : 'POST'

        try {
            const { data, ok } = await apiProxy(url, {
                method,
                body: JSON.stringify(formData),
            })
            if (ok) {
                setShowAddModal(false)
                setEditingItem(null)
                setFormData({ name: '', price: '', quantity: '', category: 'General' })
                fetchInventory()
            } else {
                alert(data.message || 'Failed to save item')
            }
        } catch (err) {
            setError('Failed to save item')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return
        try {
            const { ok, data } = await apiProxy(`/api/inventory/${id}`, { method: 'DELETE' })
            if (ok) {
                fetchInventory()
            } else {
                alert(data.message || 'Failed to delete item')
            }
        } catch (err) {
            setError('Failed to delete item')
        }
    }

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen p-2 bg-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold">Inventory Management</h1>
                    <p className="text-gray-500 text-sm">
                        Track spare parts, pricing, and stock levels
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSeed}
                        className="bg-white border border-gray-300 text-black px-4 py-2 text-sm flex items-center gap-2 shadow-sm hover:bg-gray-50 rounded transition-all"
                    >
                        <RotateCcw size={16} /> Seed Default Data
                    </button>
                    <button
                        onClick={() => {
                            setEditingItem(null)
                            setFormData({ name: '', price: '', quantity: '', category: 'General' })
                            setShowAddModal(true)
                        }}
                        className="bg-black text-white px-4 py-2 text-sm flex items-center gap-2 shadow-md hover:bg-zinc-800 rounded transition-all"
                    >
                        <Plus size={16} /> Add New Part
                    </button>
                </div>
            </div>

            {/* Search & Actions */}
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-72">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search Parts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-black rounded"
                    />
                </div>

                <div className="flex gap-4 text-gray-600">
                    <RotateCcw
                        size={20}
                        className={`cursor-pointer hover:text-black ${isLoading ? 'animate-spin' : ''}`}
                        onClick={fetchInventory}
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
                <div className="border-b border-gray-300 bg-gray-100 uppercase text-[11px] font-bold tracking-wider text-gray-600">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 w-[40%]">Part Name</th>
                                <th className="px-6 py-4 w-[20%]">Category</th>
                                <th className="px-6 py-4 w-[15%]">Price (₹)</th>
                                <th className="px-6 py-4 w-[15%]">Stock Qty</th>
                                <th className="px-6 py-4 w-[10%] text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                    </table>
                </div>

                <div className="flex-1 overflow-y-auto relative min-h-[400px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={40} className="animate-spin text-zinc-400" />
                                <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Syncing Inventory...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 gap-4">
                            <XCircle size={40} className="text-red-400" />
                            <p className="text-gray-500 font-medium">{error}</p>
                            <button onClick={fetchInventory} className="bg-black text-white px-4 py-2 text-xs rounded">Retry Fetch</button>
                        </div>
                    ) : filteredInventory.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8">
                            <Package size={40} className="text-gray-300 mb-2" />
                            <p className="text-gray-400 font-medium tracking-tight">No parts found</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <tbody>
                                {filteredInventory.map((item) => (
                                    <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 w-[40%] font-semibold text-zinc-900">{item.name}</td>
                                        <td className="px-6 py-4 w-[20%]">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 uppercase">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 w-[15%] font-bold text-zinc-900">₹{item.price.toLocaleString()}</td>
                                        <td className="px-6 py-4 w-[15%]">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.quantity < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {item.quantity} Units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 w-[10%] text-right pr-6 relative">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(item)
                                                        setFormData({ name: item.name, price: item.price, quantity: item.quantity, category: item.category })
                                                        setShowAddModal(true)
                                                    }}
                                                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
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

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white w-[400px] p-6 rounded-lg shadow-2xl border border-gray-300">
                        <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Part' : 'Add New Part'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Part Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-black"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-black"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-black"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-black"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-black text-white px-6 py-2 text-sm font-bold rounded hover:bg-zinc-800"
                                >
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
