'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface DayData {
  day: string;
  date: string;
  minutes: number;
  hours: number;
}

interface WeeklyStudyChartProps {
  data: DayData[];
}

export const WeeklyStudyChart: React.FC<WeeklyStudyChartProps> = ({ data }) => {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Maximum scale height (e.g. 8 hours)
  const maxScaleHours = 8;

  return (
    <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl p-3.5 md:p-4 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-charcoal-900 dark:text-white tracking-tight">Study Time This Week</h2>
        <div className="flex items-center gap-1 text-[11px] font-bold text-charcoal-600 dark:text-gray-300 bg-[#FAF4F0] dark:bg-[#212328] px-2 py-0.5 rounded-lg border border-[#EFE7E1] dark:border-[#2e313a]">
          <span>This Week</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      </div>

      {/* Hover Info Tag */}
      <div className="h-5 mb-2 flex items-center">
        {hoveredDay ? (
          <div className="text-[11px] font-semibold text-coral-600 dark:text-coral-400 animate-in fade-in flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-coral-500 animate-pulse" />
            <span>{hoveredDay.day}:</span>
            <span className="font-bold text-charcoal-900 dark:text-white">{hoveredDay.hours} hrs</span>
            <span className="text-charcoal-400 dark:text-gray-400 font-normal">({hoveredDay.minutes} mins)</span>
          </div>
        ) : (
          <div className="text-[11px] font-medium text-charcoal-400 dark:text-gray-400">
            Hover over bars to inspect daily focus
          </div>
        )}
      </div>

      {/* Chart Layout: Left Y-axis + Right Chart Body */}
      <div className="flex gap-2.5 pt-1">
        {/* Y-Axis scale labels */}
        <div className="flex flex-col justify-between text-[10px] text-charcoal-400 dark:text-gray-500 font-semibold h-32 text-right w-6 shrink-0 select-none py-0.5">
          <span>8h</span>
          <span>6h</span>
          <span>4h</span>
          <span>2h</span>
          <span>0h</span>
        </div>

        {/* Chart Column: Canvas + X-Axis */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Bars & Grid lines container */}
          <div className="relative h-32 border-b border-[#F5EBE4] dark:border-[#2e313a]">
            {/* Horizontal dashed grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-dashed border-[#F3ECE7] dark:border-[#2a2c34] w-full h-0" />
              <div className="border-b border-dashed border-[#F3ECE7] dark:border-[#2a2c34] w-full h-0" />
              <div className="border-b border-dashed border-[#F3ECE7] dark:border-[#2a2c34] w-full h-0" />
              <div className="border-b border-dashed border-[#F3ECE7] dark:border-[#2a2c34] w-full h-0" />
              <div className="w-full h-0" />
            </div>

            {/* Vertical Bar Columns */}
            <div className="relative z-10 w-full h-full flex items-end justify-around px-1">
              {data.map((item) => {
                const heightPercent =
                  item.hours > 0
                    ? Math.min(100, Math.max(8, (item.hours / maxScaleHours) * 100))
                    : 0;
                const isHovered = hoveredDay?.day === item.day;

                return (
                  <div
                    key={item.day}
                    className="flex-1 max-w-[28px] md:max-w-[32px] h-full flex items-end justify-center cursor-pointer group px-0.5"
                    onMouseEnter={() => setHoveredDay(item)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {/* Bar track */}
                    <div className="w-full bg-[#FFEAE3] dark:bg-[#252830] rounded-t-xl overflow-hidden h-full flex items-end transition-colors group-hover:bg-[#FFDFD6] dark:group-hover:bg-[#2d303a]">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-300 ${
                          isHovered
                            ? 'bg-gradient-to-t from-coral-600 to-coral-400 brightness-110 shadow-sm'
                            : 'bg-gradient-to-t from-[#FF8E72] to-[#FFAA94]'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-Axis Day Labels */}
          <div className="flex justify-around items-center pt-2.5 px-1">
            {data.map((item) => {
              const isHovered = hoveredDay?.day === item.day;
              return (
                <button
                  key={item.day}
                  type="button"
                  onMouseEnter={() => setHoveredDay(item)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`flex-1 max-w-[28px] md:max-w-[32px] text-center text-[11px] font-bold transition-colors ${
                    isHovered
                      ? 'text-coral-600 dark:text-coral-400 font-extrabold'
                      : 'text-charcoal-500 dark:text-gray-400 hover:text-charcoal-800 dark:hover:text-gray-200'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
