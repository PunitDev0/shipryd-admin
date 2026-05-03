import React from 'react';
import Link from 'next/link';
import { ShieldAlert, IndianRupee, ArrowRight, Wallet, RotateCcw, TrendingUp } from 'lucide-react';

const PaymentSection = ({ data }) => {
    const receivedToday = data?.receivedToday || 0;
    const paymentsCount = data?.paymentsCount || 0;
    const pendingDues = data?.pendingDues || 0;
    const lastUpdated = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="bg-white rounded-sm p-6 border border-gray-300 flex flex-col gap-6 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900">Today’s Payments</h3>
                </div>
                <Link href="/payments" className="text-sm font-bold text-blue-500 hover:underline">Manage</Link>
            </div>

            <div className="flex justify-between items-center text-zinc-400">
                <span className="text-sm font-bold">Last Updated: {lastUpdated}</span>
                <RotateCcw className="w-5 h-5 cursor-pointer hover:rotate-180 transition-transform duration-500" />
            </div>

            {/* Main Stats Row */}
            <div className="grid grid-cols-2 gap-6">
                {/* Pending Dues */}
                <div className="bg-white rounded-sm p-5 border border-gray-300 flex flex-col gap-4 relative group">
                    <div className="flex justify-between items-center">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="text-zinc-300 group-hover:text-red-400 transition-colors">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="font-black text-zinc-900 text-lg">Pending Dues</p>
                        <div className="flex items-baseline text-4xl font-black text-red-500 mt-2">
                            <span className="text-xl mr-1">₹</span> {pendingDues.toLocaleString()}
                        </div>
                        <p className="text-[12px] text-zinc-400 mt-2 font-bold">{data?.pendingDuesCount || 0} payments due today</p>
                    </div>
                </div>

                {/* Received Today */}
                <div className="bg-white rounded-sm p-5 border border-gray-300 flex flex-col gap-4 relative group">
                    <div className="flex justify-between items-center">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="text-zinc-300 group-hover:text-emerald-400 transition-colors">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="font-black text-zinc-900 text-lg">Received Today</p>
                        <div className="flex items-baseline text-4xl font-black text-emerald-500 mt-2">
                            <span className="text-xl mr-1">₹</span> {receivedToday.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            {data?.revenueChange !== undefined && (
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                                    data.revenueChange >= 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'
                                }`}>
                                    {data.revenueChange >= 0 ? '+' : ''}{data.revenueChange}%
                                </span>
                            )}
                            <p className="text-[12px] text-zinc-400 font-bold">{paymentsCount} payments Received</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-sm p-4 flex flex-col items-center justify-center text-center gap-2 border border-gray-200">
                    <span className="text-3xl font-black text-orange-500">{(data?.totalPending || 0).toLocaleString()}</span>
                    <p className="text-[11px] text-zinc-900 font-black uppercase tracking-tight">Total Pending (₹)</p>
                </div>
                <div className="bg-gray-50 rounded-sm p-4 flex flex-col items-center justify-center text-center gap-2 border border-gray-200">
                    <span className="text-3xl font-black text-orange-500">{data?.urgentActions || 0}</span>
                    <p className="text-[11px] text-zinc-900 font-black uppercase tracking-tight">Urgent Actions</p>
                </div>
                <div className="bg-gray-50 rounded-sm p-4 flex flex-col items-center justify-center text-center gap-2 border border-gray-200">
                    <span className="text-3xl font-black text-orange-500">{(data?.receivedTotal || 0).toLocaleString()}</span>
                    <p className="text-[11px] text-zinc-900 font-black uppercase tracking-tight">Total Collection</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSection;
