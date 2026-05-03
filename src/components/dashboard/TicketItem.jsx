import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const TicketItem = ({ title, customer, status, date, time }) => {
    const isResolved = status === 'Resolved';
    const isGoing = status === 'On Going';

    return (
        <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between hover:bg-gray-50 transition-all cursor-pointer group relative">
            {/* Left side info */}
            <div className="flex flex-col gap-2">
                <h4 className="font-black text-xl text-zinc-900 leading-tight">{title}</h4>
                <p className="text-sm font-bold text-zinc-400">Customer: {customer}</p>
                <div className="mt-2 flex">
                    <span className={`text-[12px] font-black px-4 py-1.5 rounded-full border ${isGoing
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Right side info */}
            <div className="flex flex-col items-end justify-between h-full gap-8">
                <ArrowUpRight className="w-6 h-6 text-zinc-300 group-hover:text-zinc-500 group-hover:rotate-45 transition-all duration-300" />
                <div className="flex items-center gap-2">
                    <span className="text-[12px] text-zinc-400 font-bold">{date}</span>
                    <span className="text-[12px] text-zinc-400 font-black">{time}</span>
                </div>
            </div>

            {/* Border accent for active items (like the orange vertical line in image) */}
            {isGoing && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-orange-400 rounded-r-full" />
            )}
        </div>
    );
};

export default TicketItem;
