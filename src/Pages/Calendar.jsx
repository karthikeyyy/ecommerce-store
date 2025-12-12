import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Layout/Header";
import Footer from "../Components/Layout/Footer";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildCalendar = (currentDate) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayWeekIndex = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = firstDayWeekIndex;
  const totalCells = 42;

  const cells = [];

  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - prevMonthDays + 1;
    let cellDate;
    let inCurrentMonth = true;

    if (dayOffset < 1) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      const day = prevMonthLastDay + dayOffset;
      cellDate = new Date(year, month - 1, day);
      inCurrentMonth = false;
    } else if (dayOffset > daysInMonth) {
      const day = dayOffset - daysInMonth;
      cellDate = new Date(year, month + 1, day);
      inCurrentMonth = false;
    } else {
      cellDate = new Date(year, month, dayOffset);
      inCurrentMonth = true;
    }

    cells.push({ date: cellDate, inCurrentMonth });
  }

  return cells;
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventsByDate, setEventsByDate] = useState({});
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const currentMonthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const cells = buildCalendar(currentDate);
  const todayKey = formatKey(new Date());
  const selectedKey = formatKey(selectedDate);
  const selectedEvents = eventsByDate[selectedKey] || [];

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/calendar-events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setEventsByDate({});
        return;
      }
      const map = {};
      json.events.forEach((ev) => {
        const key = ev.date;
        if (!map[key]) map[key] = [];
        map[key].push({
          id: ev._id,
          title: ev.title,
          description: ev.description,
        });
      });
      setEventsByDate(map);
    } catch (error) {
      console.error("Failed to fetch calendar events", error);
      setEventsByDate({});
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const key = selectedKey;
    setSavingEvent(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/calendar-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: key,
          title: newEventTitle.trim(),
          description: newEventDescription.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.message || "Failed to save event");
        setSavingEvent(false);
        return;
      }

      const ev = json.event;
      setEventsByDate((prev) => {
        const existing = prev[key] || [];
        return {
          ...prev,
          [key]: [
            ...existing,
            {
              id: ev._id,
              title: ev.title,
              description: ev.description,
            },
          ],
        };
      });

      setNewEventTitle("");
      setNewEventDescription("");
    } catch (error) {
      console.error("Failed to save event", error);
      alert("Failed to save event");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    const key = selectedKey;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4000/api/calendar-events/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.message || "Failed to delete event");
        setDeletingId(null);
        return;
      }

      setEventsByDate((prev) => {
        const existing = prev[key] || [];
        const updated = existing.filter((ev) => ev.id !== id);
        const next = { ...prev };
        if (updated.length === 0) {
          delete next[key];
        } else {
          next[key] = updated;
        }
        return next;
      });
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Header />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
                  <CalendarIcon className="w-7 h-7 text-emerald-500" />
                  Calendar
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Plan launches, campaigns, and content by date.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleToday}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-xs md:text-sm font-medium bg-white hover:bg-gray-100 dark:border-slate-600 dark:bg-transparent dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Today
                </button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:backdrop-blur">
                <div className="flex items-center justify-between px-4 py-3 md:px-6 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrevMonth}
                      className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-sm md:text-base font-semibold">
                      {currentMonthLabel}
                    </span>
                  </div>
                  {loadingEvents && (
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      Loading events...
                    </span>
                  )}
                </div>

                <div className="px-3 md:px-6 pb-4 md:pb-6">
                  <div className="grid grid-cols-7 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">
                    {daysShort.map((d) => (
                      <div key={d} className="text-center">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                    {cells.map((cell, idx) => {
                      const key = formatKey(cell.date);
                      const isSelected = key === selectedKey;
                      const isToday = key === todayKey;
                      const cellEvents = eventsByDate[key] || [];
                      const hasEvents = cellEvents.length > 0;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectDate(cell.date)}
                          className={[
                            "relative flex flex-col items-center justify-start rounded-xl border text-xs md:text-sm py-2 md:py-3 transition",
                            cell.inCurrentMonth
                              ? "bg-white border-gray-200 dark:bg-slate-950/60 dark:border-slate-800"
                              : "bg-gray-50 text-gray-400 border-gray-100 dark:bg-slate-950/20 dark:border-slate-900 dark:text-slate-600",
                            isSelected
                              ? "ring-2 ring-emerald-500 border-emerald-400"
                              : "",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "w-7 h-7 flex items-center justify-center rounded-full text-xs md:text-sm",
                              isToday
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                : "",
                            ].join(" ")}
                          >
                            {cell.date.getDate()}
                          </span>
                          {hasEvents && (
                            <span className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] md:text-[0.65rem] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                              {cellEvents.length} event
                              {cellEvents.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:backdrop-blur">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500 dark:text-emerald-400">
                        Events
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        {selectedKey}
                      </h2>
                    </div>
                  </div>

                  {selectedEvents.length === 0 ? (
                    <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 mb-3">
                      No events scheduled for this date.
                    </p>
                  ) : (
                    <ul className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1">
                      {selectedEvents.map((ev) => (
                        <li
                          key={ev.id}
                          className="flex items-start justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs md:text-sm dark:border-slate-800 dark:bg-slate-950/60"
                        >
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-slate-100">
                              {ev.title}
                            </p>
                            {ev.description && (
                              <p className="mt-1 text-[0.7rem] md:text-xs text-gray-500 dark:text-slate-400">
                                {ev.description}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            disabled={deletingId === ev.id}
                            className="ml-2 text-[0.65rem] px-2 py-1 rounded-full border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form onSubmit={handleAddEvent} className="space-y-3 mt-2">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                        Add event
                      </p>
                      <input
                        type="text"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="Event title"
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs md:text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={newEventDescription}
                      onChange={(e) => setNewEventDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs md:text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                    />
                    <button
                      type="submit"
                      disabled={savingEvent}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-md hover:bg-emerald-400 disabled:opacity-60"
                    >
                      <Plus className="w-4 h-4" />
                      {savingEvent ? "Saving..." : "Save event"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Calendar;
