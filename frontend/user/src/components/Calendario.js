import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";

const Calendario = ({
  mode = "single", // 'single' o 'range'
  selected,
  rangeStart,
  rangeEnd,
  onChange,
  filterDate,
  minDate,
  blockedDates = [],
  className = "",
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(today);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleDateClick = (date) => {
    if (mode === "single") {
      onChange(date);
    } else if (mode === "range") {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        onChange({ startDate: date, endDate: null });
      } else {
        if (date < rangeStart) {
          onChange({ startDate: date, endDate: rangeStart });
        } else {
          onChange({ startDate: rangeStart, endDate: date });
        }
      }
    }
  };

  const isDateBlocked = (date) => {
    if (minDate && date < minDate) return true;
    if (filterDate) {
      const result = filterDate(date);
      return typeof result === "object" ? !result.available : !result;
    }
    return false;
  };

  const isDateSelected = (date) => {
    if (mode === "single") {
      return selected && isSameDay(date, selected);
    } else {
      return (
        (rangeStart && isSameDay(date, rangeStart)) ||
        (rangeEnd && isSameDay(date, rangeEnd)) ||
        (rangeStart && rangeEnd && date > rangeStart && date < rangeEnd)
      );
    }
  };

  const isDateInRange = (date) => {
    if (mode === "range" && rangeStart && rangeEnd) {
      return date > rangeStart && date < rangeEnd;
    }
    return false;
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div
            key={day}
            className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}

        {days.map((date) => {
          const isBlocked = isDateBlocked(date);
          const isSelected = isDateSelected(date);
          const isInRange = isDateInRange(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);

          return (
            <button
              key={date.toString()}
              onClick={() => !isBlocked && handleDateClick(date)}
              disabled={isBlocked}
              className={`
                relative h-12 text-center text-sm
                ${isCurrentMonth ? "bg-white" : "bg-gray-50"}
                ${
                  isBlocked
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-gray-50"
                }
                ${
                  isSelected ? "bg-[#009688] text-white hover:bg-[#00796B]" : ""
                }
                ${isInRange ? "bg-[#009688]/20" : ""}
                ${isToday(date) ? "font-bold" : ""}
              `}
            >
              <span className="absolute inset-0 flex items-center justify-center">
                {format(date, "d")}
              </span>
              {isBlocked && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendario;
