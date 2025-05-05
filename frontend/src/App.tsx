import React, { FC, useEffect, useState } from 'react';
import Calendar from './components/calendar/Calendar';
import Layout from './components/Layout/Layout';
import { useActions, useTypedSelector } from './hooks';
import Auth from './components/Auth/Auth';
import './common.scss';
import Profile from 'components/Profile/Profile';

const backendHost = 'localhost';
const backendPort = 8000;
export const backendUrl = `http://${backendHost}:${backendPort}/api/v1`;

const App: FC = () => {
  const { getEvents, getCalendars, getMe, getUsers } = useActions();
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useTypedSelector(({ users }) => users);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getEvents(),
          getCalendars(),
          getMe(),
          getUsers()
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated && !window.location.href.includes('/auth')) {
    window.location.href = '/auth';
    return null;
  }

  if (isLoading) {
    return <div></div>;
  }

  window["selectedUsers"] = [];

  return (
    <Layout isAuth={isAuthenticated}>
      {window.location.href.includes('/profile') ? (
        <Profile currentUser={user} />
      ) : window.location.href.includes('/auth') ? (
        <Auth />
      ) : (
        <Calendar />
      )}
    </Layout>
  );
}

export default App;