'use client'

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Ticket,
    LayoutGrid,
    Users,
    Car,
    MessageSquare,
    RotateCcw,
    Loader2,
    IndianRupee,
    TrendingUp,
    TrendingDown,
    Zap
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import TicketItem from '@/components/dashboard/TicketItem';
import PaymentSection from '@/components/dashboard/PaymentSection';
import ChartsSection from '@/components/dashboard/ChartsSection';
import { apiProxy } from '@/lib/proxy';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const { data, ok } = await apiProxy('/api/admin/dashboard-stats');
            if (ok) {
                setStats(data.stats);
            } else {
                setError(data.message || 'Failed to fetch dashboard stats');
            }
        } catch (err) {
            setError('Connection error. Please ensure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (isLoading && !stats) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin text-zinc-400" />
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading Dashboard Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-700">

            {/* Header Style matching other pages */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-zinc-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm">
                        Overview of fleet operations, active drivers, and support tickets
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="bg-black text-white px-4 py-2 text-sm flex items-center gap-2 shadow-sm hover:bg-zinc-800 rounded transition-all">
                        <Plus size={16} /> Add Vehicle
                    </button>
                    <button className="bg-black text-white px-4 py-2 text-sm flex items-center gap-2 shadow-sm hover:bg-zinc-800 rounded transition-all">
                        <Ticket size={16} className="rotate-45" /> New Ticket
                    </button>
                    <button
                        onClick={fetchStats}
                        className="p-2 text-gray-400 hover:text-black transition-colors"
                    >
                        <RotateCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatsCard
                    title="Total Drivers"
                    value={stats?.totalDrivers?.value || '0'}
                    change={stats?.totalDrivers?.change || 0}
                    label={stats?.totalDrivers?.label || "than last month"}
                    icon={Users}
                    iconBg="bg-violet-100/50"
                    chartColors={{ active: '#8b5cf6', inactive: '#ddd6fe' }}
                />
                <StatsCard
                    title="Active Subscriptions"
                    value={stats?.activeSubscriptions?.value || '0'}
                    change={stats?.activeSubscriptions?.change || 0}
                    label={stats?.activeSubscriptions?.label || "than last month"}
                    icon={LayoutGrid}
                    iconBg="bg-teal-100/50"
                    chartColors={{ active: '#0d9488', inactive: '#ccfbf1' }}
                />
                <StatsCard
                    title="Battery Swaps"
                    value={stats?.batterySwaps?.today || '0'}
                    change={stats?.batterySwaps?.change || 0}
                    label="than yesterday"
                    icon={Zap}
                    iconBg="bg-amber-100/50"
                    chartColors={{ active: '#f59e0b', inactive: '#fef3c7' }}
                />
                <StatsCard
                    title="Fleet Vehicles"
                    value={stats?.fleetVehicles?.value || '0'}
                    change={stats?.fleetVehicles?.change || 0}
                    label={stats?.fleetVehicles?.label || "than last month"}
                    icon={Car}
                    iconBg="bg-sky-100/50"
                    chartColors={{ active: '#0284c7', inactive: '#e0f2fe' }}
                />
                <StatsCard
                    title="Open Tickets"
                    value={stats?.openTickets?.value || '0'}
                    change={stats?.openTickets?.change || 0}
                    label={stats?.openTickets?.label || "than last month"}
                    icon={MessageSquare}
                    iconBg="bg-rose-100/50"
                    chartColors={{ active: '#e11d48', inactive: '#ffe4e6' }}
                />
            </div>

            {/* New Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Subscription Overview */}
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                        <LayoutGrid size={20} className="text-teal-500" />
                        Subscription Plan Overview
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-zinc-600">Weekly Plans</span>
                                <span className="text-sm font-bold text-zinc-900">{stats?.activeWeeklySubscriptions || 0} Drivers</span>
                            </div>
                            <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-teal-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${(stats?.activeWeeklySubscriptions / (stats?.activeWeeklySubscriptions + stats?.activeMonthlySubscriptions || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-zinc-600">Monthly Plans</span>
                                <span className="text-sm font-bold text-zinc-900">{stats?.activeMonthlySubscriptions || 0} Drivers</span>
                            </div>
                            <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-violet-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${(stats?.activeMonthlySubscriptions / (stats?.activeWeeklySubscriptions + stats?.activeMonthlySubscriptions || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Active Drivers Total</span>
                            <span className="text-lg font-black text-zinc-900 tracking-tight">{stats?.activeSubscriptions?.value || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Performance by City */}
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                        <Users size={20} className="text-sky-500" />
                        Top Performance by City (Last 30 Days)
                    </h3>
                    <div className="space-y-5">
                        {stats?.batterySwaps?.topCities?.length > 0 ? (
                            stats.batterySwaps.topCities.map((city, idx) => (
                                <div key={city._id}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-sky-500' : idx === 1 ? 'bg-violet-500' : 'bg-teal-500'}`} />
                                            <span className="text-sm font-bold text-zinc-800">{city._id || 'Unknown'}</span>
                                        </div>
                                        <span className="text-xs font-black text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">{city.count} Swaps</span>
                                    </div>
                                    <div className="w-full bg-zinc-50 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-sky-500' : idx === 1 ? 'bg-violet-500' : 'bg-teal-500'}`}
                                            style={{ width: `${(city.count / stats.batterySwaps.topCities[0].count) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center p-8 text-zinc-400 text-sm">No recent city activity</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Visual Charts Section */}
            <ChartsSection 
                registrations={stats?.charts?.dailyRegistrations} 
                revenue={stats?.charts?.dailyRevenue} 
                swaps={stats?.charts?.dailySwaps}
            />

            {/* Split Layout: Subscriptions Growth & Recent Swaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
                {/* Monthly Revenue Growth */}
                <div className="bg-white p-8 border border-gray-200 rounded-2xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                        <IndianRupee size={160} className="text-zinc-900" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                            <IndianRupee size={20} className="text-indigo-500" />
                            Monthly Revenue Overview
                        </h3>
                        <div className="flex items-center justify-between mb-10">
                            <div className="space-y-1">
                                <p className="text-xs text-zinc-400 font-bold tracking-[0.2em] uppercase">Revenue This Month</p>
                                <h4 className="text-5xl font-black text-zinc-900 tracking-tighter">₹{stats?.monthlyRevenue?.thisMonth?.toLocaleString() || '0'}</h4>
                            </div>
                            <div className={`flex flex-col items-end gap-1.5 ${stats?.monthlyRevenue?.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                <div className="flex items-center gap-1.5 font-black text-2xl tracking-tighter">
                                    {stats?.monthlyRevenue?.change >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                    {stats?.monthlyRevenue?.change}%
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100">vs Last Month</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-2">Previous Month</p>
                                <p className="text-2xl font-black text-zinc-700 tracking-tight">₹{stats?.monthlyRevenue?.lastMonth?.toLocaleString() || '0'}</p>
                            </div>
                            <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-xl">
                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-2">Total Collection</p>
                                <p className="text-2xl font-black text-white tracking-tight">₹{stats?.payments?.receivedTotal?.toLocaleString() || '0'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Swap Activity */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-zinc-50/50">
                        <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                            <Zap size={20} className="text-amber-500 fill-amber-500" />
                            Live Swap Feed
                        </h3>
                        <span className="text-[10px] font-black text-zinc-400 bg-white border border-zinc-200 px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">Real-time</span>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
                        {stats?.batterySwaps?.recent?.length > 0 ? (
                            stats.batterySwaps.recent.map((swap, idx) => (
                                <div key={swap._id} className={`p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-500 text-xs shadow-inner">
                                            {swap.city?.[0] || 'S'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-800 tracking-tight">Driver: {swap.driverId}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                                                    <LayoutGrid size={10} /> {swap.city}
                                                </span>
                                                <span className="text-[10px] font-black text-emerald-500 uppercase">Successful Swap</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-bold text-zinc-900">{new Date(swap.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-[9px] text-zinc-400 font-medium italic">{new Date(swap.dateTime).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-zinc-400 text-sm">No swap activity recorded</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">

                {/* LEFT COLUMN: Recent Tickets */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-zinc-900">Recent Tickets</h3>
                        </div>
                        <a href="/help-center" className="text-sm font-bold text-blue-500 hover:underline">View All</a>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-sm overflow-hidden flex flex-col h-[500px]">
                        {/* Table-like Header */}
                        <div className="border-b border-gray-300 bg-gray-100 px-4 py-3">
                            <div className="grid grid-cols-2 text-sm font-semibold text-gray-700">
                                <span>Ticket Info</span>
                                <span className="text-right pr-4">Status / Time</span>
                            </div>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {stats?.recentTickets?.length > 0 ? (
                                stats.recentTickets.map((ticket) => (
                                    <TicketItem
                                        key={ticket._id}
                                        title={ticket.problemType}
                                        customer={ticket.driver?.personalInformation?.fullName || 'Unknown Driver'}
                                        status={ticket.status === 'pending' ? 'On Going' : 'Resolved'}
                                        date={new Date(ticket.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        time={new Date(ticket.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    />
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-400">
                                    No recent tickets found
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Today's Payments */}
                <div className="h-fit">
                    <PaymentSection data={stats?.payments} />
                </div>

            </div>

        </div>
    );
}
