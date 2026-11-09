'use client';

import { useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useAcademyContent } from './ContentProvider';
import { ContentHeading } from './ContentHeading';
import { scheduleMinutes } from '../../lib/content/schedule';

const days = [
  { label: 'Mon', full: 'Monday' }, { label: 'Tue', full: 'Tuesday' },
  { label: 'Wed', full: 'Wednesday' }, { label: 'Thu', full: 'Thursday' },
  { label: 'Fri', full: 'Friday' }, { label: 'Sat', full: 'Saturday' }, { label: 'Sun', full: 'Sunday' },
];

export default function ClassSchedule() {
  const { schedules, homepage } = useAcademyContent();
  const { title, accent, description, showTimetable } = homepage.schedule;
  const [day, setDay] = useState('Mon');
  const [filter, setFilter] = useState('All programs');
  const formats = ['All programs', ...new Set(schedules.map(item => item.type))];
  return <section id="schedule" className="schedule section-pad">
    <div className="section-kicker reveal"><span>05 / MAKE TIME FOR YOURSELF</span><span>CONSISTENCY CHANGES EVERYTHING.</span></div>
    <div className="section-heading reveal"><ContentHeading title={title} accent={accent} /><a className="button dark" href="#contact">Ask about a class <ArrowUpRight size={16} /></a></div>
    <div className="schedule-notice"><span className="status-dot" /><div><b>Academy class schedule</b><p>{description}</p></div></div>
    {showTimetable && <>
    <div className="schedule-toolbar">
      <div className="days" aria-label="Filter by day">{days.map(item => <button key={item.label} id={`schedule-day-${item.label}`} onClick={() => setDay(item.label)} className={day === item.label ? 'active' : ''} aria-label={item.full} aria-pressed={day === item.label} aria-controls={`schedule-panel-${item.label}`}>{item.label}</button>)}</div>
      <select aria-label="Filter by program" value={filter} onChange={event => setFilter(event.target.value)}>{formats.map(label => <option key={label}>{label}</option>)}</select>
    </div>
    <div className="schedule-results" aria-live="polite">{days.map(item => {
      const classes = schedules.filter(entry => entry.day === item.label && (filter === 'All programs' || filter === entry.type)).sort((a,b) => scheduleMinutes(a) - scheduleMinutes(b));
      return <div key={item.label} id={`schedule-panel-${item.label}`} role="region" aria-labelledby={`schedule-day-${item.label}`} hidden={day !== item.label}>
        {classes.map(entry => <div className="class-row" key={entry.id} data-class-id={entry.id}>
          <div className="class-time">{entry.time.replace(/^0/,'')}<small>{entry.period}</small></div>
          <div className="class-title"><h3>{entry.name}</h3>{entry.description && <p>{entry.description}</p>}{(entry.instructor || entry.level || entry.timezone) && <span>{[entry.instructor,entry.level,entry.timezone].filter(Boolean).join(' · ')}</span>}</div>
          <span className="level-tag">{entry.type}</span>
          <a className="icon-button" href="#contact" aria-label={`Ask about ${entry.name}, ${entry.type}, ${item.full} at ${entry.time.replace(/^0/,'')} ${entry.period}`}><ArrowUpRight size={20} /></a>
        </div>)}
        {!classes.length && <div className="empty-schedule"><span className="eyebrow">YOUR WEEK. YOUR PRACTICE.</span><h3>No classes listed.</h3><p>{filter === 'All programs' ? `There are no classes listed for ${item.full}.` : `No ${filter} classes are listed for ${item.full}.`}</p><button className="underlined-link" onClick={() => { setDay('Mon'); setFilter('All programs'); }}>View Monday’s classes <ArrowRight size={16} /></button></div>}
      </div>;
    })}</div>
    <p className="schedule-footer">Questions about a class? Ask the academy before attending.<span>ALL TIMES ARE ACADEMY LOCAL TIME</span></p>
    </>}
  </section>;
}
