import React, { useEffect, useRef, useState } from 'react';
import { useTypedSelector } from 'hooks/index';
import { useDispatch } from 'react-redux';
import { store } from 'store/store';
import { getEventMessages } from 'store/events/actions';

interface IChatMessage {
  event_id: string;
  content: string;
  user_id: string;
}

export interface IEventChat {
  eventId: string;
}

function getQueryParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const EventChatPage: React.FC<IEventChat> = ({eventId}) => {
  const dispatch = useDispatch<typeof store.dispatch>();
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [input, setInput] = useState('');
  const { users } = useTypedSelector(({ users }) => users);
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // const eventId = getQueryParam('eventId') || '';
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    if (!eventId || !token) return;

    // Подключаемся к WebSocket
    ws.current = new WebSocket(`ws://localhost:8000/ws/event/${eventId}?token=${token}`);

    // Загружаем историю сообщений
    dispatch(getEventMessages(eventId)).unwrap().then((response) => {
      const historyMessages = response.data.map(msg => ({
        event_id: msg.event_id,
        content: msg.content,
        user_id: msg.user_id
      }));
      setMessages(historyMessages);
    });

    ws.current.onmessage = (event) => {
      try {        
        const data: IChatMessage = JSON.parse(event.data);
        if (data.event_id && data.content) {          
          setMessages((prev) => [...prev, data]);
        }
      } catch {}
    };
    return () => {
      ws.current?.close();
    };
  }, [eventId, token, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(input);
      setInput('');
    }
  };
  
  // const goBack = () => {
  //   window.location.href = '/';
  // };

  if (!eventId || !token) {
    return <div>eventId или token не переданы в query-параметрах!</div>;
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', background: '#fafbfc', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 24 }}>
      {/* <button onClick={goBack} style={{ marginBottom: 16, border: 'none', background: '#1976d2', color: '#fff', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>Назад</button> */}
      {/* <h2 style={{ marginTop: 0 }}>Чат события</h2> */}
      <div style={{ width: '100%', height: 400, border: '1px solid #eee', display: 'flex', flexDirection: 'column', background: '#fff', marginBottom: 12 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 6, wordBreak: 'break-word' }}>{users.find(u => u.id === msg.user_id)?.full_name ?? "Аноним"}: {msg.content}</div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Введите сообщение..."
            style={{ flex: 1, marginRight: 8, borderRadius: 4, border: '1px solid #ccc', padding: 4 }}
          />
          <button type="submit" style={{ cursor: 'pointer', borderRadius: 4, border: 'none', background: '#1976d2', color: '#fff', padding: '4px 12px' }}>Отправить</button>
        </form>
      </div>
    </div>
  );
};

export default EventChatPage; 