# Client-supplied weekly schedule — November 6, 2026

Source: `PHOTO-2026-11-06-13-31-33.jpg` and the accompanying Gi/No-Gi corrections supplied in chat. The live timetable is accessible HTML with day/program filters, rather than a photograph with conflicting uniform labels. All 43 sessions are included in the server-rendered page; selecting a day reveals its classes.

| Day | Time | Class | Format |
| --- | --- | --- | --- |
| Monday | 5:30 AM, 7:00 AM, 7:00 PM | Jiu-Jitsu | Gi |
| Monday | 8:00 AM, 8:30 AM | Strength & Conditioning | — |
| Monday | 9:30 AM | Women's Jiu-Jitsu | Gi |
| Monday | 4:00 PM | Kids' Jiu-Jitsu | Gi |
| Monday | 5:00 PM | MMA | — |
| Monday | 6:00 PM | Muay Thai | — |
| Tuesday | 7:00 AM, 9:30 AM, 7:00 PM | Jiu-Jitsu | Gi |
| Tuesday | 4:00 PM | Kids' Muay Thai | — |
| Tuesday | 5:00 PM | Sparring / Work | — |
| Tuesday | 6:00 PM | Muay Thai | — |
| Wednesday | 5:30 AM, 7:00 AM, 7:00 PM | Jiu-Jitsu | No-Gi |
| Wednesday | 8:00 AM, 8:30 AM | Strength & Conditioning | — |
| Wednesday | 9:30 AM | Women's Jiu-Jitsu | Gi |
| Wednesday | 4:00 PM | Kids' Jiu-Jitsu | Gi |
| Wednesday | 5:00 PM | MMA | — |
| Wednesday | 6:00 PM | Muay Thai | — |
| Thursday | 7:00 AM, 9:30 AM, 7:00 PM | Jiu-Jitsu | Gi |
| Thursday | 4:00 PM | Kids' Muay Thai | — |
| Thursday | 5:00 PM | Sparring / Work | — |
| Thursday | 6:00 PM | Muay Thai | — |
| Friday | 5:30 AM, 7:00 AM, 7:00 PM | Jiu-Jitsu | No-Gi |
| Friday | 6:30 AM | Open Mat | No-Gi |
| Friday | 8:00 AM, 8:30 AM | Strength & Conditioning | — |
| Friday | 9:30 AM | Women's Jiu-Jitsu | No-Gi |
| Friday | 4:00 PM | Kids' Jiu-Jitsu | No-Gi |
| Friday | 5:00 PM | MMA | — |
| Friday | 6:00 PM | Muay Thai | — |
| Saturday | 8:00 AM | Adults Open Mat | No-Gi |
| Saturday | 9:00 AM | Kids' Jiu-Jitsu | No-Gi |
| Saturday | 10:00 AM | Muay Thai Sparring | — |

Sunday has no supplied classes; the website says no classes are listed rather than claiming the business is closed. All times are academy local time. No geographic time zone, class duration, coach assignment, experience level, minimum age, capacity, price, or real booking availability has been inferred.

The client's Wednesday/Friday/Saturday No-Gi rule applies to adult grappling, including the supplied Friday/Saturday open mats. The explicit exceptions keep women's and kids' Wednesday Jiu-Jitsu in Gi. Women's Monday Jiu-Jitsu is Gi and Friday is No-Gi. Kids' Monday Jiu-Jitsu is Gi and Friday/Saturday is No-Gi. Muay Thai, MMA, strength and conditioning, and sparring/work keep their supplied discipline labels.

Approved schedule data lives in `lib/content/schedule.ts` and remains available if Sanity is unconfigured, empty, malformed, or unavailable. Valid approved Sanity classes can replace it. The runtime accepts absent time zones and levels for these supplied local-time listings, while rejecting invalid values if supplied. The Studio still requests an owner-confirmed geographic time zone for future CMS entries.

Program descriptions, schedule FAQ copy, the footer link, and scripted chat schedule wording were updated consistently. Per-class inquiry links go to the contact section. The booking calendar remains a clearly marked demo and cannot reserve these classes or emit registration conversions.

Release is explicitly authorized by the client's instruction to upload this schedule and make it live. Use the existing Vercel project and main-branch Git deployment, without creating accounts, changing DNS, or activating Cloudflare, Sanity, Meta, or paid services.
