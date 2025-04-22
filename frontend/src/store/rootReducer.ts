import { reducer as eventsReducer } from './events/reducer';
import { reducer as modalsReducer } from './modals/reducer';
import { reducer as popupsReducer } from './popups/reducer';
import { reducer as calendarsReducer } from './calendars/reducer';

export const reducers = {
  events: eventsReducer,
  calendars: calendarsReducer,
  modals: modalsReducer,
  popups: popupsReducer
}