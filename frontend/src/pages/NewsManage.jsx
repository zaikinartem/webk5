import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
     * Загружает список новостей с сервера.
     */
    const loadNews = () => {
        api.get('/news')
            .then(response => setNews(response.data))
            .catch(() => showToast('Ошибка загрузки новостей', 'error'));
    };

    /**
     * Проверяет, имеет ли текущий пользователь доступ к панели.
     */
    const checkAccess = () => {
        api.get('/auth').then(res => {
            if (!res.data.authenticated || (res.data.role !== 'ADMIN' && res.data.role !== 'MODERATOR')) {
                navigate('/news');
            }
        });
    };

    /**
     * Показывает всплывающее уведомление.
     * @param {string} message текст сообщения
     * @param {string} type тип ('success' или 'error')
     */
    const showToast = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    /**
     * Обрабатывает сохранение новости (создание или обновление).
     * @param {Event} e событие отправки формы
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!title.trim() || !content.trim()) {
            showToast('Заполните заголовок и текст новости.', 'error');
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
                .catch(() => showToast('Ошибка обновления', 'error'));
        } else {
            api.post('/news', params)
                .then(() => {
                    showToast('Новость добавлена!', 'success');
                    resetForm();
                    loadNews();
                })
                .catch(() => showToast('Ошибка добавления', 'error'));
        }
    };

    /**
     * Заполняет форму данными выбранной новости для редактирования.
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
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            
            {notification && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px',
                    background: notification.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: notification.type === 'success' ? '#155724' : '#721c24',
                    padding: '15px 25px', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000, fontWeight: 'bold',
                    border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    {notification.message}
                </div>
            )}

            <h2>⚙️ Управление новостями</h2>
            <button 
                onClick={() => navigate('/news')} 
                style={{ background: '#6c757d', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto', marginBottom: '20px' }}
            >
                ← К ленте новостей
            </button>

            <form onSubmit={handleSubmit} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0 }}>{editingId ? 'Редактировать новость' : 'Добавить новость'}</h3>
                <input 
                    type="text" 
                    placeholder="Заголовок" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
                <textarea 
                    placeholder="Текст новости" 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    rows="5"
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto', marginTop: 0 }}>
                        {editingId ? 'Сохранить изменения' : 'Опубликовать'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={resetForm} style={{ background: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto', marginTop: 0 }}>
                            Отмена
                        </button>
                    )}
                </div>
            </form>

            <h3>Список новостей</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {news.map(item => (
                    <div key={item.id} style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>{item.title}</strong>
                            <div style={{ fontSize: '12px', color: '#666' }}>{item.author} | {new Date(item.createdAt).toLocaleString('ru-RU')}</div>
                        </div>
                        <button 
                            onClick={() => handleEdit(item)}
                            style={{ background: '#ffc107', color: '#000', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto', marginTop: 0 }}
                        >
                            ✏️ Редактировать
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}