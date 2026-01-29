import { useState, useEffect, useRef } from 'react';
import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerProps {
  value: string; // ISO string format YYYY-MM-DD
  onChange: (date: string) => void; // Callback receives ISO string format
  className?: string;
  placeholder?: string;
}

export function DatePicker({ value, onChange, className = '', placeholder = 'Selecione uma data' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(value ? parseISO(value) : new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Generate days for calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add empty cells for days before the first day of the month
  const startDayOfWeek = getDay(monthStart);
  const emptyDaysBefore = Array(startDayOfWeek).fill(null);

  // Add empty cells for days after the last day of the month
  const endDayOfWeek = getDay(monthEnd);
  const emptyDaysAfter = Array(6 - endDayOfWeek).fill(null);

  const allDays = [...emptyDaysBefore, ...days, ...emptyDaysAfter];

  // Handle day selection
  const handleDaySelect = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  // Format the displayed value
  const displayValue = value ? format(parseISO(value), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '';

  return (
    <div className={`relative ${className}`} ref={datePickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors flex items-center justify-between"
      >
        <span className={value ? 'text-white' : 'text-gray-400'}>
          {value ? displayValue : placeholder}
        </span>
        <Calendar className="w-5 h-5 text-purple-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute z-50 mt-2 p-4 rounded-xl bg-[#0a0a1a] border border-purple-500/30 shadow-2xl shadow-purple-900/20 backdrop-blur-sm min-w-[300px]"
          >
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
              
              <h3 className="text-lg font-medium text-white">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h3>
              
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {allDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="h-10" />;
                }

                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = value && isSameDay(day, parseISO(value));
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={day.toString()}
                    type="button"
                    onClick={() => handleDaySelect(day)}
                    className={`
                      h-10 rounded-lg text-sm transition-colors flex items-center justify-center
                      ${isCurrentMonth ? 'text-white hover:bg-purple-600/20' : 'text-gray-600'}
                      ${isSelected 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : isToday 
                          ? 'border border-purple-500/50' 
                          : ''
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}