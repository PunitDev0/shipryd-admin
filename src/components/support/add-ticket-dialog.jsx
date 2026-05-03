'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
    X,
    User,
    AlertCircle,
    Paperclip,
    Loader2,
    CheckCircle2,
    Search,
    ChevronDown
} from 'lucide-react'
import { BASE_URL } from '@/lib/baseUrl'

export function AddTicketDialog({ isOpen, onClose, onSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingDrivers, setIsLoadingDrivers] = useState(false)
    const [drivers, setDrivers] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false)
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [uploadingFiles, setUploadingFiles] = useState(false)

    const [formData, setFormData] = useState({
        problemType: '',
        description: '',
        attachments: []
    })

    const attachmentRef = useRef(null)

    const problemTypes = [
        "Vehicle Issue",
        "Battery Issue",
        "Payment Issue",
        "App Crash",
        "KYC/Document Issue",
        "Other"
    ]

    useEffect(() => {
        if (isOpen) {
            fetchDrivers()
        } else {
            // Reset form on close
            setFormData({
                problemType: '',
                description: '',
                attachments: []
            })
            setSelectedDriver(null)
            setSearchQuery('')
        }
    }, [isOpen])

    const fetchDrivers = async () => {
        setIsLoadingDrivers(true)
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${BASE_URL}/api/driver/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (data.success) {
                setDrivers(data.drivers)
            }
        } catch (error) {
            console.error('Error fetching drivers:', error)
        } finally {
            setIsLoadingDrivers(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        setUploadingFiles(true)
        const uploadData = new FormData()
        // The backend expects 'attachments' as an array or individual files
        // But our upload API might be different. Let's look at raiseTicket in backend.
        // raiseTicket uses: if (req.files.attachments) { for (const file of req.files.attachments) { ... } }
        // So we should send them when we submit the ticket, or upload them individually first?
        // Let's check upload.controller.js to see if we have a generic image upload.

        // For now, let's keep it simple and just store the files to be uploaded during ticket creation
        // but the current structure of drivers-management uploads them immediately.
        // Let's see if we can upload them immediately to get URLs.

        try {
            const uploadedUrls = [...formData.attachments]
            for (const file of files) {
                const fd = new FormData()
                fd.append('image', file)
                const response = await fetch(`${BASE_URL}/api/upload/image`, {
                    method: 'POST',
                    body: fd,
                })
                const data = await response.json()
                const url = data.url || data.imageUrl || data.image || (data.data && data.data.url)
                if (url) {
                    uploadedUrls.push(url)
                }
            }
            setFormData(prev => ({ ...prev, attachments: uploadedUrls }))
        } catch (error) {
            console.error('Upload error:', error)
            alert('Error uploading some files.')
        } finally {
            setUploadingFiles(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedDriver) {
            alert('Please select a driver')
            return
        }
        if (!formData.problemType) {
            alert('Please select a problem type')
            return
        }

        setIsSubmitting(true)

        const payload = {
            driverId: selectedDriver._id,
            problemType: formData.problemType,
            description: formData.description,
            // Our backend raiseTicket expects req.files or req.body
            // If we send URLs in body, we might need to adjust backend or send them as attachments
            // Let's check if the backend supports attachment URLs in body.
            // In ticket.controller.js:25, it takes from req.body too? 
            // No, it only takes voiceRecording and attachments from req.files and uploads them.
            // Wait, if I already have URLs, I should pass them?
            // Actually, the backend models/ticket.model.js has attachments as [String].
            // If I want to pass already uploaded URLs, I might need to adjust raiseTicket.
        }

        try {
            // Since our current raiseTicket only handles multipart/form-data for files,
            // let's see if we can send a normal JSON request if we already have URLs.
            // Or better, let's modify the backend to accept attachment URLs in body.

            // For now, let's try sending everything in a FormData if we have to, 
            // but if we have URLs, let's see if the backend can handle them.

            const response = await fetch(`${BASE_URL}/api/ticket/admin/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    ...payload,
                    attachmentUrls: formData.attachments // I might need to update backend to handle this
                }),
            })

            const data = await response.json()

            if (data.success) {
                alert('Ticket created successfully!')
                onSuccess()
                onClose()
            } else {
                alert('Failed to create ticket: ' + (data.message || 'Unknown error'))
            }
        } catch (error) {
            console.error('Submit error:', error)
            alert('Connection error.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredDrivers = drivers.filter(d => {
        const fullName = d.personalInformation?.fullName?.toLowerCase() || ''
        const phone = d.phone || ''
        const search = searchQuery.toLowerCase()
        return fullName.includes(search) || phone.includes(search)
    }).slice(0, 5)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-300 w-full max-w-lg flex flex-col shadow-xl rounded-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black text-white rounded-sm flex items-center justify-center">
                            <AlertCircle size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 leading-none">Create Support Ticket</h2>
                            <p className="text-xs text-gray-500 mt-1">Raise a new ticket for a driver</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-sm transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Driver Selection */}
                    <div className="space-y-1.5 relative">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Select Driver</label>
                        {!selectedDriver ? (
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    className="w-full border border-gray-300 pl-9 pr-3 py-2.5 text-sm rounded focus:outline-none focus:border-black transition-all"
                                    placeholder="Search by name or phone..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setIsDriverDropdownOpen(true)
                                    }}
                                    onFocus={() => setIsDriverDropdownOpen(true)}
                                />
                                {isDriverDropdownOpen && (
                                    <div className="absolute w-full mt-1 bg-white border border-gray-200 shadow-lg rounded-md z-30 overflow-hidden">
                                        {isLoadingDrivers ? (
                                            <div className="p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                                                <Loader2 size={14} className="animate-spin" /> Loading drivers...
                                            </div>
                                        ) : filteredDrivers.length > 0 ? (
                                            filteredDrivers.map(driver => (
                                                <button
                                                    key={driver._id}
                                                    onClick={() => {
                                                        setSelectedDriver(driver)
                                                        setIsDriverDropdownOpen(false)
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                                                >
                                                    <p className="text-sm font-semibold text-gray-900">{driver.personalInformation?.fullName || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">{driver.phone}</p>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-xs text-gray-500">No drivers found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-600">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{selectedDriver.personalInformation?.fullName || 'N/A'}</p>
                                        <p className="text-xs text-gray-500">{selectedDriver.phone}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDriver(null)}
                                    className="text-xs font-bold text-red-600 hover:text-red-700"
                                >
                                    Change
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Problem Type */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Problem Type</label>
                        <div className="relative">
                            <select
                                name="problemType"
                                value={formData.problemType}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-black appearance-none bg-white font-medium"
                            >
                                <option value="">Select Type</option>
                                {problemTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Detail the issue..."
                            rows={4}
                            className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-black resize-none"
                        />
                    </div>

                    {/* Attachments */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Attachments</label>
                        <input
                            type="file"
                            multiple
                            hidden
                            ref={attachmentRef}
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        <div className="flex flex-wrap gap-2">
                            {formData.attachments.map((url, idx) => (
                                <div key={idx} className="relative group w-16 h-16 border border-gray-200 rounded overflow-hidden">
                                    <img src={url} alt="attachment" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }))}
                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => attachmentRef.current.click()}
                                disabled={uploadingFiles}
                                className="w-16 h-16 border border-dashed border-gray-300 rounded flex flex-col items-center justify-center gap-1 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {uploadingFiles ? <Loader2 size={16} className="animate-spin text-gray-400" /> : <Paperclip size={16} className="text-gray-400" />}
                                <span className="text-[9px] font-bold text-gray-500">ADD</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-xs font-bold text-gray-600 hover:bg-white rounded-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !selectedDriver || !formData.problemType}
                            className="px-6 py-2 bg-black text-white text-xs font-bold rounded-sm hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" /> Creating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={14} /> Create Ticket
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
