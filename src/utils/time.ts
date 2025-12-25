export const formatTime24 = (date: Date) => {
  const paddedHours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${paddedHours}:${minutes}`;
};
