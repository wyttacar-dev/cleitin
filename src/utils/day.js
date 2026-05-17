export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function minutesFromTime(time) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function isToday(timestamp) {
  if (!timestamp) return false;
  return new Date(timestamp).toISOString().slice(0, 10) === getTodayKey();
}

