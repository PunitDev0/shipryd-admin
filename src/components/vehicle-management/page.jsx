'use client'
import { Plus, Search, RotateCcw, Upload, Download, MoreVertical, MapPin, Loader2, UserMinus, UserPlus, ListFilter } from "lucide-react";
import Link from "next/link";
import { ZoneModal } from "./zone-modal";
import { AddVehicleModal } from "./add-vehicle-modal";
import { EditVehicleModal } from "./edit-vehicle-modal";
import { AssignDriverModal } from "./assign-driver-modal";
import { PreBookingModal } from "./pre-booking-modal";
import PreBookingList from "./pre-booking-list";
import { useState, useEffect } from "react";
import { exportToExcel } from "@/lib/exportUtils";

import { BASE_URL } from "@/lib/baseUrl";

export default function VehicleManagement() {
    const [activeTab, setActiveTab] = useState("active");
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showPreBookingModal, setShowPreBookingModal] = useState(false);
    const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const handleExport = () => {
        const exportData = filteredVehicles.map(v => ({
            'Vehicle ID': v.vehicleId,
            'Chassis No': v.chassisNo,
            'Driver ID': v.driverId || '--',
            'Driver Name': v.driverName || 'Unassigned',
            'Zone': v.zoneName || '--',
            'Hub': v.hubName || '--',
            'Status': v.status,
            'Joined Date': v.createdAt ? new Date(v.createdAt).toLocaleString() : '--'
        }));
        exportToExcel(exportData, 'Fleet_Master_Report');
    };

    const fetchVehicles = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/vehicle/admin-list`);
            const data = await response.json();
            if (data.success) {
                setVehicles(data.vehicles);
            }
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleUnassign = async (vehicleId) => {
        if (!confirm("Are you sure you want to unassign the driver from this vehicle?")) return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${BASE_URL}/api/vehicle/unassign-by-vehicle/${vehicleId}`, {
                method: "PATCH",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                alert("Vehicle unassigned successfully");
                fetchVehicles(); // Refresh the list
            } else {
                alert(data.message || "Failed to unassign vehicle");
            }
        } catch (error) {
            console.error("Error unassigning:", error);
            alert("Something went wrong while unassigning. Please try again.");
        }
    };

    const handleDelete = async (vehicleId) => {
        if (!confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${BASE_URL}/api/vehicle/${vehicleId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                alert("Vehicle deleted successfully");
                fetchVehicles(); // Refresh the list
            } else {
                alert(data.message || "Failed to delete vehicle");
            }
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            alert("Something went wrong while deleting. Please try again.");
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        v.vehicleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.chassisNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driverId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.hubName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen p-2">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold">Vehicle Management</h1>
                    <p className="text-gray-500 text-sm">
                        Manage your fleet of vehicles and driver assignments
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowZoneModal(true)}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 text-sm flex items-center gap-2 shadow-sm hover:bg-gray-50"
                    >
                        <MapPin size={16} /> Manage Zones
                    </button>
                    <button
                        onClick={() => {
                            setSelectedVehicleId(null);
                            setShowPreBookingModal(true);
                        }}
                        className="bg-black text-white px-4 py-2 text-sm flex items-center gap-2 shadow-md hover:bg-zinc-800"
                    >
                        <RotateCcw size={16} /> Pre-booking
                    </button>
                    <Link href="/vehicle-return-approval" className="bg-black text-white px-4 py-2 text-sm flex items-center gap-2 shadow-md hover:bg-zinc-800">
                        Vehicle Return Approval
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mb-8 border-b border-gray-100">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`pb-4 text-sm font-bold uppercase tracking-[0.15em] transition-all relative ${activeTab === "active" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
                >
                    Active Fleet
                    {activeTab === "active" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black animate-in fade-in slide-in-from-left-2 duration-300"></div>}
                </button>
                <button
                    onClick={() => setActiveTab("pre-bookings")}
                    className={`pb-4 text-sm font-bold uppercase tracking-[0.15em] transition-all relative ${activeTab === "pre-bookings" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
                >
                    Pre-bookings
                    {activeTab === "pre-bookings" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black animate-in fade-in slide-in-from-left-2 duration-300"></div>}
                </button>
            </div>

            {activeTab === "active" ? (
                <>
                    {/* Search & Actions */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative w-72">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search Vehicle, Chassis or Driver..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none"
                            />
                        </div>

                        <div className="flex gap-4 text-gray-600 items-center">
                            <RotateCcw size={20} className="cursor-pointer hover:text-black" onClick={fetchVehicles} />
                            <Download
                                size={20}
                                className="cursor-pointer hover:text-black"
                                onClick={handleExport}
                                title="Export to Excel"
                            />
                            <Plus
                                size={20}
                                className="cursor-pointer hover:text-black"
                                onClick={() => setShowAddVehicleModal(true)}
                            />
                            <Upload size={20} className="cursor-pointer hover:text-black" />
                        </div>
                    </div>

                    {/* Table Wrapper */}
                    <div className="bg-white border border-gray-300 flex flex-col h-[75vh]">
                        {/* Table Header */}
                        <div className="border-b border-gray-300 bg-gray-100">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left">
                                        <th className="px-4 py-3 w-[18%]">Vehicle ID</th>
                                        <th className="px-4 py-3 w-[18%]">Chassis No.</th>
                                        <th className="px-4 py-3 w-[15%]">Driver ID</th>
                                        <th className="px-4 py-3 w-[15%]">Driver</th>
                                        <th className="px-4 py-3 w-[12%]">Zone</th>
                                        <th className="px-4 py-3 w-[12%]">Hub</th>
                                        <th className="px-4 py-3 w-[12%] text-center">Status</th>
                                        <th className="px-4 py-3 w-[10%] text-right pr-10">Actions</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-[400px]">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                                    <Loader2 size={40} className="animate-spin text-zinc-400" />
                                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Synchronizing Fleet Data...</p>
                                </div>
                            ) : filteredVehicles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-20 gap-2">
                                    <p className="text-gray-400 font-medium">No vehicles found</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <tbody>
                                        {filteredVehicles.map((item, index) => (
                                            <tr
                                                key={item._id}
                                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-4 py-4 w-[18%] font-bold text-zinc-900">{item.vehicleId}</td>
                                                <td className="px-4 py-4 w-[18%] font-mono text-zinc-500">{item.chassisNo}</td>
                                                <td className="px-4 py-4 w-[15%] text-zinc-600 font-bold">{item.driverId || '--'}</td>
                                                <td className="px-4 py-4 w-[15%] font-medium">{item.driverName || 'Unassigned'}</td>
                                                <td className="px-4 py-4 w-[12%]">
                                                    <span className="bg-zinc-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                                                        {item.zoneName || '--'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 w-[12%]">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-zinc-900">{item.hubName || '--'}</span>
                                                        {item.hubLocation && <span className="text-[10px] text-gray-400 line-clamp-1">{item.hubLocation}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 w-[12%] text-center">
                                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${item.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                                                        item.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                            item.status === 'pre-booked' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 w-[10%] relative">
                                                    <div className="flex items-center justify-end gap-2 pr-6">
                                                        {item.status === 'available' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVehicleId(item._id);
                                                                    setShowPreBookingModal(true);
                                                                }}
                                                                className="p-2 hover:bg-purple-50 rounded-xl text-zinc-400 hover:text-purple-600 transition-all"
                                                                title="Pre-book"
                                                            >
                                                                <RotateCcw size={18} />
                                                            </button>
                                                        )}
                                                        {item.status === 'available' ? (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVehicleId(item._id);
                                                                    setShowAssignModal(true);
                                                                }}
                                                                className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-emerald-600 transition-all group relative"
                                                                title="Assign Driver"
                                                            >
                                                                <UserPlus size={18} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleUnassign(item._id)}
                                                                className="p-2 hover:bg-red-50 rounded-xl text-zinc-400 hover:text-red-600 transition-all"
                                                                title="Unassign Driver"
                                                            >
                                                                <UserMinus size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                                                            className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-zinc-900"
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>
                                                    </div>

                                                    {openDropdown === index && (
                                                        <div className="absolute right-4 mt-2 w-32 bg-white border border-gray-300 shadow-xl z-20 rounded-xl overflow-hidden py-1">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVehicle(item);
                                                                    setShowEditVehicleModal(true);
                                                                    setOpenDropdown(null);
                                                                }}
                                                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-xs font-bold text-zinc-600"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleDelete(item._id);
                                                                    setOpenDropdown(null);
                                                                }}
                                                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-xs font-bold border-t border-gray-100 mt-1"
                                                            >
                                                                Delete
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
                        <div className="flex justify-between items-center p-4 text-sm bg-[#f9f9f9] border-t border-gray-300">
                            <p className="font-bold text-zinc-400">Showing {filteredVehicles.length} Vehicles</p>

                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1 border border-gray-300 text-xs shadow-sm">
                                    Previous
                                </button>

                                <button className="px-3 py-1 bg-black text-white text-xs">1</button>
                                <button className="px-3 py-1 border border-gray-300 text-xs shadow-sm">2</button>
                                <button className="px-3 py-1 border border-gray-300 text-xs shadow-sm">3</button>
                                <button className="px-3 py-1 border border-gray-300 text-xs shadow-sm">4</button>
                                <button className="px-3 py-1 border border-gray-300 text-xs shadow-sm">5</button>

                                <span>...</span>

                                <button className="px-3 py-1 border border-gray-300 text-xs shadow-sm">
                                    Next →
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <PreBookingList />
            )}

            <ZoneModal
                isOpen={showZoneModal}
                onClose={() => setShowZoneModal(false)}
            />

            <AddVehicleModal
                isOpen={showAddVehicleModal}
                onClose={() => setShowAddVehicleModal(false)}
                onSuccess={() => {
                    fetchVehicles();
                }}
            />

            <EditVehicleModal
                isOpen={showEditVehicleModal}
                vehicle={selectedVehicle}
                onClose={() => {
                    setShowEditVehicleModal(false);
                    setSelectedVehicle(null);
                }}
                onSuccess={() => {
                    fetchVehicles();
                }}
            />

            <AssignDriverModal
                isOpen={showAssignModal}
                vehicleId={selectedVehicleId}
                onClose={() => setShowAssignModal(false)}
                onSuccess={() => {
                    fetchVehicles();
                }}
            />

            <PreBookingModal
                isOpen={showPreBookingModal}
                onClose={() => setShowPreBookingModal(false)}
                onSuccess={() => {
                    fetchVehicles();
                }}
            />
        </div>
    );
}
