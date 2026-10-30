import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

/** Время задержки перед редиректом (в миллисекундах). Необходимо для сохранения куки сессии. */
const REDIRECT_DELAY_MS = 200;

/**
 * Компонент страницы регистрации.
 * Всегда создает пользователей с ролью USER, обрабатывает ошибки валидации.
 *
 * @returns {JSX.Element} JSX-разметка страницы регистрации
 */
export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState(''); 
    const navigate = useNavigate();

    /**
     * Обрабатывает отправку формы регистрации.
     * @param {Event} e событие отправки формы
     */
    const handleRegister = (e) => {
        e.preventDefault();
        setErrorMsg('');

        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        api.post('/register', params)
            .then(response => {
                if (response.data.success) {
                    setTimeout(() => {
                        navigate('/profile');
                    }, REDIRECT_DELAY_MS);
                }
            })
            .catch((error) => {
                const message = error.response?.data?.message || 'Ошибка регистрации.';
                setErrorMsg(message);
            });
    };

    return (
        <div style={{ padding: '30px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Arial' }}>
            <h2>📝 Регистрация</h2>
            
            {errorMsg && (
                <div style={{ color: '#dc3545', background: '#f8d7da', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                    type="text"
                    placeholder="Придумайте логин"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    style={{ padding: '8px' }}
                />
                <input
                    type="password"
                    placeholder="Придумайте пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ padding: '8px' }}
                />
                <button type="submit" style={{ padding: '10px' }}>Зарегистрироваться</button>
            </form>
            <p style={{ marginTop: '15px' }}><Link to="/">На главную</Link></p>
        </div>
    );
}