export const formatTime24 = (date: Date) => {
  const rawHours = date.getHours();
  let hours = rawHours;
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: true,
  }).formatToParts(date);
  const dayPeriod = parts.find(part => part.type === 'dayPeriod')?.value;
  if (dayPeriod === 'PM' && rawHours < 12) {
    hours = rawHours + 12;
  } else if (dayPeriod === 'AM' && rawHours === 12) {
    hours = 0;
  }
  const paddedHours = String(hours).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${paddedHours}:${minutes}`;
};
