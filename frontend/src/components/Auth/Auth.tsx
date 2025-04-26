import React, { FC, useState } from 'react';
import { backendUrl } from '../../App';
import './Auth.scss';

interface AuthFormData {
  username: string;
  password: string;
  email?: string;
  department?: string;
  position?: string;
}

const Auth: FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthFormData>({
    username: '',
    password: '',
    email: '',
    department: '',
    position: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const url = isLogin ? `${backendUrl}/login/access-token` : `${backendUrl}/users/signup`;
    const loginData = {
      username: formData.email,
      password: formData.password,
    }
    const registerData = {
      email: formData.email,
      password: formData.password,
      department: formData.department,
      position: formData.position,
    }

    try {      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': isLogin ? 'application/x-www-form-urlencoded' : 'application/json',
        },
        body: isLogin ? new URLSearchParams(loginData) : JSON.stringify(registerData),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem('token', data.access_token);
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        if (typeof errorData.detail === 'string') {
          setError(errorData.detail);
        } else {
          setError(errorData.detail.map((item: Record<string, unknown>) => item.msg).join('\n'));
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Произошла ошибка при подключении к серверу');
    }
  };

  return (
    <div className="auth__container">
      <div className="auth__box">
        <h2 className="auth__h2">{isLogin ? 'Вход' : 'Регистрация'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="auth__form-group">
            <label className="auth__label" htmlFor="email">Почта</label>
            <input
              className="auth__input"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="auth__form-group">
            <label className="auth__label" htmlFor="password">Пароль</label>
            <input
              className="auth__input"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="auth__form-group">
              <label className="auth__label" htmlFor="department">Отдел</label>
              <input
                className="auth__input"
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          {!isLogin && (
            <div className="auth__form-group">
              <label className="auth__label" htmlFor="position">Должность</label>
              <input
                className="auth__input"
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          <button type="submit" className="auth__submit-btn">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        {error && (
          <div className="auth__error">
            {error}
          </div>
        )}

        <p className="auth__switch-form">
          {isLogin ? "У вас нет аккаунта? " : "У вас уже есть аккаунт? "}
          <button
            className="auth__switch-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth; 