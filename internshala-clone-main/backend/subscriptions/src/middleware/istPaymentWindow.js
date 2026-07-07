/**
 * Blocks any payment initiation/processing outside 10:00 AM - 11:00 AM IST.
 * Server-side is the ultimate source of truth.
 */
function getISTParts(now = new Date()) {
  // IST = UTC+05:30
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const istMs = utcMs + 5.5 * 60 * 60_000;
  const ist = new Date(istMs);

  const hours = ist.getUTCHours();
  const minutes = ist.getUTCMinutes();

  return { hours, minutes, ist };
}

/**
 * @param {Object} opts
 * @param {number} opts.startHour 10
 * @param {number} opts.endHour 11
 * @returns Express middleware
 */
function istPaymentWindowMiddleware(opts) {
  const { startHour, endHour } = opts;

  return function istPaymentWindow(req, res, next) {
    const { hours, minutes } = getISTParts();

    // Allowed: [startHour:00, endHour:00) i.e. 10:00:00 <= time < 11:00:00
    const isAllowed =
      hours > startHour && hours < endHour
        ? true
        : hours === startHour
          ? minutes >= 0
          : hours === endHour
            ? false
            : false;

    if (!isAllowed) {
      return res.status(403).json({
        error: 'PAYMENT_WINDOW_CLOSED',
        message:
          'Payments are only accepted between 10:00 AM and 11:00 AM IST. Please come back later to upgrade.',
      });
    }

    return next();
  };
}

module.exports = { istPaymentWindowMiddleware };
