import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/** Время отображения уведомления в миллисекундах. */
const TOAST_DURATION_MS = 3000;

/**
 * Компонент панели управления новостями.
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
    const [deleteTarget, setDeleteTarget] = useState(null);
    const navigate = useNavigate();

    /**
     * Показывает всплывающее уведомление.
     *
     * @param {string} message текст сообщения
     * @param {string} type тип ('success' или 'error')
     */
    const showToast = useCallback((message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), TOAST_DURATION_MS);
    }, []);

    /**
     * Загружает список всех новостей с сервера.
     */
    const loadNews = useCallback(() => {
        api.get('/news/all')
            .then(response => setNews(response.data))
            .catch(() =>
                showToast('Ошибка загрузки новостей', 'error')
            );
    }, [showToast]);

    /**
     * Проверяет права доступа текущего пользователя.
     */
    const checkAccess = useCallback(() => {
        api.get('/auth').then(res => {
            const isAdmin = res.data.role === 'ADMIN';
            const isModerator = res.data.role === 'MODERATOR';

            if (!res.data.authenticated || (!isAdmin && !isModerator)) {
                navigate('/news');
            }
        });
    }, [navigate]);

    useEffect(() => {
        loadNews();
        checkAccess();
    }, [checkAccess, loadNews]);

    /**
     * Обрабатывает отправку формы (создание или обновление).
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
     * Заполняет форму данными выбранной новости.
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
     * Подтверждает и выполняет удаление новости.
     */
    const confirmDelete = () => {
        if (!deleteTarget) return;
        
        api.delete(`/news/${deleteTarget.id}`)
            .then(() => {
                setNews(news.filter(n => n.id !== deleteTarget.id));
                showToast('Новость удалена', 'success');
                setDeleteTarget(null);
            })
            .catch((error) => {
                showToast(
                    error.response?.data?.error 
                    || 'Ошибка удаления', 
                    'error'
                );
                setDeleteTarget(null);
            });
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
                            <div style={{
                                display: 'flex', 
                                gap: '8px'
                            }}>
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
                                <button 
                                    onClick={() => setDeleteTarget(item)}
                                    style={{
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
                                        <path
                                            d={
                                                'M19 6v14a2 2 0 0 1-2 2H7a2 ' +
                                                '2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 ' +
                                                '2-2h4a2 2 0 0 1 2 2v2'
                                            }
                                        ></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}