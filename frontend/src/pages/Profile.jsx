import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/** Максимальный размер файла в байтах (5 МБ). */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Время отображения уведомления (в миллисекундах). */
const TOAST_DURATION_MS = 3000;

/**
 * Компонент личного кабинета пользователя.
 * Отображает данные профиля, позволяет обновить аватар и перейти в другие разделы.
 *
 * @returns {JSX.Element} JSX-разметка личного кабинета
 */
export default function Profile() {
    const [user, setUser] = useState(null);
    const [file, setFile] = useState(null);
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/auth')
            .then(response => {
                if (response.data.authenticated) {
                    setUser(response.data);
                } else {
                    navigate('/login');
                }
            })
            .catch(() => navigate('/login'));
    }, [navigate]);

    const showToast = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), TOAST_DURATION_MS);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (!selectedFile.type.startsWith('image/')) {
            showToast('Пожалуйста, выберите файл изображения (JPG, PNG и т.д.).', 'error');
            e.target.value = null;
            setFile(null);
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            showToast('Файл слишком большой. Максимальный размер: 5 МБ.', 'error');
            e.target.value = null;
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = (e) => {
        e.preventDefault();
        
        if (!file) {
            showToast('Сначала выберите файл для загрузки.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        api.post('/profile/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(response => {
            if (response.data.success) {
                setUser(prev => ({ ...prev, avatarPath: response.data.avatarPath }));
                showToast('Фото профиля успешно обновлено!', 'success');
                setFile(null);
                e.target.reset();
            }
        }).catch((error) => {
            const message = error.response?.data?.error || 'Ошибка при загрузке файла.';
            showToast(message, 'error');
        });
    };

    const handleLogout = () => {
        api.delete('/auth').then(() => navigate('/login'));
    };

    if (!user) return <div style={{ padding: '30px' }}>Загрузка профиля...</div>;

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
            
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

            <h2>👤 Личный кабинет</h2>
            <p><strong>Логин:</strong> {user.username}</p>
            <p><strong>Роль в системе:</strong> <span style={{ color: 'blue', fontWeight: 'bold' }}>{user.role}</span></p>

            <div style={{ margin: '20px 0' }}>
                <img 
                    src={user.avatarPath || '/uploads/default.jpg'} 
                    alt="Аватар" 
                    style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #ccc' }} 
                />
            </div>

            <form onSubmit={handleUpload} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                <input type="file" onChange={handleFileChange} accept="image/*" />
                <button type="submit" style={{ width: 'auto', marginTop: 0 }}>Загрузить</button>
            </form>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => navigate('/news')} 
                    style={{ background: '#17a2b8', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto', marginTop: 0 }}
                >
                    К новостям
                </button>

                {user.role === 'ADMIN' && (
                    <button 
                        onClick={() => navigate('/admin')} 
                        style={{ background: '#007bff', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto', marginTop: 0 }}
                    >
                        В админ-панель
                    </button>
                )}
                
                <button 
                    onClick={handleLogout} 
                    style={{ background: '#dc3545', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto', marginTop: 0 }}
                >
                    Выйти из системы
                </button>
            </div>
        </div>
    );
}