'use client'

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
    Search,
    RotateCcw,
    Loader2,
    Zap,
    CheckCircle2,
    XCircle,
    Power,
    ZapOff,
    Battery,
    ShieldCheck,
    ShieldAlert
} from "lucide-react";
import { BASE_URL } from "@/lib/baseUrl";

export default function BatteryAccessManagement() {
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchVehicles = async (showLoader = true) => {
        if (showLoader) setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/batterySwap/all-vehicles`);
            const data = await response.json();
            if (data.success) {
                setVehicles(data.vehicles);
            }
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        } finally {
            if (showLoader) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        const socketBaseUrl = (() => {
            try {
                return new URL(BASE_URL).origin;
            } catch {
                return BASE_URL;
            }
        })();

        const socket = io(socketBaseUrl, {
            transports: ["websocket", "polling"],
        });

        const handleSwapStatusChanged = () => {
            fetchVehicles(false);
        };

        socket.on("swapStatusChanged", handleSwapStatusChanged);
        const refreshInterval = setInterval(() => fetchVehicles(false), 15000);

        return () => {
            socket.off("swapStatusChanged", handleSwapStatusChanged);
            socket.disconnect();
            clearInterval(refreshInterval);
        };
    }, []);

    const handleToggleStatus = async (driverId, currentStatus) => {
        if (!driverId) return;

        const newStatus = currentStatus === 'unblocked' ? 'blocked' : 'unblocked';
        const confirmMsg = `Are you sure you want to ${newStatus === 'blocked' ? 'BLOCK' : 'UNBLOCK'} battery swapping for this driver?`;

        if (!confirm(confirmMsg)) return;

        setIsUpdating(driverId);
        try {
            const response = await fetch(`${BASE_URL}/api/batterySwap/driver/updateDriverSwapStatus/${driverId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (data.success) {
                setVehicles(prev => prev.map(v => {
                    if (v.currentDriverId === driverId) {
                        return { ...v, swapStatus: newStatus };
                    }
                    return v;
                }));
            } else {
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsUpdating(null);
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        v.vehicleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.currentDriverId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen p-2">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold flex items-center gap-3">
                        <Zap className="text-yellow-500 fill-yellow-500" size={28} />
                        Swap Access Control
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Manage battery swap permissions and subscription compliance
                    </p>
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
                        placeholder="Search ID, Driver or Vehicle..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none"
                    />
                </div>

                <div className="flex gap-4 text-gray-600 items-center">
                    <RotateCcw size={20} className="cursor-pointer hover:text-black" onClick={fetchVehicles} />
                </div>
            </div>


            <div className="bg-white border border-gray-300 flex flex-col h-[75vh]">
                {/* Table Header */}
                <div className="border-b border-gray-300 bg-gray-100">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left">
                                <th className="px-4 py-3 w-[18%]">Vehicle Unit</th>
                                <th className="px-4 py-3 w-[22%]">Current Pilot</th>
                                <th className="px-4 py-3 w-[20%] text-center">Plan Integrity</th>
                                <th className="px-4 py-3 w-[20%] text-center">Swap Permission</th>
                                <th className="px-4 py-3 w-[20%] text-right pr-10">Command Override</th>
                            </tr>
                        </thead>
                    </table>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                            <Loader2 size={40} className="animate-spin text-zinc-400" />
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Synchronizing Access Matrix...</p>
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 gap-2">
                            <p className="text-gray-400 font-medium">No matching data found</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm border-collapse">
                            <tbody>
                                {filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 w-[18%]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                                                    <Battery size={16} className="text-zinc-900" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900">{vehicle.vehicleId}</div>
                                                    <div className="text-[10px] text-zinc-400 font-mono uppercase">{vehicle.chassisNo}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 w-[22%]">
                                            {vehicle.currentDriverId ? (
                                                <div>
                                                    <div className="font-bold text-zinc-900 uppercase">{vehicle.driverName}</div>
                                                    <div className="text-[10px] text-zinc-500 font-mono tracking-wider">ID: {vehicle.currentDriverId}</div>
                                                </div>
                                            ) : (
                                                <div className="text-zinc-300 italic">No active assignment</div>
                                            )}
                                        </td>

                                        <td className="px-4 py-4 w-[20%] text-center">
                                            {vehicle.currentDriverId ? (
                                                vehicle.activeSubscription ? (() => {
                                                    const end = new Date(vehicle.activeSubscription.endDate);
                                                    const now = new Date();
                                                    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

                                                    return (
                                                        <div className="inline-flex flex-col items-center">
                                                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase">
                                                                <CheckCircle2 size={12} /> Active Plan
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-mono font-bold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                                                                    {end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                </span>
                                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm ${daysLeft <= 1 ? 'bg-red-500 text-white animate-pulse' :
                                                                        daysLeft <= 3 ? 'bg-orange-400 text-white' :
                                                                            'bg-emerald-500 text-white'
                                                                    }`}>
                                                                    {daysLeft}D
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })() : (
                                                    <div className="inline-flex flex-col items-center">
                                                        <div className="flex items-center gap-1 text-red-500 font-bold text-[10px] uppercase animate-pulse">
                                                            <XCircle size={12} /> No Active Plan
                                                        </div>
                                                        <span className="text-[8px] font-black text-red-400 mt-1">SWAPPING BLOCKED</span>
                                                    </div>
                                                )
                                            ) : "--"}
                                        </td>

                                        <td className="px-4 py-4 w-[20%] text-center">
                                            {vehicle.currentDriverId ? (
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center justify-center gap-1.5 w-fit mx-auto ${vehicle.swapStatus === 'unblocked'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {vehicle.swapStatus === 'unblocked' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                                    {vehicle.swapStatus === 'unblocked' ? "Authorized" : "Blocked"}
                                                </span>
                                            ) : "--"}
                                        </td>

                                        <td className="px-4 py-4 w-[20%] text-right pr-10">
                                            {vehicle.currentDriverId ? (
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleToggleStatus(vehicle.currentDriverId, vehicle.swapStatus)}
                                                        disabled={isUpdating === vehicle.currentDriverId}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none ${vehicle.swapStatus === 'unblocked'
                                                            ? 'bg-emerald-500'
                                                            : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        {isUpdating === vehicle.currentDriverId ? (
                                                            <span className="w-full flex justify-center">
                                                                <Loader2 size={10} className="animate-spin text-white" />
                                                            </span>
                                                        ) : (
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${vehicle.swapStatus === 'unblocked' ? 'translate-x-6' : 'translate-x-1'
                                                                    } flex items-center justify-center`}
                                                            >
                                                                {vehicle.swapStatus === 'unblocked'
                                                                    ? <Power size={8} className="text-emerald-500 font-bold" />
                                                                    : <ZapOff size={8} className="text-gray-400" />
                                                                }
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            ) : "--"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Metrics */}
                <div className="flex justify-between items-center p-4 text-sm bg-gray-50 border-t border-gray-300">
                    <div className="flex gap-6">
                        <span className="font-bold text-zinc-400 uppercase text-[10px]">Total: {vehicles.length}</span>
                        <span className="font-bold text-emerald-500 uppercase text-[10px]">Authorized: {vehicles.filter(v => v.swapStatus === 'unblocked').length}</span>
                        <span className="font-bold text-red-500 uppercase text-[10px]">Blocked: {vehicles.filter(v => v.swapStatus === 'blocked').length}</span>
                    </div>
                    <p className="font-bold text-zinc-400 text-[10px]">Last Handshake: {new Date().toLocaleTimeString()}</p>
                </div>
            </div>
        </div>
    );
}
