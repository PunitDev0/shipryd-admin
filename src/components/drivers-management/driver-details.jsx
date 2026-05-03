'use client'

import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Home,
  Truck,
  CreditCard,
  Building,
  FileCheck,
  IndianRupee,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  XCircle,
  Zap,
  Star
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { apiProxy } from '@/lib/proxy'
import { formatDateIST } from '@/lib/utils'

export default function DriverProfile() {
  const params = useParams()
  const router = useRouter()
  const driverId = params.id

  const [driver, setDriver] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [personalFormData, setPersonalFormData] = useState({
    fullName: '',
    phone: '',
    gender: '',
    serviceRegion: '',
    currentFullAddress: ''
  })
  const [error, setError] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [subHistory, setSubHistory] = useState([])
  const [swapData, setSwapData] = useState(null)

  useEffect(() => {
    if (!driverId) return

    const fetchDriverDetails = async () => {
      setIsLoading(true)
      try {
        const { data, ok } = await apiProxy(`/api/driver/${driverId}`)

        if (ok && data.success) {
          setDriver(data.driver)
        } else {
          setError(data.message || 'Failed to fetch driver details')
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Connection error. Please ensure the backend is running.')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchSubscriptionData = async () => {
      try {
        const { data, ok } = await apiProxy(`/api/subscription/driver/${driverId}`)
        if (ok && data.success) {
          setSubHistory(data.subscriptions || [])
          setSubscription(data.activeSubscription || null)
        }
      } catch (err) {
        console.error('Subscription history fetch error:', err)
      }
    }

    const fetchSwapDetails = async () => {
      try {
        const { data, ok } = await apiProxy(`/api/batterySwap/driver/swapDetails/${driverId}`)
        if (ok && data.success) {
          setSwapData(data)
        }
      } catch (err) {
        console.error('Swap details fetch error:', err)
      }
    }

    fetchDriverDetails()
    fetchSubscriptionData()
    fetchSwapDetails()
  }, [driverId])

  const handleUpdate = async (updates) => {
    setIsUpdating(true)
    try {
      const { data, ok } = await apiProxy(`/api/driver/${driverId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })

      if (ok && data.success) {
        setDriver(data.driver)
        alert('Driver updated successfully!')
      } else {
        alert('Update failed: ' + (data.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Update error:', err)
      alert('Error updating driver. Please check your connection.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'rejected') {
      const reason = prompt('Please enter the reason for rejection:')
      if (!reason) return
      handleUpdate({ status: 'rejected', rejectedReason: reason })
    } else {
      if (confirm(`Are you sure you want to ${newStatus} this driver?`)) {
        handleUpdate({ status: newStatus })
      }
    }
  }

  const startEditingPersonal = () => {
    setPersonalFormData({
      fullName: driver.personalInformation?.fullName || '',
      phone: driver.phone || '',
      gender: driver.personalInformation?.gender || '',
      serviceRegion: driver.personalInformation?.serviceRegion || '',
      currentFullAddress: driver.personalInformation?.currentFullAddress || ''
    })
    setIsEditingPersonal(true)
  }

  const savePersonalChanges = async () => {
    const payload = {
      phone: personalFormData.phone,
      personalInformation: {
        ...driver.personalInformation,
        fullName: personalFormData.fullName,
        gender: personalFormData.gender,
        serviceRegion: personalFormData.serviceRegion,
        currentFullAddress: personalFormData.currentFullAddress
      }
    }
    await handleUpdate(payload)
    setIsEditingPersonal(false)
  }

  const handlePersonalInputChange = (e) => {
    const { name, value } = e.target
    setPersonalFormData(prev => ({ ...prev, [name]: value }))
  }

  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={48} className="animate-spin text-orange-500" />
        <p className="text-gray-500 font-medium">Loading Profile...</p>
      </div>
    )
  }

  if (error || !driver) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6 p-8">
        <XCircle size={48} className="text-red-500" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Driver Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'The requested driver profile does not exist.'}</p>
          <button onClick={() => router.back()} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const { personalInformation, aadhaarVerification, panVerification, bankDetails } = driver

  return (
    <div className="max-h-screen bg-gray-50/50 pb-12 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none">Driver Profile</h1>
            <p className="text-[10px] text-gray-500 font-mono mt-1">ID: {driver._id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {driver.status !== 'approved' && (
            <button
              onClick={() => handleStatusChange('approved')}
              disabled={isUpdating}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all flex items-center gap-2"
            >
              {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Approve Partner
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 pt-6 space-y-7">

        {/* Personal information */}
        <div className="bg-white rounded-lg border shadow-sm p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User size={18} className="text-gray-600" /> Personal information
            </h2>
            {!isEditingPersonal ? (
              <button
                onClick={startEditingPersonal}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
              >
                Edit Details
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditingPersonal(false)}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={savePersonalChanges}
                  disabled={isUpdating}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider flex items-center gap-1"
                >
                  {isUpdating ? <Loader2 size={12} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {!isEditingPersonal ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 text-sm">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-0.5">
                  <User size={15} /> Driver Full Name
                </div>
                <div className="font-medium">{personalInformation?.fullName || 'N/A'}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-0.5">
                  <Phone size={15} /> Phone Number
                </div>
                <div className="font-medium">{driver.phone || 'N/A'}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-0.5">
                  <User size={15} /> Gender
                </div>
                <div className="font-medium">{personalInformation?.gender || 'N/A'}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-0.5">
                  <Calendar size={15} /> Date of Birth
                </div>
                <div className="font-medium">
                  {formatDateIST(panVerification?.dateOfBirth, false)}
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <div className="flex items-center gap-2 text-gray-600 mb-0.5">
                  <Home size={15} /> Complete Address
                </div>
                <div className="font-medium leading-relaxed">
                  {personalInformation?.currentFullAddress || 'N/A'}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-0.5">
                  <Calendar size={15} /> Registration Date
                </div>
                <div className="font-medium">
                  {formatDateIST(driver.createdAt, false)}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-0.5">
                  <MapPin size={15} /> Region
                </div>
                <div className="font-medium">{personalInformation?.serviceRegion || 'N/A'}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={personalFormData.fullName}
                    onChange={handlePersonalInputChange}
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={personalFormData.phone}
                    onChange={handlePersonalInputChange}
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                  <select
                    name="gender"
                    value={personalFormData.gender}
                    onChange={handlePersonalInputChange}
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Service Region</label>
                  <input
                    type="text"
                    name="serviceRegion"
                    value={personalFormData.serviceRegion}
                    onChange={handlePersonalInputChange}
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Complete Address</label>
                <textarea
                  name="currentFullAddress"
                  value={personalFormData.currentFullAddress}
                  onChange={handlePersonalInputChange}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Current Status + Vehicle + Plan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan Box */}
          <div className="bg-white rounded-lg border shadow-sm p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <IndianRupee size={17} className="text-gray-700" /> Current Plan
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="capitalize">{subscription?.plan || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span>₹{subscription?.baseAmount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiry</span>
                <span className={`${subscription ? 'text-green-600' : 'text-orange-600'} font-medium`}>
                  {formatDateIST(subscription?.endDate, false)}
                </span>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border ${subscription
                  ? 'bg-green-50 text-green-600 border-green-100'
                  : 'bg-gray-50 text-gray-500 border-gray-100'
                  }`}>
                  <Clock size={14} /> {subscription ? 'Active' : 'No Active Plan'}
                </span>
              </div>
              {subscription?.endDate && (
                <div className="text-[10px] text-gray-400 mt-1 italic">
                  Remaining: {Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} days
                </div>
              )}
            </div>
          </div>

          {/* Vehicle */}
          <div className="bg-white rounded-lg border shadow-sm p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Truck size={17} className="text-gray-700" /> Vehicle information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle No.</span>
                <span className="font-mono">--</span>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 rounded text-xs font-medium border border-gray-100">
                  <Clock size={14} /> Unassigned
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg border shadow-sm p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileCheck size={17} className="text-gray-700" /> Account Status
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className={`flex items-center gap-2 ${driver.isProfileCompleted ? 'text-green-700' : 'text-amber-600'}`}>
                {driver.isProfileCompleted ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                KYC {driver.isProfileCompleted ? 'Completed' : 'Pending'}
              </div>
              <div className={`flex items-center gap-2 ${driver.swapStatus === 'unblocked' ? 'text-green-700' : 'text-red-700'}`}>
                {driver.swapStatus === 'unblocked' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                Battery Swap: {driver.swapStatus === 'unblocked' ? 'Active' : 'Locked'}
              </div>
              <div className={`flex items-center gap-2 ${driver.status === 'approved' ? 'text-green-700' : driver.status === 'rejected' ? 'text-red-700' : driver.status === 'deactivated' ? 'text-gray-700' : 'text-amber-600'}`}>
                {driver.status === 'approved' ? <CheckCircle2 size={16} /> : (driver.status === 'rejected' || driver.status === 'deactivated') ? <XCircle size={16} /> : <Clock size={16} />}
                {driver.status === 'approved' ? 'Account Verified' : driver.status === 'rejected' ? 'Profile Rejected' : driver.status === 'deactivated' ? 'Account Blocked' : 'Under Review'}
              </div>
              {driver.status !== 'approved' && driver.status !== 'deactivated' && (
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleStatusChange('approved')}
                    disabled={isUpdating}
                    className="flex-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider py-2 rounded hover:bg-emerald-100 transition-all"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    disabled={isUpdating}
                    className="flex-1 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-wider py-2 rounded hover:bg-red-100 transition-all"
                  >
                    Reject
                  </button>
                </div>
              )}
              {driver.status === 'approved' && (
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleStatusChange('deactivated')}
                    disabled={isUpdating}
                    className="flex-1 bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-wider py-2 rounded hover:bg-gray-200 transition-all"
                  >
                    Block Partner
                  </button>
                </div>
              )}
              {driver.status === 'deactivated' && (
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleStatusChange('approved')}
                    disabled={isUpdating}
                    className="flex-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider py-2 rounded hover:bg-emerald-100 transition-all"
                  >
                    Unblock Partner
                  </button>
                </div>
              )}
              {driver.rejectedReason && (
                <div className="mt-2 p-2 bg-red-50 rounded text-[10px] text-red-600 font-medium">
                  Reason: {driver.rejectedReason}
                </div>
              )}

              {/* Registration Fee Waiver Toggle */}
              <div className="pt-4 mt-2 border-t border-gray-100">
                <div className="flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700">Fee Waiver (₹1000)</span>
                    <span className="text-[10px] text-gray-400">Waive first-time extra payment</span>
                  </div>
                  <button
                    onClick={() => handleUpdate({ waiveRegistrationFee: !driver.waiveRegistrationFee })}
                    disabled={isUpdating}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all focus:outline-none ${driver.waiveRegistrationFee ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${driver.waiveRegistrationFee ? 'translate-x-5.5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <Phone size={18} className="text-gray-600" /> Emergency Contacts & References
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="border rounded-lg p-4">
              <div className="font-medium mb-2">Reference Contact 1</div>
              <div>{personalInformation?.emergencyReference1?.referenceName || 'N/A'}</div>
              <div className="text-gray-600 flex items-center gap-2 mt-1">
                <Phone size={15} /> {personalInformation?.emergencyReference1?.referencePhoneNumber || 'N/A'}
              </div>
              <div className="text-gray-400 text-[10px] uppercase font-bold mt-1 tracking-wider">
                Relation: {personalInformation?.emergencyReference1?.referenceRelation || 'N/A'}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="font-medium mb-2">Reference Contact 2</div>
              <div>{personalInformation?.emergencyReference2?.referenceName || 'N/A'}</div>
              <div className="text-gray-600 flex items-center gap-2 mt-1">
                <Phone size={15} /> {personalInformation?.emergencyReference2?.referencePhoneNumber || 'N/A'}
              </div>
              <div className="text-gray-400 text-[10px] uppercase font-bold mt-1 tracking-wider">
                Relation: {personalInformation?.emergencyReference2?.referenceRelation || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Banking */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <Building size={18} className="text-gray-600" /> Banking Information
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-gray-600 mb-1">Bank Name</div>
              <div className="font-medium">{bankDetails?.bankName || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Account Number</div>
              <div className="font-medium">
                {bankDetails?.accountNumber ? `*********${bankDetails.accountNumber.slice(-4)}` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">IFSC Code</div>
              <div className="font-medium uppercase">{bankDetails?.ifscCode || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <FileCheck size={18} className="text-gray-600" /> Identity Documents & Verification
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { label: 'Aadhaar Front', url: aadhaarVerification?.aadhaarFrontImage },
              { label: 'Aadhaar Back', url: aadhaarVerification?.aadhaarBackImage },
              { label: 'PAN Card', url: panVerification?.panCardImage }
            ].map((doc) => (
              <div key={doc.label} className="border rounded-lg overflow-hidden group">
                <div className="h-44 bg-gray-50 flex items-center justify-center text-gray-400 text-sm relative">
                  {doc.url ? (
                    <img src={doc.url} alt={doc.label} className="w-full h-full object-cover" />
                  ) : (
                    'Document missing'
                  )}
                </div>
                <div className="p-4 flex items-center justify-between bg-white">
                  <span className="font-medium text-sm">{doc.label}</span>
                  <div className="flex gap-2">
                    {doc.url && (
                      <button
                        onClick={() => window.open(doc.url, '_blank')}
                        className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Eye size={14} /> View
                      </button>
                    )}
                    <button className="px-3 py-1.5 text-xs bg-gray-800 text-white rounded hover:bg-gray-900 flex items-center gap-1">
                      <Download size={14} /> Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <History size={17} /> Account Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Plans Purchased</span>
                <span className="font-bold">{subHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Vehicles Assigned</span>
                <span className="font-bold">{driver.isOnline ? '01' : '00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Trips Completed</span>
                <span className="font-bold">{driver.totalTrips || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6 lg:col-span-1">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap size={17} className="text-orange-500" /> Overswapping Charges
            </h3>
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded border border-orange-100">
                <div className="text-xs text-orange-700 font-bold uppercase tracking-wider mb-1">Pending Charges</div>
                <div className="text-2xl font-bold text-orange-800">₹{swapData?.pendingExtraSwapCharges || 0}</div>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Extra Swaps</span>
                  <span className="font-bold">{swapData?.extraSwapCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate per Swap</span>
                  <span className="font-bold">₹65</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic">
                *First 3 swaps of the day are free. Each additional swap is charged at ₹65.
              </p>
            </div>
          </div>
        </div>

        {/* Subscription History */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History size={18} className="text-gray-600" /> Subscription History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3">Plan Name</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Amount Paid</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Payment ID</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subHistory.length > 0 ? subHistory.map((sub, sIdx) => (
                  <tr key={sub._id || sIdx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 capitalize">{sub.plan} Plan</td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDateIST(sub.startDate, false)} - {formatDateIST(sub.endDate, false)}
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600">₹{sub.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${sub.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                        sub.status === 'expired' ? 'bg-gray-50 text-gray-500 border-gray-100' :
                          sub.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-red-50 text-red-600 border-red-100'
                        }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-gray-400">{sub.razorpayPaymentId || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDateIST(sub.createdAt, false)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                      No subscription history found for this driver.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}