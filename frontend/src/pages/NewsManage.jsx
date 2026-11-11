import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/** Время отображения уведомления в миллисекундах. */
const TOAST_DURATION_MS = 3000;

/**
 * Компонент панели управления новостями для модераторов и администраторов.
 * Позволяет создавать, редактировать и удалять новости.
 *
 * @returns {JSX.Element} JSX-разметка панели управления
 */
export default function NewsManage() {
    const [news, setNews] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadNews();
        checkAccess();
    }, []);

    /**
     * Загружает список всех новостей с сервера.
     */
    const loadNews = () => {
        api.get('/news')
            .then(response => setNews(response.data))
            .catch(() => 
                showToast('Ошибка загрузки новостей', 'error')
            );
    };

    /**
     * Проверяет права доступа текущего пользователя к панели.
     * Перенаправляет на ленту, если прав недостаточно.
     */
    const checkAccess = () => {
        api.get('/auth').then(res => {
            const isAdmin = res.data.role === 'ADMIN';
            const isModerator = res.data.role === 'MODERATOR';
            
            if (!res.data.authenticated || (!isAdmin && !isModerator)) {
                navigate('/news');
            }
        });
    };

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
     * Обрабатывает отправку формы (создание или обновление новости).
     *
     * @param {Event} e событие отправки формы
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            showToast(
                'Заполните заголовок и текст новости.', 
                'error'
            );
            return;
        }

        const params = new URLSearchParams();
        params.append('title', title);
        params.append('content', content);

        if (editingId) {
            api.put(`/news/${editingId}`, params)
                .then(() => {
                    showToast('Новость обновлена!', 'success');
                    resetForm();
                    loadNews();
                })
                .catch((error) => {
                    showToast(
                        error.response?.data?.error 
                        || 'Ошибка обновления', 
                        'error'
                    );
                });
        } else {
            api.post('/news', params)
                .then(() => {
                    showToast('Новость добавлена!', 'success');
                    resetForm();
                    loadNews();
                })
                .catch((error) => {
                    showToast(
                        error.response?.data?.error 
                        || 'Ошибка добавления', 
                        'error'
                    );
                });
        }
    };

    /**
     * Заполняет форму данными выбранной новости для редактирования.
     *
     * @param {Object} item объект новости
     */
    const handleEdit = (item) => {
        setEditingId(item.id);
        setTitle(item.title);
        setContent(item.content);
        window.scrollTo(0, 0);
    };

    /**
     * Сбрасывает форму редактирования.
     */
    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setContent('');
    };

    return (
        <div style={{
            background: '#F9FAFB', 
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
                background: '#fff', 
                padding: '20px 40px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <h2 style={{
                    margin: 0, 
                    color: '#FF4B5C', 
                    fontSize: '24px', 
                    fontWeight: '700'
                }}>
                    LoveConnect
                </h2>
                <button 
                    onClick={() => navigate('/news')} 
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
                    Назад к ленте
                </button>
            </header>

            <div style={{
                maxWidth: '800px', 
                margin: '0 auto', 
                padding: '60px 20px'
            }}>
                <h1 style={{
                    fontSize: '32px', 
                    fontWeight: '800', 
                    marginBottom: '40px'
                }}>
                    Управление новостями
                </h1>

                <form 
                    onSubmit={handleSubmit} 
                    style={{
                        background: '#fff', 
                        padding: '32px', 
                        borderRadius: '16px', 
                        border: '1px solid #F1F5F9', 
                        boxShadow: 
                            '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
                        marginBottom: '40px'
                    }}
                >
                    <h3 style={{
                        marginTop: 0, 
                        fontSize: '20px', 
                        marginBottom: '20px'
                    }}>
                        {editingId 
                            ? 'Редактировать новость' 
                            : 'Добавить новость'}
                    </h3>

                    <div style={{
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '16px'
                    }}>
                        <input 
                            type="text" 
                            placeholder="Заголовок" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            style={{
                                width: '100%', 
                                padding: '14px', 
                                background: '#F8FAFC'
                            }}
                        />
                        <textarea 
                            placeholder="Текст новости" 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)} 
                            rows="6"
                            style={{
                                width: '100%', 
                                padding: '14px', 
                                background: '#F8FAFC', 
                                resize: 'vertical'
                            }}
                        />
                        <div style={{
                            display: 'flex', 
                            gap: '12px'
                        }}>
                            <button 
                                type="submit" 
                                style={{
                                    background: '#FF4B5C', 
                                    color: 'white', 
                                    padding: '12px 24px', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontWeight: '600', 
                                    width: 'auto', 
                                    marginTop: 0
                                }}
                            >
                                {editingId 
                                    ? 'Сохранить изменения' 
                                    : 'Опубликовать'}
                            </button>
                            {editingId && (
                                <button 
                                    type="button" 
                                    onClick={resetForm} 
                                    style={{
                                        background: '#F1F5F9', 
                                        color: '#475569', 
                                        padding: '12px 24px', 
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
                            )}
                        </div>
                    </div>
                </form>

                <h3 style={{
                    fontSize: '20px', 
                    marginBottom: '20px'
                }}>
                    Существующие новости
                </h3>
                <div style={{
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '16px'
                }}>
                    {news.map(item => (
                        <div 
                            key={item.id} 
                            style={{
                                background: '#fff', 
                                padding: '20px', 
                                borderRadius: '12px', 
                                border: '1px solid #F1F5F9', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                boxShadow: 
                                    '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                        >
                            <div>
                                <strong style={{
                                    fontSize: '16px', 
                                    display: 'block', 
                                    marginBottom: '4px'
                                }}>
                                    {item.title}
                                </strong>
                                <div style={{
                                    fontSize: '13px', 
                                    color: '#64748B'
                                }}>
                                    {item.author} | 
                                    {' '}{new Date(item.createdAt)
                                        .toLocaleString('ru-RU')}
                                </div>
                            </div>
                            <button 
                                onClick={() => handleEdit(item)}
                                style={{
                                    background: '#F8FAFC', 
                                    color: '#1E293B', 
                                    padding: '8px 16px', 
                                    border: '1px solid #E2E8F0', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    width: 'auto', 
                                    marginTop: 0, 
                                    fontWeight: '500', 
                                    fontSize: '14px'
                                }}
                            >
                                Редактировать
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}