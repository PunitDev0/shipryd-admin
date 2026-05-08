'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Plus, UserPlus, Trash2, XCircle } from 'lucide-react'
import { apiProxy } from '@/lib/proxy'

const SIDEBAR_MODULES = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'vehicleReturn', label: 'Vehicle Return' },
    { id: 'batterySwaps', label: 'Battery Swaps' },
    { id: 'vehicleLifecycle', label: 'Vehicle Lifecycle' },
    { id: 'payments', label: 'Payments' },
    { id: 'companies', label: 'Companies' },
    { id: 'helpCenter', label: 'Help Center' },
    { id: 'notification', label: 'Notification' },
    { id: 'adminUsers', label: 'Admin Users' },
    { id: 'maintenance', label: 'Maintenance' },
]

export default function AdminUsersPage() {
    const [admins, setAdmins] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'admin',
        permissions: SIDEBAR_MODULES.reduce((acc, mod) => ({ ...acc, [mod.id]: mod.id === 'dashboard' }), {})
    })

    useEffect(() => {
        fetchAdmins()
    }, [])

    const fetchAdmins = async () => {
        try {
            const { data, ok } = await apiProxy('/api/admin/users/all')
            if (ok) {
                setAdmins(data.users)
            }
        } catch (error) {
            console.error('Error fetching admins:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleTogglePermission = (adminId, moduleId) => {
        const updatedAdmins = admins.map(admin => {
            if (admin._id === adminId) {
                const updatedPermissions = {
                    ...admin.permissions,
                    [moduleId]: !admin.permissions[moduleId]
                }
                updateAdminOnServer(adminId, { permissions: updatedPermissions })
                return { ...admin, permissions: updatedPermissions }
            }
            return admin
        })
        setAdmins(updatedAdmins)
    }

    const updateAdminOnServer = async (id, payload) => {
        try {
            await apiProxy(`/api/admin/users/update/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            })
        } catch (error) {
            console.error('Error updating admin:', error)
        }
    }

    const handleCreateAdmin = async (e) => {
        e.preventDefault()
        try {
            const { data, ok } = await apiProxy('/api/admin/users/create', {
                method: 'POST',
                body: JSON.stringify(formData)
            })
            if (ok) {
                setShowAddModal(false)
                fetchAdmins()
                setFormData({
                    fullName: '',
                    email: '',
                    password: '',
                    role: 'admin',
                    permissions: SIDEBAR_MODULES.reduce((acc, mod) => ({ ...acc, [mod.id]: mod.id === 'dashboard' }), {})
                })
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error creating admin:', error)
        }
    }

    const handleDeleteAdmin = async (id) => {
        if (!window.confirm('Are you sure you want to delete this admin?')) return
        try {
            const { data, ok } = await apiProxy(`/api/admin/users/delete/${id}`, {
                method: 'DELETE'
            })
            if (ok) {
                fetchAdmins()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error('Error deleting admin:', error)
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin User Management</h1>
                        <p className="text-gray-500 mt-1 text-sm">Manage administrators and their module access.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                        <UserPlus size={18} />
                        Add New Admin
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading administrators...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {admins.map((admin) => (
                            <div key={admin._id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                                {/* Admin Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-50">
                                    <div>
                                        <p className="font-semibold text-gray-900">{admin.fullName}</p>
                                        <p className="text-sm text-gray-500">{admin.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${admin.role === 'super-admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {admin.role}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteAdmin(admin._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Account"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                {/* Permissions Grid */}
                                <div className="p-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Permissions</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                                        {SIDEBAR_MODULES.map((mod) => (
                                            <label key={mod.id} className="flex items-center gap-2 cursor-pointer group">
                                                <div className="relative flex-shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={admin.permissions?.[mod.id] || false}
                                                        onChange={() => handleTogglePermission(admin._id, mod.id)}
                                                    />
                                                    <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-yellow-400"></div>
                                                </div>
                                                <span className="text-[11px] text-gray-600 truncate">{mod.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Admin Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Add New Administrator</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAdmin}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all"
                                        placeholder="e.g. Rahul Sharma"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all"
                                        placeholder="admin@shipryd.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all"
                                        placeholder="********"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                                    <select
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="admin">Administrator</option>
                                        <option value="super-admin">Super Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-all shadow-md shadow-yellow-200"
                                >
                                    Create Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
