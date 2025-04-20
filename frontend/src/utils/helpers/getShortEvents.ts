import { IEvent } from "types/event";

export const getShortEvents = (events: IEvent[]) => {
  const shortEvents = events.filter(({ start, end, type }) => {
    const durationInDays = (end - start) / (1000 * 60 * 60 * 24);
    return type !== 'long-event' && durationInDays < 1;
  });
  
  return shortEvents;
}