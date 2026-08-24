import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock, MapPin, Plus, Check, User, Sparkles, Building2, CalendarDays } from 'lucide-react';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  candidateName?: string;
  location?: string;
  type: 'INTERVIEW' | 'REVIEW' | 'MEETING' | 'DEADLINE';
}

export interface CalendarDialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate?: (dateStr: string) => void;
  onScheduleInterview?: (eventData: CalendarEvent) => void;
  events?: CalendarEvent[];
  title?: string;
  initialDate?: string;
  allowPresent?: boolean;
  mode?: 'picker' | 'scheduler';
}

export const CalendarDialogModal: React.FC<CalendarDialogModalProps> = ({
  isOpen,
  onClose,
  onSelectDate,
  onScheduleInterview,
  events = [],
  title = "Recruitment & Interview Calendar Module",
  initialDate,
  allowPresent = false,
  mode
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (initialDate && initialDate !== 'Present' && !isNaN(Date.parse(initialDate))) {
      return new Date(initialDate);
    }
    return new Date();
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    if (initialDate) return initialDate;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  useEffect(() => {
    if (initialDate) {
      setSelectedDateStr(initialDate);
      if (initialDate !== 'Present' && !isNaN(Date.parse(initialDate))) {
        setCurrentDate(new Date(initialDate));
      }
    }
  }, [initialDate, isOpen]);

  // New Event Form State (for Scheduler Mode)
  const [showAddForm, setShowAddForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [eventTime, setEventTime] = useState('10:00 AM');
  const [location, setLocation] = useState('Rathinam Techzone Campus - HR Desk');
  const [eventType, setEventType] = useState<'INTERVIEW' | 'REVIEW' | 'MEETING' | 'DEADLINE'>('INTERVIEW');

  if (!isOpen) return null;

  // Determine mode: defaults to 'picker' if onSelectDate is provided without onScheduleInterview
  const isPickerMode = mode ? mode === 'picker' : Boolean(onSelectDate && !onScheduleInterview);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Days in Month Calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setSelectedDateStr(todayStr);
  };

  const handleDayClick = (dayNumber: number) => {
    const targetDate = new Date(currentYear, currentMonth, dayNumber);
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setSelectedDateStr(dateStr);
  };

  const handleConfirmDateSelection = (dateStr: string) => {
    if (onSelectDate) {
      onSelectDate(dateStr);
    }
    onClose();
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      date: selectedDateStr,
      time: eventTime,
      title: eventTitle,
      candidateName,
      location,
      type: eventType
    };

    if (onScheduleInterview) {
      onScheduleInterview(newEvt);
    }

    setEventTitle('');
    setCandidateName('');
    setShowAddForm(false);
  };

  // Generate Calendar Grid Cells
  const calendarCells = [];
  
  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const prevDay = daysInPrevMonth - i;
    calendarCells.push({
      day: prevDay,
      isCurrentMonth: false,
      dateStr: ''
    });
  }

  // Current month days
  const todayFormattedStr = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  })();

  for (let day = 1; day <= daysInMonth; day++) {
    const yyyy = currentYear;
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dayEvents = events.filter(e => e.date === dateStr);

    calendarCells.push({
      day,
      isCurrentMonth: true,
      dateStr,
      events: dayEvents,
      isToday: dateStr === todayFormattedStr,
      isSelected: dateStr === selectedDateStr
    });
  }

  // Filter events for selected date (Scheduler mode)
  const selectedDayEvents = events.filter(e => e.date === selectedDateStr);

  // -------------------------------------------------------------
  // RENDER: DEDICATED DATE PICKER MODAL (Compact Form Mode)
  // -------------------------------------------------------------
  if (isPickerMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
        <div className="glass-panel p-5 sm:p-6 rounded-3xl max-w-md w-full border border-sky-200 bg-white shadow-2xl space-y-5">
          
          {/* MODAL HEADER */}
          <div className="flex items-center justify-between pb-3 border-b border-sky-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-600 p-0.5 shadow-md shadow-sky-500/20">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-sky-600" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-heading font-extrabold text-slate-900">{title}</h3>
                <p className="text-[11px] text-slate-500 font-medium">Select a date or quick option</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-sky-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MONTH & YEAR CONTROLS */}
          <div className="flex items-center justify-between bg-sky-50/80 p-2.5 rounded-2xl border border-sky-200 gap-2 flex-wrap">
            <div className="flex items-center space-x-1.5">
              <select
                value={currentMonth}
                onChange={e => setCurrentDate(new Date(currentYear, parseInt(e.target.value), 1))}
                className="px-2.5 py-1.5 rounded-xl glass-input text-xs font-bold text-slate-800 bg-white border border-sky-200"
              >
                {monthNames.map((name, idx) => (
                  <option key={name} value={idx} className="bg-white text-slate-900 font-medium">
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={e => setCurrentDate(new Date(parseInt(e.target.value), currentMonth, 1))}
                className="px-2.5 py-1.5 rounded-xl glass-input text-xs font-bold text-slate-800 font-mono bg-white border border-sky-200"
              >
                {Array.from({ length: 86 }, (_, i) => 1950 + i).map(year => (
                  <option key={year} value={year} className="bg-white text-slate-900 font-medium">
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 text-[11px] font-bold bg-white text-sky-700 rounded-lg border border-sky-200 hover:bg-sky-100 shadow-sm"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-sky-100 border border-sky-200 shadow-sm transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-sky-100 border border-sky-200 shadow-sm transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* WEEKDAY HEADERS */}
          <div className="grid grid-cols-7 text-center font-bold text-[11px] text-sky-800 uppercase tracking-wider py-1 bg-sky-100/60 rounded-xl">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* DAYS GRID */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div key={idx} className="h-10 rounded-lg bg-slate-50/50 border border-slate-100 p-1 text-slate-300 text-xs flex items-center justify-center">
                    <span>{cell.day}</span>
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(cell.day)}
                  className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${
                    cell.isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/30 scale-105'
                      : cell.isToday
                      ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-300/50 font-extrabold'
                      : 'bg-white hover:bg-sky-50 text-slate-800 border-sky-100 hover:border-sky-300'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* OPTIONAL 'PRESENT' QUICK BUTTON & SELECTION STATUS */}
          <div className="pt-3 border-t border-sky-100 space-y-3">
            {allowPresent && (
              <button
                type="button"
                onClick={() => setSelectedDateStr('Present')}
                className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition-all ${
                  selectedDateStr === 'Present'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Set as 'Present' (Currently Working Here)</span>
              </button>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Selected Value:</span>
              <span className="font-extrabold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                {selectedDateStr || 'None Selected'}
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDateSelection(selectedDateStr)}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-md shadow-sky-500/25 flex items-center space-x-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Apply Date</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: FULL RECRUITMENT & INTERVIEW CALENDAR MODAL (Scheduler Mode)
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-4xl w-full border border-sky-300 bg-white shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-100">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-600 p-0.5 shadow-md shadow-sky-500/25">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-sky-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500 font-medium">Interactive Calendar Module & Date Selector</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-sky-50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* MAIN CALENDAR GRID & EVENT SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLS: CALENDAR GRID */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* MONTH & YEAR NAVIGATION CONTROLS */}
            <div className="flex items-center justify-between bg-sky-50/80 p-3 rounded-2xl border border-sky-200 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                {/* Month Dropdown */}
                <select
                  value={currentMonth}
                  onChange={e => setCurrentDate(new Date(currentYear, parseInt(e.target.value), 1))}
                  className="px-3 py-1.5 rounded-xl glass-input text-xs font-bold text-slate-800"
                >
                  {monthNames.map((name, idx) => (
                    <option key={name} value={idx} className="bg-white text-slate-900 font-medium">
                      {name}
                    </option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={currentYear}
                  onChange={e => setCurrentDate(new Date(parseInt(e.target.value), currentMonth, 1))}
                  className="px-3 py-1.5 rounded-xl glass-input text-xs font-bold text-slate-800 font-mono"
                >
                  {Array.from({ length: 76 }, (_, i) => 1960 + i).map(year => (
                    <option key={year} value={year} className="bg-white text-slate-900 font-medium">
                      {year}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleToday}
                  className="px-2.5 py-1.5 text-[11px] font-bold bg-white text-sky-700 rounded-xl border border-sky-200 hover:bg-sky-100 shadow-sm"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-white text-slate-700 hover:bg-sky-100 border border-sky-200 shadow-sm transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-white text-slate-700 hover:bg-sky-100 border border-sky-200 shadow-sm transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* WEEKDAY HEADERS */}
            <div className="grid grid-cols-7 text-center font-bold text-xs text-sky-800 uppercase tracking-wider py-1 bg-sky-100/50 rounded-xl">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* DAYS GRID */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return (
                    <div key={idx} className="h-16 rounded-xl bg-slate-50 border border-slate-100/60 p-1 text-slate-300 text-xs opacity-50">
                      <span>{cell.day}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(cell.day)}
                    className={`h-16 rounded-xl p-1.5 text-xs font-semibold cursor-pointer transition-all flex flex-col justify-between border ${
                      cell.isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-500/25 scale-[1.03] font-bold'
                        : cell.isToday
                        ? 'bg-sky-50 border-sky-400 text-sky-900 font-bold ring-2 ring-sky-300'
                        : 'bg-white hover:bg-sky-50 text-slate-800 border-sky-100 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                        cell.isToday && !cell.isSelected ? 'bg-sky-600 text-white font-extrabold' : ''
                      }`}>
                        {cell.day}
                      </span>

                      {cell.events && cell.events.length > 0 && (
                        <span className={`w-2 h-2 rounded-full ${cell.isSelected ? 'bg-amber-300' : 'bg-sky-600 animate-pulse'}`} />
                      )}
                    </div>

                    {/* Mini Event Preview Badge */}
                    {cell.events && cell.events.length > 0 && (
                      <div className={`text-[9px] px-1 py-0.5 rounded truncate font-bold ${
                        cell.isSelected ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {cell.events.length} Event{cell.events.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT COL: SELECTED DATE EVENTS & SCHEDULE FORM */}
          <div className="space-y-4 bg-sky-50/40 p-5 rounded-2xl border border-sky-100">
            
            <div className="flex items-center justify-between pb-2 border-b border-sky-200">
              <div>
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Selected Date</span>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedDateStr === 'Present' ? 'Present' : new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Close' : 'Schedule'}</span>
              </button>
            </div>

            {/* ADD EVENT FORM */}
            {showAddForm ? (
              <form onSubmit={handleCreateEvent} className="space-y-3 bg-white p-4 rounded-xl border border-sky-200 shadow-sm animate-fadeIn text-xs">
                <h5 className="font-bold text-sky-800 text-xs">Schedule New Entry</h5>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Event / Position Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technical Interview - ECE"
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Candidate Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Candidate name"
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Time</label>
                    <input
                      type="text"
                      placeholder="10:00 AM"
                      value={eventTime}
                      onChange={e => setEventTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Event Type</label>
                    <select
                      value={eventType}
                      onChange={e => setEventType(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg glass-input text-xs"
                    >
                      <option value="INTERVIEW">Interview</option>
                      <option value="REVIEW">HR Review</option>
                      <option value="MEETING">Meeting</option>
                      <option value="DEADLINE">Deadline</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Location / Venue</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-sm flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Event</span>
                  </button>
                </div>
              </form>
            ) : (
              /* EVENT LIST FOR SELECTED DATE */
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <CalendarIcon className="w-8 h-8 text-sky-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">No events scheduled for this date.</p>
                    <p className="text-[11px] text-slate-400">Click 'Schedule' above to add an interview event.</p>
                  </div>
                ) : (
                  selectedDayEvents.map(evt => (
                    <div key={evt.id} className="p-3 rounded-xl bg-white border border-sky-200 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                          evt.type === 'INTERVIEW' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          evt.type === 'REVIEW' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          'bg-sky-100 text-sky-800 border border-sky-200'
                        }`}>
                          {evt.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-sky-600" />
                          <span>{evt.time}</span>
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-900">{evt.title}</h5>

                      {evt.candidateName && (
                        <p className="text-[11px] text-slate-600 flex items-center space-x-1">
                          <User className="w-3 h-3 text-sky-600" />
                          <span>Candidate: <strong>{evt.candidateName}</strong></span>
                        </p>
                      )}

                      {evt.location && (
                        <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* QUICK DATE CONFIRMATION BUTTON */}
            {onSelectDate && (
              <div className="pt-2 border-t border-sky-200">
                <button
                  type="button"
                  onClick={() => handleConfirmDateSelection(selectedDateStr)}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Use Selected Date ({selectedDateStr})</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
