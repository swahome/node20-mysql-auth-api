export const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000);

export const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
