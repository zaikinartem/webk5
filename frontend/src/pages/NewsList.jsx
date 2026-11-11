import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * Компонент новостной ленты.
 * Отображает список новостей, статус сервера и элементы навигации.
 *
 * @returns {JSX.Element} JSX-разметка новостной ленты
 */
export default function NewsList() {
    const [news, setNews] = useState([]);
    const [user, setUser] = useState(null);
    const [info, setInfo] = useState({ dateTime: '', visitCount: 0 });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadNews();
        api.get('/auth')
            .then(res => {
                if (res.data.authenticated) setUser(res.data);
            })
            .catch(() => {});
        api.get('/info')
            .then(res => setInfo(res.data))
            .catch(() => {});
    }, []);

    /**
     * Загружает список новостей с сервера.
     */
    const loadNews = () => {
        api.get('/news')
            .then(response => setNews(response.data))
            .catch(error => 
                console.error('Ошибка загрузки новостей:', error)
            );
    };

    /**
     * Выполняет выход пользователя из системы.
     */
    const handleLogout = () => {
        api.delete('/auth').then(() => {
            setUser(null);
            navigate('/login');
        });
    };

    /**
     * Подтверждает и выполняет удаление выбранной новости.
     */
    const confirmDelete = () => {
        if (!deleteTarget) return;
        
        api.delete(`/news/${deleteTarget.id}`)
            .then(() => {
                setNews(news.filter(n => n.id !== deleteTarget.id));
                setDeleteTarget(null);
            })
            .catch((error) => {
                alert(
                    error.response?.data?.error 
                    || 'Ошибка удаления новости'
                );
                setDeleteTarget(null);
            });
    };

    const canManage = user && 
        (user.role === 'ADMIN' || user.role === 'MODERATOR');

    return (
        <div style={{
            background: '#F9FAFB', 
            backgroundImage: 
                'radial-gradient(#F1F5F9 1px, transparent 1px)', 
            backgroundSize: '20px 20px', 
            minHeight: '100vh', 
            fontFamily: "'Inter', sans-serif", 
            color: '#1E293B'
        }}>
            {deleteTarget && (
                <div style={{
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    width: '100vw', 
                    height: '100vh',
                    background: 'rgba(15, 23, 42, 0.6)', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    zIndex: 2000
                }}>
                    <div style={{
                        background: '#fff', 
                        padding: '32px', 
                        borderRadius: '16px',
                        maxWidth: '400px', 
                        width: '90%', 
                        textAlign: 'center', 
                        boxShadow: 
                            '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{
                            marginTop: 0, 
                            color: '#DC2626', 
                            fontSize: '20px'
                        }}>
                            Удаление новости
                        </h3>
                        <p style={{
                            color: '#64748B', 
                            marginBottom: '24px'
                        }}>
                            Вы уверены, что хотите удалить новость 
                            «{deleteTarget.title}»?
                        </p>
                        <div style={{
                            display: 'flex', 
                            gap: '12px', 
                            justifyContent: 'center'
                        }}>
                            <button 
                                onClick={() => setDeleteTarget(null)} 
                                style={{
                                    background: '#F1F5F9', 
                                    color: '#475569', 
                                    padding: '10px 20px', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontWeight: '600', 
                                    width: 'auto', 
                                    marginTop: 0
                                }}
                            >
                                Отмена
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                style={{
                                    background: '#DC2626', 
                                    color: 'white', 
                                    padding: '10px 20px', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontWeight: '600', 
                                    width: 'auto', 
                                    marginTop: 0
                                }}
                            >
                                Да, удалить
                            </button>
                        </div>
                    </div>
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
                        to="/" 
                        style={{
                            textDecoration: 'none', 
                            color: '#64748B', 
                            fontWeight: '500'
                        }}
                    >
                        Главная
                    </Link>
                    <Link 
                        to="/news" 
                        style={{
                            textDecoration: 'none', 
                            color: '#FF4B5C', 
                            fontWeight: '600', 
                            borderBottom: '2px solid #FF4B5C', 
                            paddingBottom: '4px'
                        }}
                    >
                        Новости
                    </Link>
                    {user ? (
                        <>
                            <Link 
                                to="/profile" 
                                style={{
                                    textDecoration: 'none', 
                                    color: '#64748B', 
                                    fontWeight: '500'
                                }}
                            >
                                Профиль
                            </Link>
                            {canManage && (
                                <Link 
                                    to="/news/manage" 
                                    style={{
                                        textDecoration: 'none', 
                                        color: '#10B981', 
                                        fontWeight: '600'
                                    }}
                                >
                                    Управление
                                </Link>
                            )}
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
                            <Link 
                                to="/login" 
                                style={{
                                    textDecoration: 'none', 
                                    color: '#64748B', 
                                    fontWeight: '500'
                                }}
                            >
                                Войти
                            </Link>
                            <Link 
                                to="/register" 
                                style={{
                                    textDecoration: 'none', 
                                    color: '#64748B', 
                                    fontWeight: '500'
                                }}
                            >
                                Регистрация
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            <div style={{
                maxWidth: '800px', 
                margin: '0 auto', 
                padding: '60px 20px'
            }}>
                <div style={{
                    background: '#fff', 
                    border: '1px solid #E2E8F0', 
                    padding: '20px 30px',
                    borderRadius: '16px', 
                    marginBottom: '40px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#64748B', 
                        fontSize: '14px'
                    }}>
                        <svg 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>
                            <strong>Время сервера:</strong> 
                            {' '}{info.dateTime || 'Загрузка...'}
                        </span>
                    </div>
                    <div style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#64748B', 
                        fontSize: '14px'
                    }}>
                        <svg 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>
                            <strong>Всего посещений:</strong> 
                            {' '}{info.visitCount}
                        </span>
                    </div>
                </div>

                <h1 style={{
                    color: '#1E293B', 
                    textAlign: 'center', 
                    marginBottom: '40px', 
                    fontSize: '32px', 
                    fontWeight: '800', 
                    letterSpacing: '-0.5px'
                }}>
                    Новостная лента
                </h1>

                {news.length === 0 ? (
                    <p style={{
                        textAlign: 'center', 
                        color: '#64748B'
                    }}>
                        Пока новостей нет...
                    </p>
                ) : (
                    <div style={{
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '24px'
                    }}>
                        {news.map(item => (
                            <div 
                                key={item.id} 
                                style={{
                                    background: '#fff', 
                                    padding: '32px', 
                                    borderRadius: '16px', 
                                    boxShadow: 
                                        '0 10px 20px -5px rgba(0, 0, 0, 0.05)', 
                                    border: '1px solid #F1F5F9', 
                                    position: 'relative', 
                                    transition: 
                                        'transform 0.2s, box-shadow 0.2s'
                                }} 
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 
                                        'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = 
                                        '0 15px 25px -5px ' +
                                        'rgba(0, 0, 0, 0.08)';
                                }} 
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 
                                        'translateY(0)';
                                    e.currentTarget.style.boxShadow = 
                                        '0 10px 20px -5px ' +
                                        'rgba(0, 0, 0, 0.05)';
                                }}
                            >
                                <h3 style={{
                                    margin: '0 0 16px 0', 
                                    color: '#1E293B', 
                                    fontSize: '22px', 
                                    fontWeight: '700', 
                                    letterSpacing: '-0.5px'
                                }}>
                                    {item.title}
                                </h3>
                                <p style={{
                                    margin: '0 0 24px 0', 
                                    whiteSpace: 'pre-wrap', 
                                    color: '#475569', 
                                    lineHeight: '1.7', 
                                    fontSize: '16px'
                                }}>
                                    {item.content}
                                </p>

                                <div style={{
                                    fontSize: '14px', 
                                    color: '#94A3B8', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    borderTop: '1px solid #F1F5F9', 
                                    paddingTop: '20px'
                                }}>
                                    <span>
                                        Автор: 
                                        <strong style={{ color: '#64748B' }}>
                                            {' '}{item.author}
                                        </strong>
                                    </span>
                                    <span>
                                        {new Date(item.createdAt)
                                            .toLocaleString('ru-RU')}
                                    </span>
                                </div>

                                {canManage && (
                                    <button 
                                        onClick={() => 
                                            setDeleteTarget(item)
                                        }
                                        style={{
                                            position: 'absolute', 
                                            top: '24px', 
                                            right: '24px', 
                                            background: '#FEF2F2', 
                                            color: '#DC2626', 
                                            border: 'none', 
                                            borderRadius: '8px', 
                                            padding: '8px', 
                                            cursor: 'pointer', 
                                            width: 'auto', 
                                            marginTop: 0, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => 
                                            e.currentTarget.style.background = 
                                                '#FEE2E2'
                                        }
                                        onMouseLeave={(e) => 
                                            e.currentTarget.style.background = 
                                                '#FEF2F2'
                                        }
                                        title="Удалить новость"
                                    >
                                        <svg 
                                            width="18" 
                                            height="18" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}