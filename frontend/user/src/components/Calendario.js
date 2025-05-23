import React from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import es from 'date-fns/locale/es';

const Calendario = ({ selected, onChange, minDate, filterDate, className, mode, rangeStart, rangeEnd }) => {
  const getValidDate = (date) => {
    if (!date) return null;
    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) return null;
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const ranges = mode === 'range' ? [
    {
      startDate: getValidDate(rangeStart),
      endDate: getValidDate(rangeEnd),
      key: 'selection'
    }
  ] : [
    {
      startDate: getValidDate(selected),
      endDate: getValidDate(selected),
      key: 'selection'
    }
  ];

  const handleRangeChange = (ranges) => {
    if (onChange && ranges.selection) {
      const { startDate, endDate } = ranges.selection;
      if (mode === 'range') {
        onChange({ startDate, endDate });
      } else {
        onChange(startDate);
      }
    }
  };

  const isDateDisabled = (date) => {
    if (!filterDate) return false;
    const result = filterDate(date);
    return typeof result === 'object' ? !result.available : !result;
  };

  const isDateBlocked = (date) => {
    if (!filterDate) return false;
    const result = filterDate(date);
    return typeof result === 'object' ? result.isBlocked : false;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-legend mb-4 flex justify-center gap-6">
        <div className="legend-item flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-purple-200"></div>
          <span className="text-sm text-gray-600">Reservados</span>
        </div>
        <div className="legend-item flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-green-200"></div>
          <span className="text-sm text-gray-600">Disponibles</span>
        </div>
        <div className="legend-item flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-gray-200"></div>
          <span className="text-sm text-gray-600">No Disponibles</span>
        </div>
      </div>

      <DateRange
        ranges={ranges}
        onChange={handleRangeChange}
        months={1}
        direction="horizontal"
        locale={es}
        minDate={minDate}
        disabledDay={isDateDisabled}
        passiveDay={isDateBlocked}
        showDateDisplay={false}
        showMonthAndYearPickers={true}
        rangeColors={['#86efac']}
        dayDisplayFormat="d"
        styles={{
          calendar: {
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          },
          day: {
            borderRadius: '0.25rem',
            margin: '0.125rem',
            height: '3rem',
            fontSize: '1rem',
            '&.rdrDayDisabled': {
              backgroundColor: '#336699', // original: #e5e7eb
              color: '#ffffff',  // original: #9ca3af
            },
            '&.rdrDayPassive': {
              backgroundColor: '#e59999',
              color: '#9ca666',
            },
            '&.rdrDayToday': {
              backgroundColor: '#86efac',
              color: '#166534',
            },
            '&.rdrDaySelected': {
              backgroundColor: '#86efac',
              color: '#166534',
            },
            '&.rdrDayInRange': {
              backgroundColor: '#86efac',
              color: '#166534',
            },
            '&.rdrDayStartOfWeek': {
              color: '#4b5563',
            },
            '&.rdrDayEndOfWeek': {
              color: '#4b5563',
            },
          },
          monthPicker: {
            backgroundColor: 'white',
            color: '#1f2937',
            fontSize: '1rem',
          },
          yearPicker: {
            backgroundColor: 'white',
            color: '#1f2937',
            fontSize: '1rem',
          },
          prevButton: {
            color: '#4b5563',
            width: '2rem',
            height: '2rem',
          },
          nextButton: {
            color: '#4b5563',
            width: '2rem',
            height: '2rem',
          },
          weekDay: {
            fontSize: '1rem',
            color: '#4b5563',
            padding: '0.5rem 0',
          },
        }}
      />
    </div>
  );
};

export default Calendario; 