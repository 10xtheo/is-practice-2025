import React, { FC, useEffect } from 'react';
import Calendar from './components/calendar/Calendar';
import Layout from './components/Layout/Layout';
import { useActions } from './hooks';
import { useWebSocket } from './hooks/useWebSocket';
import Auth from './components/Auth/Auth';

import './common.scss';
import Profile from 'components/Profile/Profile';

const backendHost = 'localhost';
const backendPort = 8000;
export const backendUrl = `http://${backendHost}:${backendPort}/api/v1`;

const App: FC = () => {
  const { getEvents, getCalendars, getUsers } = useActions();

  useEffect(() => {
    getEvents();
    getCalendars();
    getUsers();
  }, []);


  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated && !window.location.href.includes('/auth')) {
    window.location.href = '/auth';
    return null;
  }

  if (isAuthenticated) {
    // уведомления
    useWebSocket(`ws://${backendHost}:${backendPort}/ws/echo?token=${localStorage.getItem('token')}`);

    window["selectedUsers"] = []
  }

  return (
    <Layout isAuth={isAuthenticated}>
      {window.location.href.includes('/profile') ? (
        <Profile />
      ) : window.location.href.includes('/auth') ? (
        <Auth />
      ) : (
        <Calendar />
      )}
    </Layout>
  );
}

export default App;
