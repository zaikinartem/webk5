import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

/** Время задержки перед редиректом (в миллисекундах). Необходимо для сохранения куки сессии. */
const REDIRECT_DELAY_MS = 200;

/**
 * Компонент страницы авторизации.
 * Отправляет данные на сервер и обрабатывает ответ без использования alert().
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
                        navigate('/profile');
                    }, REDIRECT_DELAY_MS);
                }
            })
            .catch((error) => {
                const message = error.response?.data?.message || 'Ошибка соединения с сервером.';
                setErrorMsg(message); 
            });
    };

    return (
        <div style={{ padding: '30px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Arial' }}>
            <h2>🔑 Авторизация</h2>
            
            {errorMsg && (
                <div style={{ color: '#dc3545', background: '#f8d7da', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                    type="text"
                    placeholder="Введите логин"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    style={{ padding: '8px' }}
                />
                <input
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ padding: '8px' }}
                />
                <button type="submit" style={{ padding: '10px' }}>Войти</button>
            </form>
            <p style={{ marginTop: '15px' }}><Link to="/">На главную</Link></p>
        </div>
    );
}