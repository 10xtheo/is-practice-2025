import React, { useEffect, useRef, useState } from 'react';

interface EventChatProps {
  eventId: string;
  token: string;
}

interface ChatMessage {
  eventId: string;
  message: string;
}

const EventChat: React.FC<EventChatProps> = ({ eventId, token }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/event/${eventId}?token=${token}`);
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.eventId && data.message) {
          setMessages((prev) => [...prev, data]);
        }
      } catch {}
    };
    return () => {
      ws.current?.close();
    };
  }, [eventId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ eventId, message: input }));
      setInput('');
    }
  };

  return (
    <div style={{ width: 300, height: 400, borderLeft: '1px solid #eee', display: 'flex', flexDirection: 'column', background: '#fafbfc' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 6, wordBreak: 'break-word' }}>{msg.message}</div>
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
        <button type="submit" style={{ borderRadius: 4, border: 'none', background: '#1976d2', color: '#fff', padding: '4px 12px' }}>Отправить</button>
      </form>
    </div>
  );
};

export default EventChat; 