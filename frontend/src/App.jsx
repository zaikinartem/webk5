import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import NewsList from './pages/NewsList';
import NewsManage from './pages/NewsManage';

/**
 * Корневой компонент приложения.
 * Отвечает за маршрутизацию (Routing) между страницами.
 *
 * @returns {JSX.Element} JSX-разметка приложения
 */
export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/news" element={<NewsList />} />
                <Route path="/news/manage" element={<NewsManage />} />
            </Routes>
        </Router>
    );
}