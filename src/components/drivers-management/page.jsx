'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  RotateCcw,
  Plus,
  Upload,
  Download,
  MoreVertical,
  Phone,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  Check,
  Loader2,
  ChevronRight,
  MapPin,
  Eye,
  Trash2
} from 'lucide-react'
import { AddDriverDialog } from './add-driver-dialog'
import Link from 'next/link'
import { exportToExcel } from '@/lib/exportUtils'

import { apiProxy } from '@/lib/proxy'

export default function DriversPage() {
  const [openDropdown, setOpenDropdown] = useState(null)
  const [showAddDriver, setShowAddDriver] = useState(false)
  const [drivers, setDrivers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)

  const handleDeleteDriver = async (id, name) => {
    if (!confirm(`Are you sure you want to delete driver ${name}? This action cannot be undone.`)) return;

    try {
      const { data, ok } = await apiProxy(`/api/driver/${id}`, {
        method: 'DELETE'
      });

      if (ok && data.success) {
        alert("Driver deleted successfully");
        fetchDrivers(); // Refresh list
      } else {
        alert(data.message || "Failed to delete driver");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error connecting to server");
    }
  };

  const handleBlockDriver = async (id, currentStatus) => {
    const newStatus = currentStatus === 'deactivated' ? 'approved' : 'deactivated';
    const actionName = currentStatus === 'deactivated' ? 'unblock' : 'block';

    if (!confirm(`Are you sure you want to ${actionName} this driver?`)) return;

    try {
      const { data, ok } = await apiProxy(`/api/driver/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      if (ok && data.success) {
        alert(`Driver ${actionName}ed successfully`);
        fetchDrivers();
      } else {
        alert(data.message || `Failed to ${actionName} driver`);
      }
    } catch (err) {
      console.error("Block error:", err);
      alert("Error connecting to server");
    }
  };

  const handleExport = () => {
    const exportData = filteredDrivers.map(d => ({
      'Full Name': d.personalInformation?.fullName || 'N/A',
      'Phone': d.phone || 'N/A',
      'Zone': d.personalInformation?.zone?.name || d.personalInformation?.serviceRegion || '--',
      'Status': d.status,
      'Wallet Balance': d.walletBalance || 0,
      'Rating': d.rating || '0.0',
      'KYC Completed': d.isProfileCompleted ? 'YES' : 'NO',
      'Active Sub': d.activeSubscription ? 'YES' : 'NO',
      'Joined Date': d.createdAt ? new Date(d.createdAt).toLocaleString() : '--'
    }));
    exportToExcel(exportData, 'Drivers_Report');
  };

  // Fetch Drivers from API
  const fetchDrivers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, ok } = await apiProxy('/api/driver/all')

      if (ok && data.success) {
        setDrivers(data.drivers)
      } else {
        setError(data.message || 'Failed to fetch drivers')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Connection error. Please ensure the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700 rounded">
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-700 rounded">
            Rejected
          </span>
        )
      case 'deactivated':
        return (
          <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 rounded">
            Blocked
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded">
            Pending
          </span>
        )
    }
  }

  const filteredDrivers = drivers.filter(driver =>
    driver.personalInformation?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.phone?.includes(searchQuery) ||
    driver.personalInformation?.serviceRegion?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen p-2 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Driver Management</h1>
          <p className="text-gray-500 text-sm">
            Manage fleet partners, compliance and operational status
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAddDriver(true)}
            className="bg-black text-white px-4 py-2 text-sm flex items-center gap-2 shadow-md hover:bg-zinc-800 rounded transition-all"
          >
            <Plus size={16} /> Add New Driver
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
            placeholder="Search Driver"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-black rounded"
          />
        </div>

        <div className="flex gap-4 text-gray-600">
          <RotateCcw
            size={20}
            className={`cursor-pointer hover:text-black ${isLoading ? 'animate-spin' : ''}`}
            onClick={fetchDrivers}
          />
          <Download
            size={20}
            className="cursor-pointer hover:text-black"
            onClick={handleExport}
            title="Export to Excel"
          />
          <Plus
            size={20}
            className="cursor-pointer hover:text-black"
            onClick={() => setShowAddDriver(true)}
          />
          <Upload size={20} className="cursor-pointer hover:text-black" />
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="bg-white border border-gray-300 flex flex-col h-[75vh] rounded-sm overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-300 bg-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-semibold text-gray-700">
                <th className="px-4 py-3 w-[16%]">Driver ID / Name</th>
                <th className="px-4 py-3 w-[10%]">Contact</th>
                <th className="px-4 py-3 w-[10%]">Zone</th>
                <th className="px-4 py-3 w-[12%] text-center">Status</th>
                <th className="px-4 py-3 w-[12%] text-center">Subscription</th>
                <th className="px-4 py-3 w-[12%]">Compliance</th>
                <th className="px-4 py-3 w-[10%]">Wallet</th>
                <th className="px-4 py-3 w-[8%] text-center">Rating</th>
                <th className="px-4 py-3 w-[10%] text-right pr-6">Actions</th>
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
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Syncing Driver Data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center p-8 gap-4">
              <XCircle size={40} className="text-red-400" />
              <p className="text-gray-500 font-medium">{error}</p>
              <button onClick={fetchDrivers} className="bg-black text-white px-4 py-2 text-xs rounded">Retry Fetch</button>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <p className="text-gray-400 font-medium tracking-tight">No drivers found matches your search</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {filteredDrivers.map((driver, index) => (
                  <tr
                    key={driver._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 w-[18%]">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900">{driver.personalInformation?.fullName || 'N/A'}</span>
                        <span className="text-[10px] text-zinc-400 font-mono tracking-tight">{driver._id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 w-[12%]">
                      <span className="font-medium text-zinc-700">{driver.phone}</span>
                    </td>
                    <td className="px-4 py-4 w-[12%]">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 uppercase">
                        {driver.personalInformation?.zone?.name || driver.personalInformation?.serviceRegion || '--'}
                      </span>
                    </td>
                    <td className="px-4 py-4 w-[12%] text-center">
                      {getStatusBadge(driver.status)}
                    </td>
                    <td className="px-4 py-4 w-[12%] text-center">
                      {driver.activeSubscription ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded border border-green-200">
                            Active
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            {Math.max(0, Math.ceil((new Date(driver.activeSubscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} days left
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 w-[12%]">
                      <div className="flex items-center gap-2">
                        {driver.isProfileCompleted ? (
                          <Check size={14} className="text-green-600 bg-green-100 rounded-full p-0.5" />
                        ) : (
                          <Clock size={14} className="text-amber-600 bg-amber-100 rounded-full p-0.5" />
                        )}
                        <span className={`text-[11px] font-semibold ${driver.isProfileCompleted ? 'text-green-700' : 'text-amber-700'}`}>
                          {driver.isProfileCompleted ? 'Verified' : 'Pending KYC'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 w-[10%] font-bold text-zinc-900">
                      ₹{driver.walletBalance?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-4 w-[8%] text-center">
                      <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">
                        <Star size={12} className="text-orange-400 fill-orange-400" />
                        {driver.rating || '0.0'}
                      </div>
                    </td>
                    <td className="px-4 py-4 w-[10%] text-right pr-6 relative">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          href={`/drivers/${driver._id}/details`}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-black"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>

                      {openDropdown === index && (
                        <div className="absolute right-6 mt-2 w-32 bg-white border border-gray-300 shadow-xl z-20 rounded-md overflow-hidden py-1 text-left">
                          <Link href={`/drivers/${driver._id}/details`} className="block w-full px-4 py-2 hover:bg-gray-100 text-[11px] font-bold text-gray-700">
                            Audit Details
                          </Link>
                          <button
                            onClick={() => {
                              handleBlockDriver(driver._id, driver.status);
                              setOpenDropdown(null);
                            }}
                            className="block w-full px-4 py-2 text-red-600 hover:bg-red-50 text-[11px] font-bold border-t border-gray-100 mt-1 flex items-center gap-2"
                          >
                            {driver.status === 'deactivated' ? 'Unblock Partner' : 'Block Partner'}
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteDriver(driver._id, driver.personalInformation?.fullName);
                              setOpenDropdown(null);
                            }}
                            className="block w-full px-4 py-2 text-red-700 hover:bg-red-100 text-[11px] font-bold border-t border-gray-100 flex items-center gap-2"
                          >
                            <Trash2 size={12} />
                            Delete Driver
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
          <p className="text-gray-500 font-medium">Total {filteredDrivers.length} Delivery Partners</p>

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

      <AddDriverDialog
        isOpen={showAddDriver}
        onClose={() => {
          setShowAddDriver(false)
          fetchDrivers()
        }}
      />
    </div>
  )
}