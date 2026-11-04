import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * Компонент панели администратора.
 * Отображает список всех пользователей и позволяет изменять их роли.
 */
export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/admin/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(() => {
                navigate('/profile');
            });
    }, [navigate]);

    /**
     * Показывает всплывающее уведомление на 3 секунды.
     * @param {string} message текст сообщения
     * @param {string} type тип ('success' или 'error')
     */
    const showToast = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    /**
     * Изменяет роль пользователя на сервере.
     * @param {number} id идентификатор пользователя
     * @param {string} newRole новая роль
     */
    const handleRoleChange = (id, newRole) => {
        api.put(`/admin/users/${id}/role?newRole=${newRole}`)
            .then(() => {
                setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
                showToast('Роль успешно обновлена!', 'success');
            })
            .catch((error) => {
                showToast(error.response?.data?.error || 'Ошибка при смене роли.', 'error');
            });
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            
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

            <h2>🛠 Панель администратора</h2>
            <p>Управление пользователями системы</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Логин</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Роль</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Действие</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '10px' }}>{user.id}</td>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{user.username}</td>
                            <td style={{ padding: '10px' }}>
                                <span style={{ 
                                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                    background: user.role === 'ADMIN' ? '#dc3545' : user.role === 'MODERATOR' ? '#ffc107' : '#28a745',
                                    color: 'white'
                                }}>
                                    {user.role}
                                </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                                <select 
                                    value={user.role} 
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc', width: 'auto', margin: 0 }}
                                >
                                    <option value="USER">USER</option>
                                    <option value="MODERATOR">MODERATOR</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button 
                onClick={() => navigate('/profile')} 
                style={{ marginTop: '20px', background: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'auto' }}
            >
                Назад в профиль
            </button>
        </div>
    );
}