import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

/**
 * Компонент главной страницы.
 * Запрашивает у сервера текущее время и количество посещений.
 *
 * @returns {JSX.Element} JSX-разметка главной страницы
 */
export default function Home() {
    const [info, setInfo] = useState({ dateTime: '', visitCount: 0 });

    useEffect(() => {
        api.get('/info')
            .then(response => setInfo(response.data))
            .catch(error => console.error('Ошибка загрузки информации:', error));
    }, []);

    return (
        <div className="container">
            <h1>❤️ LoveConnect</h1>
            <p>Лучший портал для поиска второй половинки!</p>
            
            <div className="info-card">
                <h3>📅 Статус сервера</h3>
                <p><strong>Время:</strong> {info.dateTime || 'Загрузка...'}</p>
                <p><strong>Посещений:</strong> {info.visitCount}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/login" style={{ width: '100%' }}><button>Войти</button></Link>
                <Link to="/register" style={{ width: '100%' }}><button style={{ background: '#6c757d' }}>Регистрация</button></Link>
            </div>
        </div>
    );
}