import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * Компонент новостной ленты.
 * Отображает список новостей, данные о статусе сервера и элементы навигации.
 *
 * @returns {JSX.Element} JSX-разметка новостной ленты
 */
export default function NewsList() {
    const [news, setNews] = useState([]);
    const [user, setUser] = useState(null);
    const [info, setInfo] = useState({ dateTime: '', visitCount: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/news')
            .then(response => setNews(response.data))
            .catch(error => console.error('Ошибка загрузки новостей:', error));

        api.get('/auth')
            .then(response => {
                if (response.data.authenticated) {
                    setUser(response.data);
                }
            })
            .catch(() => {});

        api.get('/info')
            .then(response => setInfo(response.data))
            .catch(error => console.error('Ошибка загрузки счетчика:', error));
    }, []);

    /**
     * Выполняет выход из системы и перенаправляет на страницу входа.
     */
    const handleLogout = () => {
        api.delete('/auth').then(() => {
            setUser(null);
            navigate('/login');
        });
    };

    const canManage = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '30px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '8px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ margin: 0 }}>📰 Новости LoveConnect</h2>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {user ? (
                        <>
                            {canManage && (
                                <button 
                                    onClick={() => navigate('/news/manage')} 
                                    style={{ background: '#28a745', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto', marginTop: 0 }}
                                >
                                    ⚙️ Управление
                                </button>
                            )}
                            <button 
                                onClick={() => navigate('/profile')} 
                                style={{ background: '#007bff', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto', marginTop: 0 }}
                            >
                                👤 Профиль
                            </button>
                            <button 
                                onClick={handleLogout} 
                                style={{ background: '#dc3545', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto', marginTop: 0 }}
                            >
                                🚪 Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login"><button style={{ background: '#ff4b5c', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto', marginTop: 0 }}>Войти</button></Link>
                            <Link to="/register"><button style={{ background: '#6c757d', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto', marginTop: 0 }}>Регистрация</button></Link>
                        </>
                    )}
                </div>
            </div>

            <div style={{ 
                background: '#fff5f6', border: '1px solid #ffd1d5', padding: '15px', 
                borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-around'
            }}>
                <span>📅 <strong>Время:</strong> {info.dateTime || 'Загрузка...'}</span>
                <span>👁 <strong>Посещений:</strong> {info.visitCount}</span>
            </div>

            <p style={{ textAlign: 'center', color: '#666' }}>Последние события нашего портала</p>

            {news.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>Пока новостей нет...</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                    {news.map(item => (
                        <div key={item.id} style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#ff4b5c' }}>{item.title}</h3>
                            <p style={{ margin: '0 0 15px 0', whiteSpace: 'pre-wrap', color: '#444' }}>{item.content}</p>
                            <div style={{ fontSize: '12px', color: '#999', display: 'flex', justifyContent: 'space-between' }}>
                                <span>✍️ Автор: {item.author}</span>
                                <span>📅 {new Date(item.createdAt).toLocaleString('ru-RU')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}