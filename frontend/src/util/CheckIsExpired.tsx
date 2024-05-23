export function IsExpired(timeStr?: string): boolean {
  if (!timeStr) {
    return false;
  }

  const expiredAtUTC = new Date(timeStr);
  const now = new Date();

  const clientTimezoneOffset = now.getTimezoneOffset() * 60000;

  const expiredAtClientTimezone = new Date(
    expiredAtUTC.getTime() + clientTimezoneOffset
  );

  return expiredAtClientTimezone < now;
}

export function GetRemaining(timeStr?: string): string {
  if (!timeStr) {
    return "";
  }

  const expiredAtUTC = new Date(timeStr);
  const now = new Date();

  const clientTimezoneOffset = now.getTimezoneOffset() * 60000;

  const expiredAtClientTimezone = new Date(
    expiredAtUTC.getTime() + clientTimezoneOffset
  );

  const remaining = expiredAtClientTimezone.getTime() - now.getTime();

  const options: Intl.DateTimeFormatOptions = {
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  };

  if (remaining <= 0) {
    return "00:00";
  }

  const formatter = new Intl.DateTimeFormat("en-US", options);

  return formatter.format(remaining);
}
