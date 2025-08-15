import React, { useState } from 'react';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
  opacity?: number; // 0-100, defaults to 50
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateChange,
  minDate = '1995-06-16', // First APOD date
  maxDate = new Date().toISOString().split('T')[0],
  className = '',
  opacity = 50, // Default 50% opacity
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date().toDateString();
    const selected = new Date(selectedDate).toDateString();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dateStr = date.toISOString().split('T')[0];
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today;
      const isSelected = date.toDateString() === selected;
      const isDisabled = dateStr < minDate || dateStr > maxDate;

      days.push({
        date: date.getDate(),
        dateStr,
        isCurrentMonth,
        isToday,
        isSelected,
        isDisabled,
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setViewDate(newDate);
  };

  const selectDate = (dateStr: string) => {
    onDateChange(dateStr);
    setShowCalendar(false);
  };

  const quickDateOptions = [
    { label: 'Today', date: new Date().toISOString().split('T')[0] },
    {
      label: 'Yesterday',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    },
    {
      label: 'Week ago',
      date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    },
    { label: 'Random', date: 'random' },
  ];

  const handleQuickDate = (date: string) => {
    if (date === 'random') {
      const minTime = new Date(minDate).getTime();
      const maxTime = new Date(maxDate).getTime();
      const randomTime = minTime + Math.random() * (maxTime - minTime);
      const randomDate = new Date(randomTime).toISOString().split('T')[0];
      onDateChange(randomDate);
    } else {
      onDateChange(date);
    }
    setShowCalendar(false);
  };

  return (
    <div className={`relative z-10 ${className}`}>
      {/* Quick Date Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickDateOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => handleQuickDate(option.date)}
            className="px-3 py-1.5 text-sm bg-cosmic-purple/20 hover:bg-cosmic-purple/30 text-cosmic-purple rounded-lg border border-cosmic-purple/30 transition-colors duration-200"
          >
            {option.label === 'Random' ? '🎲' : '📅'} {option.label}
          </button>
        ))}
      </div>

      {/* Date Input */}
      <div className="relative">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full glass-effect rounded-lg p-3 text-left flex items-center justify-between hover:bg-white/10 transition-colors duration-200"
        >
          <div>
            <div className="text-white font-medium">
              {formatDisplayDate(selectedDate)}
            </div>
            <div className="text-gray-400 text-sm">Click to change date</div>
          </div>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* Calendar Dropdown */}
        {showCalendar && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 backdrop-blur-md rounded-xl p-4 z-[9999] border border-white/30 shadow-2xl"
            style={{ backgroundColor: `rgba(15, 23, 42, ${opacity / 100})` }}
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <h3 className="text-white font-semibold">
                {viewDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>

              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs text-gray-400 p-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((day, index) => (
                <button
                  key={index}
                  onClick={() => !day.isDisabled && selectDate(day.dateStr)}
                  disabled={day.isDisabled}
                  className={`
                    p-2 text-sm rounded-lg transition-colors duration-200
                    ${
                      day.isSelected
                        ? 'bg-cosmic-purple text-white font-bold'
                        : day.isToday
                          ? 'bg-solar-orange/20 text-solar-orange border border-solar-orange/30'
                          : day.isCurrentMonth
                            ? 'text-white hover:bg-white/10'
                            : 'text-gray-500'
                    }
                    ${
                      day.isDisabled
                        ? 'opacity-30 cursor-not-allowed'
                        : 'cursor-pointer'
                    }
                  `}
                >
                  {day.date}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowCalendar(false)}
                className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                Close Calendar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePicker;
