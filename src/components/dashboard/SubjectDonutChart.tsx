'use client';

import React from 'react';

interface SubjectDistItem {
  name: string;
  color: string;
  minutes: number;
  percentage: number;
  hoursFormatted?: string;
}

interface SubjectDonutChartProps {
  data: SubjectDistItem[];
  totalFormatted?: string;
}

export const SubjectDonutChart: React.FC<SubjectDonutChartProps> = ({
  data,
  totalFormatted = '0m',
}) => {
  const hasData = Array.isArray(data) && data.length > 0 && data.some((item) => item.minutes > 0);
  const displayItems = hasData ? data : [];

  // SVG Donut calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl p-3.5 md:p-4 shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-charcoal-900 dark:text-white tracking-tight">Subject Distribution</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-3 pt-1">
        {/* SVG Donut */}
        <div className="relative w-24 h-24 md:w-26 md:h-26 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
            {/* Background ring */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="transparent"
              stroke="#F8F2ED"
              className="stroke-[#F8F2ED] dark:stroke-[#2a2c34]"
              strokeWidth="14"
            />
            {/* Segment rings */}
            {displayItems.map((item, index) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += item.percentage;

              return (
                <circle
                  key={index}
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="14"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[9px] uppercase font-bold text-charcoal-400 dark:text-gray-400">Total</span>
            <span className="text-xs font-extrabold text-charcoal-900 dark:text-white leading-tight">
              {totalFormatted}
            </span>
          </div>
        </div>

        {/* Legend / Empty State */}
        {hasData ? (
          <div className="space-y-2 w-full max-w-[140px]">
            {displayItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-charcoal-700 dark:text-gray-300 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-charcoal-500 dark:text-gray-400">{item.percentage}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center sm:text-left py-2 px-1">
            <p className="text-xs font-semibold text-charcoal-700 dark:text-gray-300">No study time recorded</p>
            <p className="text-[11px] text-charcoal-400 dark:text-gray-400 mt-0.5 max-w-[150px]">
              Complete a focus session to see subject breakdown.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
