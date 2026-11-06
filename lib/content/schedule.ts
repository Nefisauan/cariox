import type { AcademySchedule } from './types';

// Transcribed from the supplied timetable, with the client's Gi/No-Gi corrections.
// Times are academy local time; no geographic time zone or class duration was supplied.
type Entry = [time: string, period: 'AM' | 'PM', name: string, type: string];
const week: Partial<Record<AcademySchedule['day'], Entry[]>> = {
  Mon: [
    ['05:30','AM','Jiu-Jitsu','Gi'], ['07:00','AM','Jiu-Jitsu','Gi'],
    ['08:00','AM','Strength & Conditioning','Strength & Conditioning'],
    ['08:30','AM','Strength & Conditioning','Strength & Conditioning'],
    ['09:30','AM',"Women's Jiu-Jitsu",'Gi'], ['04:00','PM',"Kids' Jiu-Jitsu",'Gi'],
    ['05:00','PM','MMA','MMA'], ['06:00','PM','Muay Thai','Muay Thai'], ['07:00','PM','Jiu-Jitsu','Gi'],
  ],
  Tue: [
    ['07:00','AM','Jiu-Jitsu','Gi'], ['09:30','AM','Jiu-Jitsu','Gi'],
    ['04:00','PM',"Kids' Muay Thai",'Muay Thai'], ['05:00','PM','Sparring / Work','Sparring / Work'],
    ['06:00','PM','Muay Thai','Muay Thai'], ['07:00','PM','Jiu-Jitsu','Gi'],
  ],
  Wed: [
    ['05:30','AM','Jiu-Jitsu','No-Gi'], ['07:00','AM','Jiu-Jitsu','No-Gi'],
    ['08:00','AM','Strength & Conditioning','Strength & Conditioning'],
    ['08:30','AM','Strength & Conditioning','Strength & Conditioning'],
    ['09:30','AM',"Women's Jiu-Jitsu",'Gi'], ['04:00','PM',"Kids' Jiu-Jitsu",'Gi'],
    ['05:00','PM','MMA','MMA'], ['06:00','PM','Muay Thai','Muay Thai'], ['07:00','PM','Jiu-Jitsu','No-Gi'],
  ],
  Thu: [
    ['07:00','AM','Jiu-Jitsu','Gi'], ['09:30','AM','Jiu-Jitsu','Gi'],
    ['04:00','PM',"Kids' Muay Thai",'Muay Thai'], ['05:00','PM','Sparring / Work','Sparring / Work'],
    ['06:00','PM','Muay Thai','Muay Thai'], ['07:00','PM','Jiu-Jitsu','Gi'],
  ],
  Fri: [
    ['05:30','AM','Jiu-Jitsu','No-Gi'], ['06:30','AM','Open Mat','No-Gi'], ['07:00','AM','Jiu-Jitsu','No-Gi'],
    ['08:00','AM','Strength & Conditioning','Strength & Conditioning'],
    ['08:30','AM','Strength & Conditioning','Strength & Conditioning'],
    ['09:30','AM',"Women's Jiu-Jitsu",'No-Gi'], ['04:00','PM',"Kids' Jiu-Jitsu",'No-Gi'],
    ['05:00','PM','MMA','MMA'], ['06:00','PM','Muay Thai','Muay Thai'], ['07:00','PM','Jiu-Jitsu','No-Gi'],
  ],
  Sat: [
    ['08:00','AM','Adults Open Mat','No-Gi'], ['09:00','AM',"Kids' Jiu-Jitsu",'No-Gi'],
    ['10:00','AM','Muay Thai Sparring','Muay Thai'],
  ],
};

export const publishedSchedule: AcademySchedule[] = Object.entries(week).flatMap(([day, entries]) => entries.map(([time, period, name, type]) => ({
  id: `${day.toLowerCase()}-${time.replace(':','')}-${period.toLowerCase()}`,
  day: day as AcademySchedule['day'], time, period, name, type,
})));

export function scheduleMinutes(item: Pick<AcademySchedule, 'time' | 'period'>): number {
  const [hours, minutes] = item.time.split(':').map(Number);
  return (hours % 12 + (item.period === 'PM' ? 12 : 0)) * 60 + minutes;
}
