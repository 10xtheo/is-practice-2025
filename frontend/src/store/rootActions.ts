import * as eventsActions from './events/actions';
import * as modalsActions from './modals/actions';
import * as popusActions from './popups/actions';
import * as calendarsActions from './calendars/actions';
import * as usersActions from './users/actions';

export const allActions = {
	...eventsActions,
	...usersActions,
	...calendarsActions,
	...modalsActions,
	...popusActions,
};
