'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  Upload,
  User,
  FileText,
  CreditCard,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  MapPin,
  Calendar
} from 'lucide-react'

import { BASE_URL } from '@/lib/baseUrl'
import { apiProxy } from '@/lib/proxy'

export function AddDriverDialog({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingField, setUploadingField] = useState(null)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: '',
    serviceRegion: '',
    currentFullAddress: '',
    aadhaarNumber: '',
    aadhaarFrontImage: '',
    aadhaarBackImage: '',
    panNumber: '',
    dateOfBirth: '',
    panCardImage: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    ref1Name: '',
    ref1Relation: '',
    ref1Phone: '',
    ref2Name: '',
    ref2Relation: '',
    ref2Phone: '',
    userAgreement: false,
    zoneId: ''
  })

  const [zones, setZones] = useState([])

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const { data, ok } = await apiProxy('/api/zone')
        console.log('Fetched Zones:', data) // Debugging help

        if (ok && data.success && Array.isArray(data.data)) {
          setZones(data.data)
        } else if (data.success && Array.isArray(data.zones)) {
          setZones(data.zones)
        } else if (Array.isArray(data)) {
          setZones(data)
        } else {
          setZones([])
        }
      } catch (error) {
        console.error('Error fetching zones:', error)
      }
    }

    if (isOpen) {
      fetchZones()
    }
  }, [isOpen])

  const aadhaarFrontRef = useRef(null)
  const aadhaarBackRef = useRef(null)
  const panRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingField(fieldName)
    const uploadData = new FormData()
    uploadData.append('image', file)

    try {
      const response = await fetch(`${BASE_URL}/api/upload/image`, {
        method: 'POST',
        body: uploadData,
      })
      const data = await response.json()
      const url = data.url || data.imageUrl || data.image || (data.data && data.data.url);

      if (response.ok && url) {
        setFormData(prev => ({ ...prev, [fieldName]: url }))
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading image.')
    } finally {
      setUploadingField(null)
    }
  }

  const handleSubmit = async () => {
    if (!formData.userAgreement) {
      alert('Please accept the User Agreement to continue')
      return
    }

    setIsSubmitting(true)

    const payload = {
      phone: formData.phone,
      personalInformation: {
        fullName: formData.fullName,
        gender: formData.gender,
        serviceRegion: formData.serviceRegion,
        currentFullAddress: formData.currentFullAddress,
        emergencyReference1: {
          referenceName: formData.ref1Name,
          referenceRelation: formData.ref1Relation,
          referencePhoneNumber: formData.ref1Phone
        },
        emergencyReference2: {
          referenceName: formData.ref2Name,
          referenceRelation: formData.ref2Relation,
          referencePhoneNumber: formData.ref2Phone
        },
        zone: formData.zoneId
      },
      aadhaarVerification: {
        aadhaarNumber: formData.aadhaarNumber,
        aadhaarFrontImage: formData.aadhaarFrontImage,
        aadhaarBackImage: formData.aadhaarBackImage
      },
      panVerification: {
        panNumber: formData.panNumber,
        dateOfBirth: formData.dateOfBirth,
        panCardImage: formData.panCardImage
      },
      bankDetails: {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        confirmAccountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode
      },
      userAgreement: formData.userAgreement,
      status: 'approved'
    }

    try {
      const { data, ok } = await apiProxy('/api/driver/complete-profile', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (ok) {
        alert('Driver onboarded successfully!')
        handleClose()
      } else {
        alert('Submission failed: ' + (data.message || 'Check all fields'))
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Connection error.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => currentStep < 5 && setCurrentStep(currentStep + 1)
  const handlePrevious = () => currentStep > 1 && setCurrentStep(currentStep - 1)

  const handleClose = () => {
    setCurrentStep(1)
    onClose()
  }

  if (!isOpen) return null

  const steps = [
    { label: 'Profile', icon: User },
    { label: 'KYC', icon: FileText },
    { label: 'Bank', icon: CreditCard },
    { label: 'Contact', icon: PhoneCall },
    { label: 'Review', icon: CheckCircle2 }
  ]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-300 w-full max-w-2xl flex flex-col max-h-[90vh] shadow-xl rounded-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-white rounded-sm flex items-center justify-center">
              {React.createElement(steps[currentStep - 1].icon, { size: 18 })}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 leading-none">Driver Onboarding</h2>
              <p className="text-xs text-gray-500 mt-1">Step {currentStep} of {steps.length}: {steps[currentStep - 1].label}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-gray-200 rounded-sm transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 flex items-center gap-1 border-b border-gray-200">
          {steps.map((_, idx) => (
            <div key={idx} className={`h-1 flex-1 rounded-full ${idx + 1 <= currentStep ? 'bg-black' : 'bg-gray-200'}`} />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300">

          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                  <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Legal Name" className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-black transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 00000 00000" className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-black transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-black appearance-none bg-white font-medium">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Region</label>
                  <input name="serviceRegion" value={formData.serviceRegion} onChange={handleInputChange} placeholder="e.g. Delhi NCR" className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-black font-medium" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Operational Zone / Time Zone</label>
                <select name="zoneId" value={formData.zoneId} onChange={handleInputChange} className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-black appearance-none bg-white font-medium cursor-pointer">
                  <option value="">Select Zone</option>
                  {zones.map(zone => (
                    <option key={zone._id} value={zone._id}>
                      {zone.name} {zone.city ? `(${zone.city})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Address</label>
                <textarea name="currentFullAddress" value={formData.currentFullAddress} onChange={handleInputChange} placeholder="Current Address Details" rows={3} className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none focus:border-black resize-none" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border border-gray-200 p-4 rounded bg-gray-50 space-y-4">
                <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-gray-400" /> Aadhaar Card
                </label>
                <input name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} placeholder="12 Digit Aadhaar Number" maxLength={12} className="w-full border border-gray-300 p-2.5 text-sm rounded focus:outline-none" />

                <div className="grid grid-cols-2 gap-3">
                  <input type="file" hidden ref={aadhaarFrontRef} onChange={(e) => handleFileUpload(e, 'aadhaarFrontImage')} accept="image/*" />
                  <button onClick={() => aadhaarFrontRef.current.click()} className={`border border-dashed p-4 rounded text-xs transition-colors flex flex-col items-center gap-2 relative ${formData.aadhaarFrontImage ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
                    {uploadingField === 'aadhaarFrontImage' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} className="text-gray-400" />}
                    <span className="font-semibold text-gray-600">{formData.aadhaarFrontImage ? 'Front Ready' : 'Upload Front'}</span>
                  </button>

                  <input type="file" hidden ref={aadhaarBackRef} onChange={(e) => handleFileUpload(e, 'aadhaarBackImage')} accept="image/*" />
                  <button onClick={() => aadhaarBackRef.current.click()} className={`border border-dashed p-4 rounded text-xs transition-colors flex flex-col items-center gap-2 relative ${formData.aadhaarBackImage ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
                    {uploadingField === 'aadhaarBackImage' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} className="text-gray-400" />}
                    <span className="font-semibold text-gray-600">{formData.aadhaarBackImage ? 'Back Ready' : 'Upload Back'}</span>
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 p-4 rounded bg-gray-50 space-y-4">
                <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-gray-400" /> PAN Card
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input name="panNumber" value={formData.panNumber} onChange={handleInputChange} placeholder="PAN Number" className="border border-gray-300 p-2.5 text-sm rounded focus:outline-none" />
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="border border-gray-300 p-2.5 text-sm rounded focus:outline-none uppercase" />
                </div>

                <input type="file" hidden ref={panRef} onChange={(e) => handleFileUpload(e, 'panCardImage')} accept="image/*" />
                <button onClick={() => panRef.current.click()} className={`w-full border border-dashed p-5 rounded text-xs transition-colors flex flex-col items-center gap-2 relative ${formData.panCardImage ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
                  {uploadingField === 'panCardImage' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} className="text-gray-400" />}
                  <span className="font-semibold text-gray-600">{formData.panCardImage ? 'PAN Uploaded' : 'Upload PAN Card Image'}</span>
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-gray-900 text-white p-6 rounded relative overflow-hidden flex flex-col gap-6">
                <div className="flex justify-between items-start border-b border-gray-800 pb-4">
                  <CreditCard size={32} className="text-gray-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Bank Settlement Info</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-tight">Account Number</label>
                    <input name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} placeholder="0000 0000 0000 0000" className="w-full bg-transparent border-b border-gray-700 py-1 text-xl font-mono focus:outline-none focus:border-white transition-all text-center placeholder:text-gray-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-tight">Bank</label>
                      <input name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="e.g. HDFC" className="w-full bg-transparent border-b border-gray-700 py-1 text-sm font-semibold focus:outline-none focus:border-white uppercase placeholder:text-gray-800" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-tight">IFSC</label>
                      <input name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} placeholder="HDFC0001234" className="w-full bg-transparent border-b border-gray-700 py-1 text-sm font-semibold focus:outline-none focus:border-white uppercase placeholder:text-gray-800" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-700 font-medium">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                Ensure bank details match the Aadhaar legal name to avoid payment holds during settlements.
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border border-gray-200 p-4 rounded bg-gray-50 space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-xs font-bold uppercase tracking-tight">Reference 01</span>
                </div>
                <div className="space-y-3">
                  <input name="ref1Name" value={formData.ref1Name} onChange={handleInputChange} placeholder="Full Name" className="w-full border border-gray-300 p-2 text-sm rounded focus:outline-none" />
                  <input name="ref1Relation" value={formData.ref1Relation} onChange={handleInputChange} placeholder="Relation" className="w-full border border-gray-300 p-2 text-sm rounded focus:outline-none" />
                  <input name="ref1Phone" value={formData.ref1Phone} onChange={handleInputChange} placeholder="Phone" className="w-full border border-gray-300 p-2 text-sm rounded focus:outline-none" />
                </div>
              </div>
              <div className="border border-gray-200 p-4 rounded bg-gray-50 space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-xs font-bold uppercase tracking-tight">Reference 02</span>
                </div>
                <div className="space-y-3">
                  <input name="ref2Name" value={formData.ref2Name} onChange={handleInputChange} placeholder="Full Name" className="w-full border border-gray-300 p-2 text-sm rounded focus:outline-none" />
                  <input name="ref2Relation" value={formData.ref2Relation} onChange={handleInputChange} placeholder="Relation" className="w-full border border-gray-300 p-2 text-sm rounded focus:outline-none" />
                  <input name="ref2Phone" value={formData.ref2Phone} onChange={handleInputChange} placeholder="Phone" className="w-full border border-gray-300 p-2 text-sm rounded focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-6 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-gray-100 text-gray-900 rounded-sm flex items-center justify-center border border-gray-200">
                {isSubmitting ? <Loader2 size={32} className="animate-spin text-gray-400" /> : <CheckCircle2 size={32} />}
              </div>
              <div className="max-w-sm">
                <h3 className="text-xl font-bold text-gray-900">Final Verification</h3>
                <p className="text-xs text-gray-500 mt-2 font-medium">Please cross-verify all provided documents and information. Onboarding creates a legal partner profile.</p>
              </div>

              <div className="w-full p-4 border border-gray-200 rounded-sm flex items-center gap-3 text-left hover:bg-gray-50 transition-colors">
                <input type="checkbox" name="userAgreement" id="agreement" checked={formData.userAgreement} onChange={handleInputChange} className="w-5 h-5 border-gray-300 text-black focus:ring-0 rounded-sm cursor-pointer" />
                <label htmlFor="agreement" className="text-[11px] font-semibold text-gray-600 cursor-pointer">
                  I confirm that all documents provided are local and valid. I accept the Partner Agreement of Ridexy.
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
            className="px-4 py-2 border border-gray-300 text-xs font-bold text-gray-600 hover:bg-white rounded-sm disabled:opacity-30 transition-all flex items-center gap-2"
          >
            <ChevronLeft size={14} /> Back
          </button>

          <button
            onClick={currentStep === 5 ? handleSubmit : handleNext}
            disabled={isSubmitting}
            className={`px-6 py-2 text-xs font-bold flex items-center gap-2 rounded-sm transition-all ${currentStep === 5 ? 'bg-black text-white' : 'bg-black text-white hover:bg-zinc-800'} disabled:opacity-50`}
          >
            {isSubmitting ? 'Submitting...' : currentStep === 5 ? 'Onboard Driver' : 'Continue'}
            {!isSubmitting && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}

