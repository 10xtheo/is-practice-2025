import { reducer as eventsReducer } from './events/reducer';
import { reducer as modalsReducer } from './modals/reducer';
import { reducer as popupsReducer } from './popups/reducer';
import { reducer as calendarsReducer } from './calendars/reducer';
import { reducer as usersReducer } from './users/reducer';

export const reducers = {
	events: eventsReducer,
	users: usersReducer,
	calendars: calendarsReducer,
	modals: modalsReducer,
	popups: popupsReducer,
};
