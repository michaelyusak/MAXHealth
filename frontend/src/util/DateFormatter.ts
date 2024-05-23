export const FormatDateToYMDWithDay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
};

export const FormatDateToYMD = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const FormatDateToYMDDashed = (date: Date): string => {
  return date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

export function FormatTimeChat(time: string, withHour?: boolean): string {
  const dateTime = new Date(Date.parse(time) - 7 * 60 * 60 * 1000);
  const date = dateTime.getDate();

  const now = new Date(Date.now());
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  if (date == now.getDate()) {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    };
    const formatter = new Intl.DateTimeFormat("en-US", options);
    return formatter.format(dateTime);
  }

  if (date == yesterday.getDate()) {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);

    return `Yesterday ${withHour ? formatter.format(dateTime) : ""}`;
  }

  if (date > lastWeek.getDate()) {
    const options: Intl.DateTimeFormatOptions = {
      hour: withHour ? "2-digit" : undefined,
      minute: withHour ? "2-digit" : undefined,
      hourCycle: "h23",
      weekday: "long",
    };
    const formatter = new Intl.DateTimeFormat("en-US", options);
    return formatter.format(dateTime);
  }

  if (dateTime.getFullYear() == now.getFullYear()) {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-US", options);
    return formatter.format(dateTime);
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "2-digit",
  };
  const formatter = new Intl.DateTimeFormat("en-US", options);
  return formatter.format(dateTime);
}

export function FormatTimeFull(time: string): string {
  const dateTime = new Date(Date.parse(time) - 7 * 60 * 60 * 1000);

  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h24",
    year: "numeric",
    month: "long",
    day: "2-digit",
  };
  const formatter = new Intl.DateTimeFormat("en-US", options);
  return formatter.format(dateTime);
}
