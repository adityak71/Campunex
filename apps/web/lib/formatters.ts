export function formatDepartureTime(rawDate: string | Date | null | undefined): string {
  if (!rawDate) return 'Departure time unavailable';

  try {
    const d = typeof rawDate === 'string' ? new Date(rawDate) : rawDate;
    if (!d || isNaN(d.getTime())) {
      return 'Departure time unavailable';
    }

    // Format: 22 Aug 2026 • 5:30 PM
    const day = d.getDate();
    const month = d.toLocaleString('en-IN', { month: 'short' });
    const year = d.getFullYear();
    const time = d.toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

    return `${day} ${month} ${year} • ${time}`;
  } catch (e) {
    return 'Departure time unavailable';
  }
}
