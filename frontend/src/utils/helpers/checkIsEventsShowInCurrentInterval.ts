export const checkIsEventsShowInCurrentInterval = (
  startDateInInterval: number,
  endDateInInterval: number,
  eventStartDate: number,
  eventEndDate: number
) => {
  const isEventFromCurrentInterval = startDateInInterval <= eventStartDate &&
      endDateInInterval >= eventEndDate;

  const isEventFromNextInterval = endDateInInterval >= eventStartDate &&
    endDateInInterval <= eventEndDate;

  const isEventFromPrevInterval = startDateInInterval <= eventEndDate &&
    startDateInInterval >= eventStartDate;
    
  return isEventFromCurrentInterval || isEventFromNextInterval || isEventFromPrevInterval;
}