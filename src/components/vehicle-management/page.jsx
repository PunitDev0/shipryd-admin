'use client'
import { Plus, Search, RotateCcw, Upload, Download, MoreVertical, MapPin, Loader2, UserMinus, UserPlus } from "lucide-react";
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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                alert("Vehicle unassigned successfully");
                fetchVehicles();
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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                alert("Vehicle deleted successfully");
                fetchVehicles();
            } else {
                alert(data.message || "Failed to delete vehicle");
            }
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            alert("Something went wrong while deleting. Please try again.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-emerald-100 text-emerald-700';
            case 'assigned': return 'bg-blue-100 text-blue-700';
            case 'pre-booked': return 'bg-purple-100 text-purple-700';
            default: return 'bg-orange-100 text-orange-700';
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
        <div className="min-h-screen">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold">Vehicle Management</h1>
                    <p className="text-gray-500 text-sm">Manage your fleet of vehicles and driver assignments</p>
                </div>

                {/* Action buttons — wrap on mobile */}
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowZoneModal(true)}
                        className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 px-3 py-2 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 rounded"
                    >
                        <MapPin size={15} /> Zones
                    </button>
                    <button
                        onClick={() => { setSelectedVehicleId(null); setShowPreBookingModal(true); }}
                        className="flex-1 sm:flex-none bg-black text-white px-3 py-2 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:bg-zinc-800 rounded"
                    >
                        <RotateCcw size={15} /> Pre-booking
                    </button>
                    <Link
                        href="/vehicle-return-approval"
                        className="flex-1 sm:flex-none bg-black text-white px-3 py-2 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:bg-zinc-800 rounded text-center"
                    >
                        Return Approval
                    </Link>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-6 mb-6 border-b border-gray-100">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`pb-3 text-sm font-bold uppercase tracking-[0.12em] transition-all relative ${activeTab === "active" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
                >
                    Active Fleet
                    {activeTab === "active" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
                </button>
                <button
                    onClick={() => setActiveTab("pre-bookings")}
                    className={`pb-3 text-sm font-bold uppercase tracking-[0.12em] transition-all relative ${activeTab === "pre-bookings" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
                >
                    Pre-bookings
                    {activeTab === "pre-bookings" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
                </button>
            </div>

            {activeTab === "active" ? (
                <>
                    {/* ── Search & Actions ── */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-4">
                        <div className="relative flex-1 max-w-md">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Vehicle, Chassis or Driver..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gray-400 rounded"
                            />
                        </div>

                        <div className="flex justify-end items-center gap-4 text-gray-500">
                            <RotateCcw size={18} className="cursor-pointer hover:text-black transition-colors" onClick={fetchVehicles} title="Refresh" />
                            <Download size={18} className="cursor-pointer hover:text-black transition-colors" onClick={handleExport} title="Export to Excel" />
                            <button
                                onClick={() => setShowAddVehicleModal(true)}
                                className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 text-xs font-bold rounded hover:bg-zinc-800 transition-colors"
                            >
                                <Plus size={14} /> Add Vehicle
                            </button>
                        </div>
                    </div>

                    {/* ── Table with horizontal scroll on mobile ── */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>

                        {/* Sticky Table Header */}
                        <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
                            <table className="w-full text-sm min-w-[700px]">
                                <thead>
                                    <tr className="text-left text-gray-600 font-semibold">
                                        <th className="px-4 py-3 w-[16%]">Vehicle ID</th>
                                        <th className="px-4 py-3 w-[16%]">Chassis No.</th>
                                        <th className="px-4 py-3 w-[14%]">Driver</th>
                                        <th className="px-4 py-3 w-[12%]">Zone</th>
                                        <th className="px-4 py-3 w-[14%]">Hub</th>
                                        <th className="px-4 py-3 w-[12%] text-center">Status</th>
                                        <th className="px-4 py-3 w-[16%] text-right pr-6">Actions</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                                    <Loader2 size={36} className="animate-spin text-zinc-300" />
                                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Synchronizing Fleet Data...</p>
                                </div>
                            ) : filteredVehicles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-20 gap-2">
                                    <p className="text-gray-400 font-medium">No vehicles found</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm min-w-[700px]">
                                    <tbody>
                                        {filteredVehicles.map((item, index) => (
                                            <tr
                                                key={item._id}
                                                className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                                            >
                                                <td className="px-4 py-3.5 w-[16%] font-bold text-zinc-900 text-sm">{item.vehicleId}</td>
                                                <td className="px-4 py-3.5 w-[16%] font-mono text-xs text-zinc-500">{item.chassisNo}</td>
                                                <td className="px-4 py-3.5 w-[14%]">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-zinc-800 text-sm truncate max-w-[120px]">{item.driverName || 'Unassigned'}</span>
                                                        {item.driverId && <span className="text-[10px] text-zinc-400 font-mono">{item.driverId}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 w-[12%]">
                                                    <span className="bg-zinc-100 px-2 py-0.5 rounded text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                                                        {item.zoneName || '--'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 w-[14%]">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-zinc-800 text-sm">{item.hubName || '--'}</span>
                                                        {item.hubLocation && <span className="text-[10px] text-gray-400 truncate max-w-[100px]">{item.hubLocation}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 w-[12%] text-center">
                                                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${getStatusColor(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 w-[16%] relative">
                                                    <div className="flex items-center justify-end gap-1 pr-2">
                                                        {item.status === 'available' && (
                                                            <button
                                                                onClick={() => { setSelectedVehicleId(item._id); setShowPreBookingModal(true); }}
                                                                className="p-1.5 hover:bg-purple-50 rounded-lg text-zinc-400 hover:text-purple-600 transition-all"
                                                                title="Pre-book"
                                                            >
                                                                <RotateCcw size={16} />
                                                            </button>
                                                        )}
                                                        {item.status === 'available' ? (
                                                            <button
                                                                onClick={() => { setSelectedVehicleId(item._id); setShowAssignModal(true); }}
                                                                className="p-1.5 hover:bg-emerald-50 rounded-lg text-zinc-400 hover:text-emerald-600 transition-all"
                                                                title="Assign Driver"
                                                            >
                                                                <UserPlus size={16} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleUnassign(item._id)}
                                                                className="p-1.5 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-all"
                                                                title="Unassign Driver"
                                                            >
                                                                <UserMinus size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                                                            className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-all"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>
                                                    </div>

                                                    {openDropdown === index && (
                                                        <div className="absolute right-2 top-full mt-1 w-32 bg-white border border-gray-200 shadow-xl z-20 rounded-xl overflow-hidden py-1">
                                                            <button
                                                                onClick={() => { setSelectedVehicle(item); setShowEditVehicleModal(true); setOpenDropdown(null); }}
                                                                className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold text-zinc-600"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => { handleDelete(item._id); setOpenDropdown(null); }}
                                                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-xs font-bold border-t border-gray-100"
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

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 text-sm bg-gray-50 border-t border-gray-200">
                            <p className="font-semibold text-zinc-400 text-xs">Showing {filteredVehicles.length} Vehicles</p>

                            <div className="flex items-center gap-1.5">
                                <button className="px-3 py-1 border border-gray-200 text-xs hover:bg-white rounded transition-colors">Previous</button>
                                <button className="px-3 py-1 bg-black text-white text-xs rounded">1</button>
                                <button className="px-3 py-1 border border-gray-200 text-xs hover:bg-white rounded transition-colors">2</button>
                                <button className="px-3 py-1 border border-gray-200 text-xs hover:bg-white rounded transition-colors">Next →</button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <PreBookingList />
            )}

            <ZoneModal isOpen={showZoneModal} onClose={() => setShowZoneModal(false)} />
            <AddVehicleModal isOpen={showAddVehicleModal} onClose={() => setShowAddVehicleModal(false)} onSuccess={fetchVehicles} />
            <EditVehicleModal
                isOpen={showEditVehicleModal}
                vehicle={selectedVehicle}
                onClose={() => { setShowEditVehicleModal(false); setSelectedVehicle(null); }}
                onSuccess={fetchVehicles}
            />
            <AssignDriverModal isOpen={showAssignModal} vehicleId={selectedVehicleId} onClose={() => setShowAssignModal(false)} onSuccess={fetchVehicles} />
            <PreBookingModal isOpen={showPreBookingModal} onClose={() => setShowPreBookingModal(false)} onSuccess={fetchVehicles} />
        </div>
    );
}
