import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/** Максимальный размер файла в байтах (5 МБ). */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Время отображения уведомления (в миллисекундах). */
const TOAST_DURATION_MS = 3000;

/**
 * Компонент личного кабинета пользователя.
 * Отображает данные профиля, избранных и позволяет редактировать данные.
 *
 * @returns {JSX.Element} JSX-разметка личного кабинета
 */
export default function Profile() {
    const [user, setUser] = useState(null);
    const [file, setFile] = useState(null);
    const [notification, setNotification] = useState(null);
    const [likedUsers, setLikedUsers] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [editUsername, setEditUsername] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editAge, setEditAge] = useState('');
    const [editGender, setEditGender] = useState('');
    const [editCity, setEditCity] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        loadUserData();
        loadLikedUsers();
    }, [navigate]);

    /**
     * Загружает данные текущего пользователя из сессии.
     */
    const loadUserData = () => {
        api.get('/auth')
            .then(response => {
                if (response.data.authenticated) {
                    setUser(response.data);
                    setEditUsername(response.data.username);
                    setEditAge(response.data.age || '');
                    setEditGender(response.data.gender || 'Не указан');
                    setEditCity(response.data.city || '');
                } else {
                    navigate('/login');
                }
            })
            .catch(() => navigate('/login'));
    };

    /**
     * Загружает список пользователей, которых текущий лайкнул.
     */
    const loadLikedUsers = () => {
        api.get('/user/liked')
            .then(res => setLikedUsers(res.data))
            .catch(() => {});
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
     * Проверяет и сохраняет выбранный файл аватара.
     *
     * @param {Event} e событие выбора файла
     */
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            setFile(null);
            return;
        }
        if (!selectedFile.type.startsWith('image/')) {
            showToast('Пожалуйста, выберите изображение.', 'error');
            e.target.value = null;
            setFile(null);
            return;
        }
        if (selectedFile.size > MAX_FILE_SIZE) {
            showToast('Файл слишком большой (макс. 5 МБ).', 'error');
            e.target.value = null;
            setFile(null);
            return;
        }
        setFile(selectedFile);
    };

    /**
     * Отправляет выбранный файл аватара на сервер.
     *
     * @param {Event} e событие отправки формы
     */
    const handleUpload = (e) => {
        e.preventDefault();
        if (!file) {
            showToast('Сначала выберите файл.', 'error');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);

        api.post('/profile/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(response => {
            if (response.data.success) {
                setUser(prev => ({ 
                    ...prev, avatarPath: response.data.avatarPath 
                }));
                showToast('Аватар обновлен!', 'success');
                setFile(null);
                e.target.reset();
            }
        }).catch((error) => {
            showToast(
                error.response?.data?.error || 'Ошибка загрузки.', 
                'error'
            );
        });
    };

    /**
     * Сохраняет изменения данных профиля.
     *
     * @param {Event} e событие отправки формы
     */
    const handleUpdateProfile = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        params.append('newUsername', editUsername);
        if (editPassword) params.append('password', editPassword);
        if (editAge) params.append('age', editAge);
        if (editGender) params.append('gender', editGender);
        if (editCity) params.append('city', editCity);

        api.put('/user/profile', params)
            .then(() => {
                showToast('Профиль обновлен!', 'success');
                loadUserData();
                setIsEditModalOpen(false);
                setEditPassword('');
            })
            .catch((error) => {
                showToast(
                    error.response?.data?.error || 'Ошибка обновления.', 
                    'error'
                );
            });
    };

    /**
     * Убирает лайк у выбранного пользователя.
     *
     * @param {number} targetId идентификатор пользователя
     */
    const handleUnlike = (targetId) => {
        api.delete(`/user/like/${targetId}`)
            .then(() => {
                setLikedUsers(
                    likedUsers.filter(u => u.id !== targetId)
                );
                showToast('Лайк убран.', 'success');
            })
            .catch(() => 
                showToast('Ошибка при удалении лайка.', 'error')
            );
    };

    /**
     * Выполняет выход пользователя из системы.
     */
    const handleLogout = () => {
        api.delete('/auth').then(() => navigate('/login'));
    };

    if (!user) {
        return (
            <div style={{
                padding: '30px', 
                textAlign: 'center', 
                fontFamily: "'Inter', sans-serif"
            }}>
                Загрузка профиля...
            </div>
        );
    }

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

            {isEditModalOpen && (
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
                        padding: '40px', 
                        borderRadius: '16px', 
                        maxWidth: '450px', 
                        width: '90%', 
                        boxShadow: 
                            '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{
                            marginTop: 0, 
                            fontSize: '22px', 
                            marginBottom: '24px'
                        }}>
                            Редактировать профиль
                        </h3>
                        <form 
                            onSubmit={handleUpdateProfile} 
                            style={{
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '16px'
                            }}
                        >
                            <input 
                                type="text" 
                                value={editUsername} 
                                onChange={e => 
                                    setEditUsername(e.target.value)
                                } 
                                placeholder="Логин" 
                                required 
                                style={{ padding: '12px' }} 
                            />
                            <input 
                                type="password" 
                                value={editPassword} 
                                onChange={e => 
                                    setEditPassword(e.target.value)
                                } 
                                placeholder="Новый пароль (оставьте пустым)" 
                                style={{ padding: '12px' }} 
                            />
                            <input 
                                type="number" 
                                value={editAge} 
                                onChange={e => 
                                    setEditAge(e.target.value)
                                } 
                                placeholder="Возраст" 
                                min="18" 
                                max="100" 
                                style={{ padding: '12px' }} 
                            />
                            <select 
                                value={editGender} 
                                onChange={e => 
                                    setEditGender(e.target.value)
                                } 
                                style={{ padding: '12px' }}
                            >
                                <option value="Не указан">Не указан</option>
                                <option value="Мужской">Мужской</option>
                                <option value="Женский">Женский</option>
                            </select>
                            <input 
                                type="text" 
                                value={editCity} 
                                onChange={e => 
                                    setEditCity(e.target.value)
                                } 
                                placeholder="Город" 
                                style={{ padding: '12px' }} 
                            />

                            <div style={{
                                display: 'flex', 
                                gap: '12px', 
                                marginTop: '16px'
                            }}>
                                <button 
                                    type="button" 
                                    onClick={() => 
                                        setIsEditModalOpen(false)
                                    } 
                                    style={{
                                        flex: 1, 
                                        background: '#F1F5F9', 
                                        color: '#475569', 
                                        padding: '12px', 
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
                                    type="submit" 
                                    style={{
                                        flex: 1, 
                                        background: '#FF4B5C', 
                                        color: 'white', 
                                        padding: '12px', 
                                        border: 'none', 
                                        borderRadius: '8px', 
                                        cursor: 'pointer', 
                                        fontWeight: '600', 
                                        width: 'auto', 
                                        marginTop: 0
                                    }}
                                >
                                    Сохранить
                                </button>
                            </div>
                        </form>
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
                <div style={{ display: 'flex', gap: '16px' }}>
                    {user.role === 'ADMIN' && (
                        <button 
                            onClick={() => navigate('/admin')} 
                            style={{
                                background: '#1E293B', 
                                color: 'white', 
                                padding: '8px 16px', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontWeight: '600', 
                                width: 'auto', 
                                marginTop: 0
                            }}
                        >
                            Админ-панель
                        </button>
                    )}
                    <button 
                        onClick={() => navigate('/')} 
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
                        На главную
                    </button>
                    <button 
                        onClick={handleLogout} 
                        style={{
                            background: '#FEF2F2', 
                            color: '#DC2626', 
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
                </div>
            </header>

            <div style={{
                maxWidth: '1000px', 
                margin: '0 auto', 
                padding: '60px 20px', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '40px'
            }}>
                <div style={{
                    background: '#fff', 
                    padding: '40px', 
                    borderRadius: '24px', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', 
                    textAlign: 'center', 
                    border: '1px solid #F1F5F9', 
                    height: 'fit-content'
                }}>
                    <div style={{
                        position: 'relative', 
                        display: 'inline-block', 
                        marginBottom: '24px'
                    }}>
                        <img 
                            src={user.avatarPath || '/uploads/default.jpg'} 
                            alt="Аватар" 
                            style={{
                                width: '160px', 
                                height: '160px', 
                                objectFit: 'cover', 
                                borderRadius: '50%', 
                                border: '4px solid #fff', 
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }} 
                        />
                    </div>

                    <h2 style={{
                        margin: '0 0 8px 0', 
                        fontSize: '28px', 
                        fontWeight: '700'
                    }}>
                        {user.username}
                    </h2>
                    <p style={{
                        margin: '0 0 24px 0', 
                        color: '#FF4B5C', 
                        fontWeight: '600', 
                        fontSize: '14px', 
                        letterSpacing: '0.5px', 
                        textTransform: 'uppercase'
                    }}>
                        {user.role}
                    </p>

                    <div style={{
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '12px', 
                        textAlign: 'left', 
                        background: '#F8FAFC', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontSize: '15px'
                        }}>
                            <span style={{ color: '#64748B' }}>Возраст:</span>
                            <span style={{ fontWeight: '600' }}>
                                {user.age || 'Не указан'}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontSize: '15px'
                        }}>
                            <span style={{ color: '#64748B' }}>Пол:</span>
                            <span style={{ fontWeight: '600' }}>
                                {user.gender || 'Не указан'}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontSize: '15px'
                        }}>
                            <span style={{ color: '#64748B' }}>Город:</span>
                            <span style={{ fontWeight: '600' }}>
                                {user.city || 'Не указан'}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontSize: '15px', 
                            borderTop: '1px solid #E2E8F0', 
                            paddingTop: '12px'
                        }}>
                            <span style={{ color: '#64748B' }}>
                                Входов на сайт:
                            </span>
                            <span style={{ fontWeight: '600' }}>
                                {user.loginCount || 0}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsEditModalOpen(true)} 
                        style={{
                            width: '100%', 
                            background: '#1E293B', 
                            color: 'white', 
                            padding: '14px', 
                            border: 'none', 
                            borderRadius: '10px', 
                            cursor: 'pointer', 
                            fontWeight: '600', 
                            marginBottom: '16px'
                        }}
                    >
                        Редактировать профиль
                    </button>

                    <form 
                        onSubmit={handleUpload} 
                        style={{
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px'
                        }}
                    >
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            style={{ fontSize: '13px', padding: '8px' }} 
                        />
                        <button 
                            type="submit" 
                            style={{
                                width: '100%', 
                                background: '#F1F5F9', 
                                color: '#475569', 
                                padding: '12px', 
                                border: 'none', 
                                borderRadius: '10px', 
                                cursor: 'pointer', 
                                fontWeight: '600'
                            }}
                        >
                            Обновить фото
                        </button>
                    </form>
                </div>

                <div>
                    <h3 style={{
                        fontSize: '24px', 
                        fontWeight: '700', 
                        marginBottom: '24px'
                    }}>
                        Мои избранные
                    </h3>
                    {likedUsers.length === 0 ? (
                        <div style={{
                            background: '#fff', 
                            padding: '40px', 
                            borderRadius: '16px', 
                            textAlign: 'center', 
                            color: '#64748B', 
                            border: '1px solid #E2E8F0'
                        }}>
                            Вы пока никого не лайкнули.
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid', 
                            gridTemplateColumns: 
                                'repeat(auto-fill, minmax(220px, 1fr))', 
                            gap: '20px'
                        }}>
                            {likedUsers.map(u => (
                                <div 
                                    key={u.id} 
                                    style={{
                                        background: '#fff', 
                                        padding: '24px', 
                                        borderRadius: '16px', 
                                        border: '1px solid #F1F5F9', 
                                        boxShadow: 
                                            '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
                                        textAlign: 'center'
                                    }}
                                >
                                    <img 
                                        src={
                                            u.avatarPath 
                                            || '/uploads/default.jpg'
                                        } 
                                        alt={u.username} 
                                        style={{
                                            width: '80px', 
                                            height: '80px', 
                                            objectFit: 'cover', 
                                            borderRadius: '50%', 
                                            marginBottom: '16px', 
                                            border: '3px solid #fff', 
                                            boxShadow: 
                                                '0 2px 5px rgba(0,0,0,0.1)'
                                        }} 
                                    />
                                    <h4 style={{
                                        margin: '0 0 4px 0', 
                                        fontSize: '18px', 
                                        fontWeight: '700'
                                    }}>
                                        {u.username}
                                    </h4>
                                    <p style={{
                                        margin: '0 0 16px 0', 
                                        fontSize: '13px', 
                                        color: '#64748B'
                                    }}>
                                        {u.age ? `${u.age} лет` : ''} 
                                        {u.city ? `, ${u.city}` : ''}
                                    </p>
                                    <button 
                                        onClick={() => handleUnlike(u.id)}
                                        style={{
                                            background: '#FEF2F2', 
                                            color: '#DC2626', 
                                            padding: '10px', 
                                            border: 'none', 
                                            borderRadius: '8px', 
                                            cursor: 'pointer', 
                                            width: '100%', 
                                            fontSize: '13px', 
                                            fontWeight: '600'
                                        }}
                                    >
                                        Убрать лайк
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}