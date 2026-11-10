'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { localDateKey, parseDateKey } from '../lib/academy';
import { scheduleMinutes } from '../lib/content/schedule';
import type { AcademySchedule } from '../lib/content/types';
import type { TrialPreference } from '../lib/trial/contract';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

type Props = {
  schedules: AcademySchedule[];
  preference?: TrialPreference;
  onChange: (preference?: TrialPreference) => void;
};

export default function TrialTimePicker({ schedules, preference, onChange }: Props) {
  const today = localDateKey(new Date());
  const [month, setMonth] = useState(() => parseDateKey(`${today.slice(0, 7)}-01`)!);
  const [selectedDate, setSelectedDate] = useState('');
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthDays = new Date(year, monthIndex + 1, 0).getDate();
  const scheduledDays = new Set(schedules.map(item => item.day));
  const date = parseDateKey(selectedDate);
  const classes = date
    ? schedules.filter(item => item.day === weekdays[date.getDay()]).sort((a, b) => scheduleMinutes(a) - scheduleMinutes(b))
    : [];

  function chooseDate(value: string) {
    setSelectedDate(value);
    if (value !== preference?.date) onChange(undefined);
  }

  return <section className="trial-preference" aria-labelledby="trial-preference-heading">
    <h3 id="trial-preference-heading">Preferred class time <small>(optional)</small></h3>
    <p className="trial-intro">Pick a date and a class. All times are academy local time. We’ll follow up to confirm a time.</p>
    <div className="calendar-head">
      <button type="button" className="icon-button" aria-label="Previous month"
        disabled={localDateKey(month).slice(0, 7) <= today.slice(0, 7)}
        onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}><ChevronLeft size={18} /></button>
      <b aria-live="polite">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</b>
      <button type="button" className="icon-button" aria-label="Next month"
        onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}><ChevronRight size={18} /></button>
    </div>
    <div className="calendar" role="group" aria-label="Choose a preferred date">
      {weekdays.map(day => <small key={day}>{day}</small>)}
      {Array.from({ length: month.getDay() }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
      {Array.from({ length: monthDays }, (_, index) => {
        const day = new Date(year, monthIndex, index + 1, 12);
        const value = localDateKey(day);
        return <button type="button" key={value} disabled={value < today || !scheduledDays.has(weekdays[day.getDay()])}
          aria-label={day.toLocaleDateString('en-US', { dateStyle: 'full' })}
          aria-current={value === today ? 'date' : undefined} aria-pressed={selectedDate === value}
          className={selectedDate === value ? 'selected' : ''} onClick={() => chooseDate(value)}>{index + 1}</button>;
      })}
    </div>
    {date && <div className="trial-preference-times" aria-live="polite">
      <p className="field-label">Classes on {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      <div className="time-slots">
        {classes.map(item => {
          const time = `${item.time.replace(/^0/, '')} ${item.period}`;
          const className = item.name === item.type ? item.name : `${item.name} · ${item.type}`;
          const selected = preference?.date === selectedDate && preference.className === className && preference.time === time;
          return <button type="button" key={item.id} aria-pressed={selected} className={selected ? 'selected' : ''}
            onClick={() => onChange(selected ? undefined : { date: selectedDate, className, time })}>
            <strong>{time}</strong><span>{className}</span>
          </button>;
        })}
      </div>
    </div>}
    {preference && <p className="trial-selection">Preferred time: {preference.time} on {parseDateKey(preference.date)?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} <button className="text-button" type="button" onClick={() => onChange(undefined)}>Clear selection</button></p>}
  </section>;
}
