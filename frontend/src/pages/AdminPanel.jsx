import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/** Время отображения уведомления в миллисекундах. */
const TOAST_DURATION_MS = 3000;

/** Допустимые роли пользователей в системе. */
const ROLES = ['USER', 'MODERATOR', 'ADMIN'];

/**
 * Компонент панели администратора.
 * Позволяет просматривать, создавать, удалять и редактировать пользователей.
 *
 * @returns {JSX.Element} JSX-разметка панели администратора
 */
export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [notification, setNotification] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    
    const [editUsername, setEditUsername] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editAge, setEditAge] = useState('');
    const [editGender, setEditGender] = useState('Не указан');
    const [editCity, setEditCity] = useState('');
    const [editFile, setEditFile] = useState(null);

    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('USER');

    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    /**
     * Загружает список всех пользователей с сервера.
     */
    const loadUsers = () => {
        api.get('/admin/users')
            .then(res => setUsers(res.data))
            .catch(() => navigate('/profile'));
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
     * Изменяет роль выбранного пользователя.
     *
     * @param {number} id идентификатор пользователя
     * @param {string} newRole новая роль
     */
    const handleRoleChange = (id, newRole) => {
        api.put(`/admin/users/${id}/role?newRole=${newRole}`)
            .then(() => {
                setUsers(users.map(u => 
                    u.id === id ? { ...u, role: newRole } : u
                ));
                showToast('Роль обновлена!', 'success');
            })
            .catch(err => 
                showToast(err.response?.data?.error || 'Ошибка', 'error')
            );
    };

    /**
     * Создает нового пользователя через админ-панель.
     *
     * @param {Event} e событие отправки формы
     */
    const handleCreateUser = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        params.append('username', newUsername);
        params.append('password', newPassword);
        params.append('role', newRole);

        api.post('/admin/users', params)
            .then(() => {
                showToast('Пользователь создан!', 'success');
                setNewUsername('');
                setNewPassword('');
                loadUsers();
            })
            .catch(err => 
                showToast(err.response?.data?.error || 'Ошибка', 'error')
            );
    };

    /**
     * Подтверждает и выполняет удаление выбранного пользователя.
     */
    const confirmDelete = () => {
        if (!deleteTarget) return;
        
        api.delete(`/admin/users/${deleteTarget.id}`)
            .then(() => {
                setUsers(users.filter(u => u.id !== deleteTarget.id));
                showToast('Пользователь удален', 'success');
                setDeleteTarget(null);
            })
            .catch(err => {
                showToast(err.response?.data?.error || 'Ошибка', 'error');
                setDeleteTarget(null);
            });
    };

    /**
     * Открывает модальное окно редактирования и заполняет его данными.
     *
     * @param {Object} user объект пользователя
     */
    const openEditModal = (user) => {
        setEditTarget(user);
        setEditUsername(user.username);
        setEditPassword('');
        setEditAge(user.age || '');
        setEditGender(user.gender || 'Не указан');
        setEditCity(user.city || '');
        setEditFile(null);
    };

    /**
     * Загружает новый аватар для редактируемого пользователя.
     */
    const handleAdminAvatarUpload = () => {
        if (!editFile) {
            showToast('Выберите файл.', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', editFile);

        api.post(`/admin/users/${editTarget.id}/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => {
            if (res.data.success) {
                showToast('Аватар обновлен!', 'success');
                setEditTarget(prev => ({ 
                    ...prev, avatarPath: res.data.avatarPath 
                }));
                setUsers(users.map(u => 
                    u.id === editTarget.id 
                        ? { ...u, avatarPath: res.data.avatarPath } 
                        : u
                ));
                setEditFile(null);
            }
        }).catch(err => 
            showToast(err.response?.data?.error || 'Ошибка', 'error')
        );
    };

    /**
     * Сохраняет изменения данных пользователя.
     *
     * @param {Event} e событие отправки формы
     */
    const handleUpdateUser = (e) => {
        e.preventDefault();
        if (!editTarget) return;
        
        const params = new URLSearchParams();
        params.append('newUsername', editUsername);
        if (editPassword) params.append('password', editPassword);
        if (editAge) params.append('age', editAge);
        if (editGender) params.append('gender', editGender);
        if (editCity) params.append('city', editCity);

        api.put(`/admin/users/${editTarget.id}`, params)
            .then(() => {
                showToast('Данные обновлены!', 'success');
                setUsers(users.map(u => 
                    u.id === editTarget.id 
                        ? { 
                            ...u, 
                            username: editUsername, 
                            age: editAge, 
                            gender: editGender, 
                            city: editCity 
                        } 
                        : u
                ));
                setEditTarget(null);
            })
            .catch(err => 
                showToast(err.response?.data?.error || 'Ошибка', 'error')
            );
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
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{
                            marginTop: 0, 
                            color: '#DC2626', 
                            fontSize: '20px'
                        }}>
                            Удаление
                        </h3>
                        <p style={{
                            color: '#64748B', 
                            marginBottom: '24px'
                        }}>
                            Вы уверены, что хотите навсегда удалить пользователя 
                            <strong> {deleteTarget.username}</strong>?
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

            {editTarget && (
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
                        maxWidth: '450px', 
                        width: '90%', 
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{
                            marginTop: 0, 
                            fontSize: '20px', 
                            marginBottom: '20px'
                        }}>
                            Редактирование: {editTarget.username}
                        </h3>

                        <div style={{
                            marginBottom: '20px', 
                            textAlign: 'center', 
                            background: '#F8FAFC', 
                            padding: '16px', 
                            borderRadius: '12px'
                        }}>
                            <img 
                                src={editTarget.avatarPath || '/uploads/default.jpg'} 
                                alt="Avatar" 
                                style={{
                                    width: '80px', 
                                    height: '80px', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover', 
                                    marginBottom: '12px'
                                }} 
                            />
                            <input 
                                type="file" 
                                onChange={(e) => setEditFile(e.target.files[0])} 
                                accept="image/*" 
                                style={{
                                    fontSize: '12px', 
                                    display: 'block', 
                                    margin: '0 auto 10px'
                                }} 
                            />
                            <button 
                                type="button" 
                                onClick={handleAdminAvatarUpload} 
                                style={{
                                    background: '#1E293B', 
                                    color: 'white', 
                                    padding: '8px 16px', 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer', 
                                    width: 'auto', 
                                    marginTop: 0, 
                                    fontSize: '13px', 
                                    fontWeight: '600'
                                }}
                            >
                                Обновить фото
                            </button>
                        </div>

                        <form 
                            onSubmit={handleUpdateUser} 
                            style={{
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '12px'
                            }}
                        >
                            <input 
                                type="text" 
                                value={editUsername} 
                                onChange={e => setEditUsername(e.target.value)} 
                                placeholder="Логин" 
                                required 
                                style={{ padding: '12px', background: '#F8FAFC' }} 
                            />
                            <input 
                                type="password" 
                                value={editPassword} 
                                onChange={e => setEditPassword(e.target.value)} 
                                placeholder="Новый пароль (оставьте пустым)" 
                                style={{ padding: '12px', background: '#F8FAFC' }} 
                            />
                            <input 
                                type="number" 
                                value={editAge} 
                                onChange={e => setEditAge(e.target.value)} 
                                placeholder="Возраст" 
                                min="18" 
                                max="100" 
                                style={{ padding: '12px', background: '#F8FAFC' }} 
                            />
                            <select 
                                value={editGender} 
                                onChange={e => setEditGender(e.target.value)} 
                                style={{ padding: '12px', background: '#F8FAFC' }}
                            >
                                <option value="Не указан">Не указан</option>
                                <option value="Мужской">Мужской</option>
                                <option value="Женский">Женский</option>
                            </select>
                            <input 
                                type="text" 
                                value={editCity} 
                                onChange={e => setEditCity(e.target.value)} 
                                placeholder="Город" 
                                style={{ padding: '12px', background: '#F8FAFC' }} 
                            />

                            <div style={{
                                display: 'flex', 
                                gap: '12px', 
                                marginTop: '12px'
                            }}>
                                <button 
                                    type="button" 
                                    onClick={() => setEditTarget(null)} 
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
                <button 
                    onClick={() => navigate('/profile')} 
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
                    Назад в профиль
                </button>
            </header>

            <div style={{
                maxWidth: '1000px', 
                margin: '0 auto', 
                padding: '60px 20px'
            }}>
                <h1 style={{
                    fontSize: '32px', 
                    fontWeight: '800', 
                    marginBottom: '40px'
                }}>
                    Панель администратора
                </h1>

                <div style={{
                    background: '#fff', 
                    padding: '32px', 
                    borderRadius: '16px', 
                    border: '1px solid #F1F5F9', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
                    marginBottom: '40px'
                }}>
                    <h3 style={{
                        marginTop: 0, 
                        fontSize: '20px', 
                        marginBottom: '20px'
                    }}>
                        Создать пользователя
                    </h3>
                    <form 
                        onSubmit={handleCreateUser} 
                        style={{
                            display: 'flex', 
                            gap: '12px', 
                            flexWrap: 'wrap'
                        }}
                    >
                        <input 
                            type="text" 
                            placeholder="Логин" 
                            value={newUsername} 
                            onChange={e => setNewUsername(e.target.value)} 
                            required 
                            style={{
                                padding: '12px', 
                                flex: '1 1 200px', 
                                background: '#F8FAFC'
                            }} 
                        />
                        <input 
                            type="password" 
                            placeholder="Пароль" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            required 
                            style={{
                                padding: '12px', 
                                flex: '1 1 200px', 
                                background: '#F8FAFC'
                            }} 
                        />
                        <select 
                            value={newRole} 
                            onChange={e => setNewRole(e.target.value)} 
                            style={{
                                padding: '12px', 
                                flex: '1 1 150px', 
                                background: '#F8FAFC'
                            }}
                        >
                            {ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <button 
                            type="submit" 
                            style={{
                                background: '#1E293B', 
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
                            Создать
                        </button>
                    </form>
                </div>

                <div style={{
                    background: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #F1F5F9', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
                    overflow: 'hidden'
                }}>
                    <table style={{
                        width: '100%', 
                        borderCollapse: 'collapse', 
                        textAlign: 'left'
                    }}>
                        <thead style={{
                            background: '#F8FAFC', 
                            borderBottom: '1px solid #E2E8F0'
                        }}>
                            <tr>
                                <th style={{
                                    padding: '16px 24px', 
                                    fontSize: '13px', 
                                    textTransform: 'uppercase', 
                                    color: '#64748B', 
                                    fontWeight: '600'
                                }}>
                                    Логин
                                </th>
                                <th style={{
                                    padding: '16px 24px', 
                                    fontSize: '13px', 
                                    textTransform: 'uppercase', 
                                    color: '#64748B', 
                                    fontWeight: '600'
                                }}>
                                    Роль
                                </th>
                                <th style={{
                                    padding: '16px 24px', 
                                    fontSize: '13px', 
                                    textTransform: 'uppercase', 
                                    color: '#64748B', 
                                    fontWeight: '600', 
                                    textAlign: 'right'
                                }}>
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr 
                                    key={user.id} 
                                    style={{ borderBottom: '1px solid #F1F5F9' }}
                                >
                                    <td style={{
                                        padding: '16px 24px', 
                                        fontWeight: '600'
                                    }}>
                                        {user.username}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '6px 12px', 
                                            borderRadius: '6px', 
                                            fontSize: '12px', 
                                            fontWeight: '700', 
                                            background: user.role === 'ADMIN' 
                                                ? '#FEF2F2' 
                                                : user.role === 'MODERATOR' 
                                                    ? '#FEF3C7' 
                                                    : '#ECFDF5', 
                                            color: user.role === 'ADMIN' 
                                                ? '#DC2626' 
                                                : user.role === 'MODERATOR' 
                                                    ? '#D97706' 
                                                    : '#059669'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{
                                        padding: '16px 24px', 
                                        display: 'flex', 
                                        gap: '8px', 
                                        justifyContent: 'flex-end'
                                    }}>
                                        <select 
                                            value={user.role} 
                                            onChange={(e) => 
                                                handleRoleChange(user.id, e.target.value)
                                            } 
                                            style={{
                                                padding: '8px 12px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #E2E8F0', 
                                                width: 'auto', 
                                                margin: 0, 
                                                fontSize: '13px', 
                                                background: '#F8FAFC'
                                            }}
                                        >
                                            {ROLES.map(role => (
                                                <option key={role} value={role}>
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={() => openEditModal(user)} 
                                            style={{
                                                background: '#F1F5F9', 
                                                color: '#475569', 
                                                padding: '8px 16px', 
                                                border: 'none', 
                                                borderRadius: '6px', 
                                                cursor: 'pointer', 
                                                width: 'auto', 
                                                marginTop: 0, 
                                                fontWeight: '600', 
                                                fontSize: '13px'
                                            }}
                                        >
                                            Изменить
                                        </button>
                                        <button 
                                            onClick={() => setDeleteTarget(user)} 
                                            style={{
                                                background: '#FEF2F2', 
                                                color: '#DC2626', 
                                                padding: '8px 16px', 
                                                border: 'none', 
                                                borderRadius: '6px', 
                                                cursor: 'pointer', 
                                                width: 'auto', 
                                                marginTop: 0, 
                                                fontWeight: '600', 
                                                fontSize: '13px'
                                            }}
                                        >
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}