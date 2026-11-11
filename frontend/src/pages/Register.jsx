import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

/** Время задержки перед редиректом (в миллисекундах). */
const REDIRECT_DELAY_MS = 200;

/**
 * Компонент страницы регистрации.
 *
 * @returns {JSX.Element} JSX-разметка страницы регистрации
 */
export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Не указан');
    const [city, setCity] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    /**
     * Обрабатывает отправку формы регистрации.
     *
     * @param {Event} e событие отправки формы
     */
    const handleRegister = (e) => {
        e.preventDefault();
        setErrorMsg('');

        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        if (age) params.append('age', age);
        if (gender) params.append('gender', gender);
        if (city) params.append('city', city);

        api.post('/register', params)
            .then(response => {
                if (response.data.success) {
                    setTimeout(() => {
                        navigate('/');
                    }, REDIRECT_DELAY_MS);
                }
            })
            .catch((error) => {
                const message = error.response?.data?.message 
                    || 'Ошибка регистрации.';
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
                maxWidth: '450px', 
                border: '1px solid #F1F5F9'
            }}>
                <h2 style={{
                    textAlign: 'center', 
                    fontSize: '28px', 
                    fontWeight: '800', 
                    marginBottom: '8px', 
                    color: '#1E293B'
                }}>
                    Создать аккаунт
                </h2>
                <p style={{
                    textAlign: 'center', 
                    color: '#64748B', 
                    marginBottom: '32px', 
                    fontSize: '15px'
                }}>
                    Присоединяйтесь к сообществу LoveConnect
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
                    onSubmit={handleRegister} 
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
                            placeholder="Придумайте логин" 
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
                            placeholder="Придумайте пароль" 
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

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                color: '#475569', 
                                marginBottom: '6px'
                            }}>
                                Возраст
                            </label>
                            <input 
                                type="number" 
                                placeholder="18" 
                                value={age} 
                                onChange={e => setAge(e.target.value)} 
                                min="18" 
                                max="100" 
                                style={{
                                    width: '100%', 
                                    padding: '12px 14px', 
                                    background: '#F8FAFC'
                                }} 
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                color: '#475569', 
                                marginBottom: '6px'
                            }}>
                                Пол
                            </label>
                            <select 
                                value={gender} 
                                onChange={e => setGender(e.target.value)} 
                                style={{
                                    width: '100%', 
                                    padding: '12px 14px', 
                                    background: '#F8FAFC'
                                }}
                            >
                                <option value="Не указан">Не указан</option>
                                <option value="Мужской">Мужской</option>
                                <option value="Женский">Женский</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#475569', 
                            marginBottom: '6px'
                        }}>
                            Город
                        </label>
                        <input 
                            type="text" 
                            placeholder="Ваш город" 
                            value={city} 
                            onChange={e => setCity(e.target.value)} 
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
                        Зарегистрироваться
                    </button>
                </form>

                <p style={{
                    textAlign: 'center', 
                    marginTop: '24px', 
                    fontSize: '14px', 
                    color: '#64748B'
                }}>
                    Уже есть аккаунт?{' '}
                    <Link 
                        to="/login" 
                        style={{ color: '#FF4B5C', fontWeight: '600' }}
                        >
                        Войти
                    </Link>
                </p>
            </div>
        </div>
    );
}