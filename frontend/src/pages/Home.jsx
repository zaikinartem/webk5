import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Компонент главной страницы, выполняющий перенаправление на новостную ленту.
 *
 * @returns {JSX.Element} Сообщение о перенаправлении
 */
export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/news');
    }, [navigate]);

    return <div style={{ padding: '30px', textAlign: 'center' }}>Перенаправление на новости...</div>;
}