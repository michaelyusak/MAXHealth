export function IsExpired(epoch?: number): boolean {
  if (!epoch) {
    return false;
  }

  epoch = epoch / 1000;

  const expiredAt = new Date(epoch);
  const now = new Date();

  return expiredAt < now;
}

export function GetRemaining(epoch?: number): string {
  if (!epoch) {
    return "";
  }

  epoch = epoch / 1000;

  const expiredAt = new Date(epoch);
  const now = new Date();

  const remaining = expiredAt.getTime() - now.getTime();

  if (remaining <= 0) {
    return "00:00";
  }

  const remainingMinutes = Math.floor(remaining / 1000 / 60);
  const remainingHours = Math.floor(remainingMinutes / 60);

  const minutes =
    Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)) +
    remainingHours * 60;
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
