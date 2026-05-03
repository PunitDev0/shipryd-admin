'use client';
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Legend
} from 'recharts';

export default function ChartsSection({ registrations = [], revenue = [], swaps = [] }) {
    // Format data and fix timezone shifts by parsing YYYY-MM-DD explicitly
    const formatChartDate = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const regData = registrations.map(d => ({
        date: formatChartDate(d._id),
        count: d.count
    }));

    const revData = revenue.map(d => ({
        date: formatChartDate(d._id),
        amount: d.amount
    }));

    const swapData = swaps.map(d => ({
        date: formatChartDate(d._id),
        count: d.count
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 my-8">
            {/* Revenue Chart */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900">Revenue (Last 7 Days)</h3>
                        <p className="text-xs text-zinc-500 mt-1">Daily total collection (₹)</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">Revenue</span>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                tickFormatter={(value) => `₹${value}`}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorRev)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Swap Activity Chart */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900">Swaps (Last 7 Days)</h3>
                        <p className="text-xs text-zinc-500 mt-1">Daily battery exchanges</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">Swaps</span>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={swapData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                cursor={{ stroke: '#f59e0b', strokeWidth: 1 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Registrations Chart */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900">Drivers (Last 7 Days)</h3>
                        <p className="text-xs text-zinc-500 mt-1">New registrations</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded-md border border-violet-100">Growth</span>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={regData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                dx={-10}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#8b5cf6"
                                radius={[4, 4, 0, 0]}
                                barSize={24}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
