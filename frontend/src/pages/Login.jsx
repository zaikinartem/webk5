import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

/** Время задержки перед редиректом (в миллисекундах). */
const REDIRECT_DELAY_MS = 200;

/**
 * Компонент страницы авторизации.
 *
 * @returns {JSX.Element} JSX-разметка страницы входа
 */
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    /**
     * Обрабатывает отправку формы входа.
     *
     * @param {Event} e событие отправки формы
     */
    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMsg('');

        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        api.post('/auth', params)
            .then(response => {
                if (response.data.success) {
                    setTimeout(() => {
                        navigate('/');
                    }, REDIRECT_DELAY_MS);
                }
            })
            .catch((error) => {
                const message = error.response?.data?.message 
                    || 'Ошибка соединения с сервером.';
                setErrorMsg(message);
            });
    };

    return (
        <div style={{
            background: '#F9FAFB', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontFamily: "'Inter', sans-serif", 
            padding: '20px'
        }}>
            <Link 
                to="/" 
                style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    color: '#64748B', 
                    textDecoration: 'none', 
                    fontWeight: '500', 
                    marginBottom: '24px', 
                    fontSize: '15px'
                }}
            >
                <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Вернуться на главную
            </Link>

            <div style={{
                background: '#fff', 
                padding: '48px 40px', 
                borderRadius: '24px', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', 
                width: '100%', 
                maxWidth: '400px', 
                border: '1px solid #F1F5F9'
            }}>
                <h2 style={{
                    textAlign: 'center', 
                    fontSize: '28px', 
                    fontWeight: '800', 
                    marginBottom: '8px', 
                    color: '#1E293B'
                }}>
                    С возвращением
                </h2>
                <p style={{
                    textAlign: 'center', 
                    color: '#64748B', 
                    marginBottom: '32px', 
                    fontSize: '15px'
                }}>
                    Войдите, чтобы продолжить общение
                </p>

                {errorMsg && (
                    <div style={{
                        background: '#FEF2F2', 
                        color: '#991B1B', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        marginBottom: '24px', 
                        fontSize: '14px', 
                        textAlign: 'center', 
                        border: '1px solid #FECACA'
                    }}>
                        {errorMsg}
                    </div>
                )}

                <form 
                    onSubmit={handleLogin} 
                    style={{
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '16px'
                    }}
                >
                    <div>
                        <label style={{
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#475569', 
                            marginBottom: '6px'
                        }}>
                            Логин
                        </label>
                        <input
                            type="text"
                            placeholder="Введите ваш логин"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            style={{
                                width: '100%', 
                                padding: '12px 14px', 
                                background: '#F8FAFC'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#475569', 
                            marginBottom: '6px'
                        }}>
                            Пароль
                        </label>
                        <input
                            type="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%', 
                                padding: '12px 14px', 
                                background: '#F8FAFC'
                            }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        style={{
                            background: '#FF4B5C', 
                            color: 'white', 
                            padding: '14px', 
                            border: 'none', 
                            borderRadius: '10px', 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            cursor: 'pointer', 
                            marginTop: '8px'
                        }}
                    >
                        Войти
                    </button>
                </form>

                <p style={{
                    textAlign: 'center', 
                    marginTop: '24px', 
                    fontSize: '14px', 
                    color: '#64748B'
                }}>
                    Нет аккаунта?{' '}
                    <Link 
                        to="/register" 
                        style={{ color: '#FF4B5C', fontWeight: '600' }}
                    >
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </div>
    );
}