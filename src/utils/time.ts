export const formatTime24 = (date: Date) => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(date);
  const hour = parts.find(part => part.type === 'hour')?.value;
  const minute = parts.find(part => part.type === 'minute')?.value;
  if (hour && minute) {
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }
  const fallbackHour = String(date.getHours()).padStart(2, '0');
  const fallbackMinute = String(date.getMinutes()).padStart(2, '0');
  return `${fallbackHour}:${fallbackMinute}`;
};
