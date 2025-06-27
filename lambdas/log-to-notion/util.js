export function formatTimeTo12hr(timeStr) {
  if (!timeStr) return "";
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const minutes = minStr.padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minutes} ${ampm}`;
}
