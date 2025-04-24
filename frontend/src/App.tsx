import React, { FC, useEffect } from 'react';
import Calendar from './components/calendar/Calendar';
import Layout from './components/Layout/Layout';
import { useActions } from './hooks';

import './common.scss';
import Profile from 'components/Profile/Profile';

const App: FC = () => {
  const { getEvents, getCalendars } = useActions();

  useEffect(() => {
    getEvents();
    getCalendars();
  }, []);
  console.log('wlh', window.location.href);
  
  return (
    <Layout>
      {window.location.href.includes('/profile') ? (
        <Profile />
      ) : (
        <Calendar />
      )}
    </Layout>
  );
}

export default App;
