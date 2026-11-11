import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import heroImage from '../assets/hero.jpg';

/** Время отображения уведомления в миллисекундах. */
const TOAST_DURATION_MS = 3000;

/**
 * Главная страница сайта знакомств.
 * Отображает приветствие, информацию о проекте и список анкет.
 *
 * @returns {JSX.Element} JSX-разметка главной страницы
 */
export default function Home() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/auth')
            .then(res => {
                if (res.data.authenticated) {
                    setCurrentUser(res.data);
                }
            })
            .catch(() => {});

        api.get('/auth/all')
            .then(res => setUsers(res.data))
            .catch(error => 
                console.error('Ошибка загрузки пользователей:', error)
            );
    }, []);

    /**
     * Показывает всплывающее уведомление.
     *
     * @param {string} message текст сообщения
     * @param {string} type тип уведомления ('success' или 'error')
     */
    const showToast = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), TOAST_DURATION_MS);
    };

    /**
     * Отправляет лайк выбранному пользователю.
     *
     * @param {number} targetId идентификатор пользователя
     */
    const handleLike = (targetId) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        api.post(`/user/like/${targetId}`)
            .then(() => showToast('Лайк отправлен!', 'success'))
            .catch((error) => 
                showToast(
                    error.response?.data?.error || 'Ошибка лайка.', 
                    'error'
                )
            );
    };

    /**
     * Выполняет выход пользователя из системы.
     */
    const handleLogout = () => {
        api.delete('/auth').then(() => {
            setCurrentUser(null);
            navigate('/login');
        });
    };

    return (
        <div style={{
            background: '#F9FAFB', 
            backgroundImage: 'radial-gradient(#F1F5F9 1px, transparent 1px)', 
            backgroundSize: '20px 20px', 
            minHeight: '100vh', 
            fontFamily: "'Inter', sans-serif", 
            color: '#1E293B'
        }}>
            {notification && (
                <div style={{
                    position: 'fixed', 
                    top: '24px', 
                    right: '24px',
                    background: notification.type === 'success' 
                        ? '#ECFDF5' 
                        : '#FEF2F2',
                    color: notification.type === 'success' 
                        ? '#065F46' 
                        : '#991B1B',
                    padding: '16px 24px', 
                    borderRadius: '12px', 
                    zIndex: 1000, 
                    fontWeight: '600',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: `1px solid ${
                        notification.type === 'success' 
                            ? '#A7F3D0' 
                            : '#FECACA'
                    }`
                }}>
                    {notification.message}
                </div>
            )}

            <header style={{
                background: 'rgba(255, 255, 255, 0.9)', 
                backdropFilter: 'blur(10px)', 
                padding: '20px 40px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid #E2E8F0', 
                position: 'sticky', 
                top: 0, 
                zIndex: 100
            }}>
                <h2 style={{
                    margin: 0, 
                    color: '#FF4B5C', 
                    fontSize: '24px', 
                    fontWeight: '800', 
                    letterSpacing: '-0.5px'
                }}>
                    LoveConnect
                </h2>
                <nav style={{
                    display: 'flex', 
                    gap: '24px', 
                    alignItems: 'center'
                }}>
                    <Link 
                        to="/news" 
                        style={{
                            textDecoration: 'none', 
                            color: '#64748B', 
                            fontWeight: '500'
                        }}
                    >
                        Новости
                    </Link>
                    {currentUser ? (
                        <>
                            <Link 
                                to="/profile" 
                                style={{
                                    textDecoration: 'none', 
                                    color: '#64748B', 
                                    fontWeight: '500'
                                }}
                            >
                                Профиль ({currentUser.username})
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                style={{
                                    background: '#F1F5F9', 
                                    color: '#475569', 
                                    padding: '8px 16px', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontWeight: '600', 
                                    width: 'auto', 
                                    marginTop: 0
                                }}
                            >
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <button style={{
                                    background: '#FF4B5C', 
                                    color: 'white', 
                                    padding: '10px 20px', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontWeight: '600', 
                                    width: 'auto', 
                                    marginTop: 0, 
                                    boxShadow: '0 4px 6px -1px rgba(255, 75, 92, 0.3)'
                                }}>
                                    Войти
                                </button>
                            </Link>
                            <Link to="/register">
                                <button style={{
                                    background: '#1E293B', 
                                    color: 'white', 
                                    padding: '10px 20px', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontWeight: '600', 
                                    width: 'auto', 
                                    marginTop: 0
                                }}>
                                    Регистрация
                                </button>
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            <section style={{
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '80px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                flexWrap: 'wrap', 
                gap: '40px'
            }}>
                <div style={{ flex: '1 1 400px' }}>
                    <h1 style={{
                        fontSize: '52px', 
                        fontWeight: '800', 
                        lineHeight: '1.1', 
                        marginBottom: '24px', 
                        letterSpacing: '-1px'
                    }}>
                        Здесь начинаются{' '}
                        <span style={{ color: '#FF4B5C', position: 'relative' }}>
                            настоящие
                        </span>{' '}
                        истории
                    </h1>
                    <p style={{
                        fontSize: '18px', 
                        color: '#475569', 
                        lineHeight: '1.7', 
                        marginBottom: '32px', 
                        maxWidth: '500px'
                    }}>
                        Мы верим, что одиночество — это временно. 
                        Тысячи людей уже нашли своих здесь. 
                        Не бойся сделать первый шаг, возможно, 
                        твоя половинка ждет тебя прямо сейчас.
                    </p>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        {!currentUser ? (
                            <>
                                <Link 
                                    to="/register" 
                                    style={{ textDecoration: 'none' }}
                                >
                                    <button 
                                        style={{
                                            background: '#FF4B5C', 
                                            color: 'white', 
                                            padding: '16px 36px', 
                                            border: 'none', 
                                            borderRadius: '12px', 
                                            fontSize: '16px', 
                                            fontWeight: '600', 
                                            cursor: 'pointer', 
                                            width: 'auto', 
                                            marginTop: 0, 
                                            boxShadow: 
                                                '0 10px 15px -3px rgba(255, 75, 92, 0.4)', 
                                            transition: 'transform 0.2s'
                                        }} 
                                        onMouseEnter={(e) => 
                                            e.currentTarget.style.transform = 
                                                'translateY(-2px)'
                                        } 
                                        onMouseLeave={(e) => 
                                            e.currentTarget.style.transform = 
                                                'translateY(0)'
                                        }
                                    >
                                        Создать анкету
                                    </button>
                                </Link>
                                <Link 
                                    to="/news" 
                                    style={{ textDecoration: 'none' }}
                                >
                                    <button 
                                        style={{
                                            background: '#fff', 
                                            color: '#1E293B', 
                                            padding: '16px 36px', 
                                            border: '1px solid #E2E8F0', 
                                            borderRadius: '12px', 
                                            fontSize: '16px', 
                                            fontWeight: '600', 
                                            cursor: 'pointer', 
                                            width: 'auto', 
                                            marginTop: 0, 
                                            transition: 'transform 0.2s'
                                        }} 
                                        onMouseEnter={(e) => 
                                            e.currentTarget.style.transform = 
                                                'translateY(-2px)'
                                        } 
                                        onMouseLeave={(e) => 
                                            e.currentTarget.style.transform = 
                                                'translateY(0)'
                                        }
                                    >
                                        Узнать больше
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <Link 
                                to="/profile" 
                                style={{ textDecoration: 'none' }}
                            >
                                <button style={{
                                    background: '#FF4B5C', 
                                    color: 'white', 
                                    padding: '16px 36px', 
                                    border: 'none', 
                                    borderRadius: '12px', 
                                    fontSize: '16px', 
                                    fontWeight: '600', 
                                    cursor: 'pointer', 
                                    width: 'auto', 
                                    marginTop: 0, 
                                    boxShadow: 
                                        '0 10px 15px -3px rgba(255, 75, 92, 0.4)'
                                }}>
                                    Перейти в профиль
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
                <div style={{
                    flex: '1 1 400px', 
                    display: 'flex', 
                    justifyContent: 'center'
                }}>
                    <div 
                        style={{
                            width: '100%', 
                            maxWidth: '450px', 
                            height: '450px', 
                            borderRadius: '30px', 
                            overflow: 'hidden', 
                            boxShadow: 
                                '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                            border: '8px solid #fff', 
                            transform: 'rotate(2deg)', 
                            transition: 'transform 0.3s'
                        }} 
                        onMouseEnter={(e) => 
                            e.currentTarget.style.transform = 
                                'rotate(0deg) scale(1.02)'
                        } 
                        onMouseLeave={(e) => 
                            e.currentTarget.style.transform = 
                                'rotate(2deg) scale(1)'
                        }
                    >
                        <img 
                            src={heroImage} 
                            alt="LoveConnect" 
                            style={{
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover'
                            }} 
                        />
                    </div>
                </div>
            </section>

            <section style={{
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '40px 20px 100px'
            }}>
                <h2 style={{
                    fontSize: '32px', 
                    fontWeight: '800', 
                    marginBottom: '40px', 
                    textAlign: 'center', 
                    letterSpacing: '-0.5px'
                }}>
                    Анкеты, которые ждут тебя
                </h2>

                <div style={{
                    display: 'grid', 
                    gridTemplateColumns: 
                        'repeat(auto-fill, minmax(280px, 1fr))', 
                    gap: '30px'
                }}>
                    {users.map(u => (
                        <div 
                            key={u.id} 
                            style={{
                                background: '#fff', 
                                borderRadius: '24px', 
                                padding: '30px', 
                                textAlign: 'center', 
                                boxShadow: 
                                    '0 4px 6px -1px rgba(0, 0, 0, 0.05), ' +
                                    '0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
                                border: '1px solid #F1F5F9', 
                                transition: 
                                    'transform 0.3s ease, box-shadow 0.3s ease'
                            }} 
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 
                                    'translateY(-8px)';
                                e.currentTarget.style.boxShadow = 
                                    '0 20px 25px -5px rgba(0, 0, 0, 0.1), ' +
                                    '0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                            }} 
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 
                                    'translateY(0)';
                                e.currentTarget.style.boxShadow = 
                                    '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                            }}
                        >
                            <div style={{
                                position: 'relative', 
                                display: 'inline-block', 
                                marginBottom: '20px'
                            }}>
                                <img 
                                    src={u.avatarPath || '/uploads/default.jpg'} 
                                    alt={u.username} 
                                    style={{
                                        width: '120px', 
                                        height: '120px', 
                                        objectFit: 'cover', 
                                        borderRadius: '50%', 
                                        border: '4px solid #fff', 
                                        boxShadow: 
                                            '0 4px 10px rgba(0,0,0,0.1)'
                                    }} 
                                />
                            </div>

                            <h3 style={{
                                margin: '0 0 8px 0', 
                                fontSize: '22px', 
                                fontWeight: '700'
                            }}>
                                {u.username}
                            </h3>

                            <div style={{
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '8px', 
                                color: '#64748B', 
                                fontSize: '14px', 
                                marginBottom: '24px'
                            }}>
                                {u.age && <span>{u.age} лет</span>}
                                {u.city && <span>• {u.city}</span>}
                            </div>

                            {currentUser && 
                             currentUser.username === u.username ? (
                                <div style={{
                                    width: '100%', 
                                    background: '#F8FAFC', 
                                    color: '#94A3B8', 
                                    padding: '14px', 
                                    borderRadius: '12px', 
                                    fontWeight: '600', 
                                    fontSize: '15px', 
                                    border: '1px solid #E2E8F0', 
                                    textAlign: 'center'
                                }}>
                                    Это вы
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleLike(u.id)}
                                    style={{
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: '8px', 
                                        width: '100%', 
                                        background: '#FFF1F2', 
                                        color: '#FF4B5C', 
                                        padding: '14px', 
                                        border: 'none', 
                                        borderRadius: '12px', 
                                        cursor: 'pointer', 
                                        fontWeight: '600', 
                                        fontSize: '15px', 
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 
                                            '#FF4B5C';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 
                                            '#FFF1F2';
                                        e.currentTarget.style.color = 
                                            '#FF4B5C';
                                    }}
                                >
                                    <svg 
                                        width="18" 
                                        height="18" 
                                        viewBox="0 0 24 24" 
                                        fill="currentColor" 
                                        stroke="none"
                                    >
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                    Лайкнуть
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}