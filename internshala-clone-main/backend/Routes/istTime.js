function getIstDateParts(date = new Date()) {
  // IST = UTC+5:30
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(utc + istOffsetMs);

  return {
    ist,
    hour: ist.getHours(),
    minute: ist.getMinutes(),
  };
}

function isWithinIstWindow({ startHour = 10, startMinute = 0, endHour = 11, endMinute = 0 } = {}) {
  const { hour, minute } = getIstDateParts(new Date());

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  const now = hour * 60 + minute;

  // Allowed inclusive at start, exclusive at end (10:00-11:00)
  return now >= start && now < end;
}

function currentIstMonthKey(date = new Date()) {
  // YYYY-MM in IST
  const { ist } = getIstDateParts(date);
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

module.exports = {
  isWithinIstWindow,
  currentIstMonthKey,
};

