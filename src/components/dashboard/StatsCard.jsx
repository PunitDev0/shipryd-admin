import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({ title, value, change = 0, label = "than last month", icon: Icon, iconBg, chartColors, active }) => {
    const isPositive = change > 0;
    const isNegative = change < 0;
    const isNeutral = change === 0;

    return (
        <div className={`bg-white rounded-xl p-6 border border-gray-200 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-zinc-300 group`}>
            {/* Header Row: Icon and Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm`}>
                        {Icon && <Icon className="w-5 h-5 text-zinc-700" />}
                    </div>
                    <p className="text-zinc-600 font-medium text-sm">{title}</p>
                </div>
                {active && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
            </div>

            {/* Content Row: Value and Chart */}
            <div className="flex items-end justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">{value}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border ${
                            isPositive ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                            isNegative ? 'text-rose-600 bg-rose-50 border-rose-100' : 
                            'text-zinc-500 bg-zinc-50 border-zinc-100'
                        }`}>
                            {isPositive && <TrendingUp size={10} />}
                            {isNegative && <TrendingDown size={10} />}
                            {isNeutral && <Minus size={10} />}
                            {isPositive ? '+' : ''}{change}%
                        </span>
                        <span className="text-[11px] text-zinc-400 font-medium italic">{label}</span>
                    </div>
                </div>

                {/* Micro Bar Chart */}
                <div className="flex items-end gap-1 h-12">
                    {[35, 55, 40, 80, 50, 95, 70, 100].map((height, i) => (
                        <div
                            key={i}
                            className="w-1.5 rounded-full transition-all duration-500 group-hover:opacity-100"
                            style={{
                                height: `${height}%`,
                                backgroundColor: i >= 5 ? chartColors.active : chartColors.inactive,
                                opacity: i >= 5 ? 1 : 0.3
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
