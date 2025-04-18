import { IEvent } from "types/event";

export const getLongEvents = (events: IEvent[]) => {
  const longEvents = events.filter(({ start, end, type }) => {
    const durationInDays = (end - start) / (1000 * 60 * 60 * 24);
    return type === 'long-event' || durationInDays >= 1;
  });
  
  return longEvents;
}