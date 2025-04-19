import React, { FC, useEffect } from 'react';
import Calendar from './components/calendar/Calendar';
import Layout from './components/Layout/Layout';
import { useActions } from './hooks';

import './common.scss';

const App: FC = () => {
  const { getEvents } = useActions();

  useEffect(() => {
    getEvents();
  }, []);
  
  return (
    <Layout>
      <Calendar />
    </Layout>
  );
}

export default App;
