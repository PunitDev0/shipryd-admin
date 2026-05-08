'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { apiProxy } from '@/lib/proxy'
import { BASE_URL } from '@/lib/baseUrl'
import { Navigation, Loader2, RefreshCcw, User, ChevronDown, Search, Check, X, MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'

// ─── Dynamic Imports with SSR: false ──────────────────────────────────────────
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })

// ─── Bearing Calculator ───────────────────────────────────────────────────────
function calculateBearing(startLat, startLng, endLat, endLng) {
    const toRad = d => (d * Math.PI) / 180
    const y = Math.sin(toRad(endLng - startLng)) * Math.cos(toRad(endLat))
    const x = Math.cos(toRad(startLat)) * Math.sin(toRad(endLat)) -
        Math.sin(toRad(startLat)) * Math.cos(toRad(endLat)) * Math.cos(toRad(endLng - startLng))
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

// ─── SVG Icon Factory ─────────────────────────────────────────────────────────
function createScooterIcon(L, heading = 0, isSelected = false) {
    if (!L) return null

    const size = isSelected ? 64 : 52
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
  <defs>
    <filter id="ds"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#00000040"/></filter>
    <radialGradient id="glow" cx="50%" cy="65%" r="40%">
      <stop offset="0%" stop-color="#F6C90E" stop-opacity="${isSelected ? '0.9' : '0.4'}"/>
      <stop offset="100%" stop-color="#F6C90E" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="28" cy="38" rx="${isSelected ? '22' : '14'}" ry="${isSelected ? '11' : '7'}" fill="url(#glow)"/>
  <g filter="url(#ds)">
    <ellipse cx="28" cy="44" rx="7" ry="4" fill="#1C1C2E" stroke="#F6C90E" stroke-width="1.5"/>
    <rect x="22" y="20" width="12" height="24" rx="5" fill="#1C1C2E"/>
    <rect x="23.5" y="26" width="9" height="10" rx="3" fill="#2a2a45" stroke="#F6C90E" stroke-width="0.8"/>
    <rect x="25" y="10" width="6" height="12" rx="3" fill="#1C1C2E"/>
    <ellipse cx="28" cy="10" rx="6" ry="3.5" fill="#1C1C2E" stroke="#F6C90E" stroke-width="1.5"/>
    <rect x="19" y="14" width="18" height="3" rx="1.5" fill="#1C1C2E" stroke="#F6C90E" stroke-width="0.8"/>
    <ellipse cx="28" cy="8" rx="3" ry="1.5" fill="#F6C90E" opacity="0.95"/>
    <circle cx="28" cy="31" r="2.5" fill="#F6C90E"/>
  </g>
  <polygon points="28,1 23,9 33,9" fill="#F6C90E" filter="url(#ds)"/>
</svg>`

    return L.divIcon({
        html: `
            <div style="
                width: ${size}px; height: ${size}px;
                transform: rotate(${heading}deg);
                transform-origin: 50% 50%;
                transition: transform 1.5s ease;
            ">
                ${svg}
            </div>
        `,
        className: isSelected ? 'marker-pulse-effect' : '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    })
}

export default function LiveTrackingPage() {
    const [drivers, setDrivers] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [L, setL] = useState(null)
    const [map, setMap] = useState(null)

    const isMounted = useRef(false)
    const bootstrapRef = useRef(false)

    // ── Bootstrap Assets ─────────────────────────────────────────────────────
    useEffect(() => {
        isMounted.current = true
        if (typeof window === 'undefined') return
        if (bootstrapRef.current) return

        bootstrapRef.current = true
        const head = document.head
        if (!head) return

        // Leaflet CSS
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        head.appendChild(link)

        // Custom Styles
        const style = document.createElement('style')
        style.innerHTML = `
            @keyframes pulse-ring {
                0% { box-shadow: 0 0 0 0 rgba(246, 201, 14, 0.4); }
                70% { box-shadow: 0 0 0 15px rgba(246, 201, 14, 0); }
                100% { box-shadow: 0 0 0 0 rgba(246, 201, 14, 0); }
            }
            .marker-pulse-effect { animation: pulse-ring 2s infinite; border-radius: 50%; }
            .leaflet-popup-content-wrapper { border-radius: 12px !important; overflow: hidden; padding: 0 !important; }
            .leaflet-popup-content { margin: 0 !important; }
            .leaflet-popup-tip-container { display: none; }
            .hide-scroll::-webkit-scrollbar { display: none; }
        `
        head.appendChild(style)

        import('leaflet').then(mod => {
            if (!isMounted.current) return
            setL(mod)
        })

        return () => { isMounted.current = false }
    }, [])

    const fetchDrivers = useCallback(async () => {
        try {
            const { data, ok } = await apiProxy('/api/driver/all')
            if (ok && data.success) {
                const newData = (data.drivers || []).filter(d => d.currentLocation?.lat && d.currentLocation?.lng)
                setDrivers(prev => newData.map(newD => {
                    const oldD = prev.find(p => p._id === newD._id)
                    let h = oldD?.heading ?? 0
                    if (oldD && (oldD.currentLocation.lat !== newD.currentLocation.lat || oldD.currentLocation.lng !== newD.currentLocation.lng)) {
                        h = calculateBearing(oldD.currentLocation.lat, oldD.currentLocation.lng, newD.currentLocation.lat, newD.currentLocation.lng)
                    }
                    return { ...newD, heading: h }
                }))
            }
        } catch (e) {
            console.error(e)
        } finally {
            if (isMounted.current) setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDrivers()
        const id = setInterval(fetchDrivers, 30000)
        return () => clearInterval(id)
    }, [fetchDrivers])

    // ── Handle Map Zoom/Pan WITHOUT useMap (Fixed Error) ─────────────────────
    useEffect(() => {
        if (selectedId && map && drivers.length > 0) {
            const driver = drivers.find(d => d._id === selectedId)
            if (driver?.currentLocation && typeof map.flyTo === 'function') {
                map.flyTo(
                    [driver.currentLocation.lat, driver.currentLocation.lng],
                    17,
                    { animate: true, duration: 1.5 }
                )
            }
        }
    }, [selectedId, map, drivers])

    const filtered = drivers.filter(d =>
        (d.personalInformation?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.phone || '').includes(search)
    )

    const selectedDriver = drivers.find(d => d._id === selectedId)
    const mapReady = typeof window !== 'undefined' && L

    return (
        <DashboardLayout noPadding>
            <div className="relative w-full h-full">

                    {/* Floating Dropdown */}
                    <div className="absolute top-4 left-4 z-[1000] w-64 sm:w-72">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-full bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3.5 flex items-center justify-between hover:border-yellow-400 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-400 p-2 rounded-xl text-black">
                                    <Navigation size={18} />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Fleet</div>
                                    <div className="text-sm font-extrabold text-gray-800 leading-none truncate">
                                        {selectedDriver?.personalInformation?.fullName ?? 'Search a Driver'}
                                    </div>
                                </div>
                            </div>
                            <ChevronDown size={18} className={`text-gray-300 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMenuOpen && (
                            <div className="mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden max-h-80 flex flex-col">
                                <div className="p-3 border-b border-gray-50 bg-gray-50/30">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            autoFocus
                                            className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-yellow-400"
                                            placeholder="Find driver by name..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="overflow-y-auto hide-scroll flex-1">
                                    {filtered.map(d => (
                                        <button
                                            key={d._id}
                                            onClick={() => { setSelectedId(d._id); setIsMenuOpen(false); }}
                                            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-yellow-50 transition-colors ${selectedId === d._id ? 'bg-yellow-50' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center text-[10px] font-bold uppercase">
                                                    {d.personalInformation?.fullName?.charAt(0)}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs font-bold text-gray-800">{d.personalInformation?.fullName}</div>
                                                    <div className="text-[10px] text-gray-400">{d.phone}</div>
                                                </div>
                                            </div>
                                            {selectedId === d._id && <Check size={14} className="text-yellow-600" />}
                                        </button>
                                    ))}
                                    {filtered.length === 0 && <div className="p-8 text-center text-xs text-gray-400">Not found</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats HUD */}
                    <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
                        <div className="bg-white/90 backdrop-blur shadow-lg border border-white/50 px-4 py-2.5 rounded-2xl flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">{drivers.length} Drivers Online</span>
                        </div>
                        <button onClick={() => { setIsLoading(true); fetchDrivers() }} className="bg-white shadow-lg p-3 rounded-2xl hover:bg-yellow-400 transition-all active:scale-95">
                            <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {/* Map Area */}
                    <div className="w-full h-full">
                        {isLoading && drivers.length === 0 && (
                            <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-white">
                                <Loader2 size={32} className="animate-spin text-yellow-500" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-4">Initializing Map...</span>
                            </div>
                        )}

                        {mapReady ? (
                            <MapContainer
                                center={[28.6139, 77.209]}
                                zoom={12}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                                ref={setMap} // Correct way to get the map instance
                            >
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />

                                {drivers.map(driver => (
                                    <Marker
                                        key={driver._id}
                                        position={[driver.currentLocation.lat, driver.currentLocation.lng]}
                                        icon={createScooterIcon(L, driver.heading, selectedId === driver._id)}
                                        eventHandlers={{ click: () => { setSelectedId(driver._id); setIsMenuOpen(false); } }}
                                    >
                                        <Popup>
                                            <div style={{ fontFamily: 'system-ui, sans-serif', width: 220 }}>
                                                <div style={{ background: '#F6C90E', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>
                                                        {driver.personalInformation?.fullName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: 13, color: '#000' }}>{driver.personalInformation?.fullName}</div>
                                                        <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.5)', fontFamily: 'monospace' }}>{driver.phone}</div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '10px 14px', background: '#fff' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                        <span style={{ fontSize: 11, color: '#999' }}>Status</span>
                                                        <span style={{ fontSize: 10, fontWeight: 'bold', color: '#16A34A' }}>● ONLINE</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: 11, color: '#999' }}>Updated</span>
                                                        <span style={{ fontSize: 10, color: '#333', fontWeight: 600 }}>{driver.currentLocation.lastUpdated ? new Date(driver.currentLocation.lastUpdated).toLocaleTimeString() : 'Just now'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 size={24} className="animate-spin text-gray-300" />
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Syncing Engine</span>
                                </div>
                            </div>
                        )}
                    </div>
            </div>
        </DashboardLayout>
    )
}