import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, removeToken } from '../../authStorage';
import axios from 'axios';
import headerStyles from '../../styles/Main/Header.module.css';
import AdminImg from '../../img/icon-admin.png';
import Login from '../Users/Login';
import Registration from '../Users/Registration';
import { useCart } from '../../CartContext';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1/dj-rest-auth/user/',
    headers: {
        'Content-Type': 'application/json',
    },
});

const Header = () => {
    const [username, setUsername] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showRegistration, setShowRegistration] = useState(false); // Состояние для регистрации
    const menuRef = useRef(null);
    const { cartQuantity } = useCart();
    const navigate = useNavigate();
    const token = getToken();

    const fetchUserInfo = async () => {
        try {
            const token = getToken();
            if (token) {
                const response = await api.get('/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                const userData = response.data;
                setUsername(userData.username);
            }
        } catch (error) {
            console.error('Ошибка при получении информации о пользователе:', error);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, [token]);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v1/dj-rest-auth/logout/');
            if (response.status === 200) {
                removeToken();
                setUsername('');
                navigate('/');
            }
        } catch (error) {
            console.error('Ошибка при выходе из системы:', error);
        }
    };

    const handleMouseEnter = () => {
        setIsMenuOpen(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <header className={headerStyles.header}>
            <div className={headerStyles.navbar}>
                <nav className={headerStyles.componLeft}>
                    <Link to="/" className={headerStyles.logo}>
                        <p className={headerStyles.animation}>TechShop</p>
                    </Link>
                    <Link to="/about" className={headerStyles.otherPoint}>О нас</Link>
                </nav>
                <nav className={headerStyles.other}>
                    <Link to="/products" className={headerStyles.productsText}>Товары</Link>
                </nav>

                <nav className={headerStyles.componRight}>
                    <Link to="/cart" className={headerStyles.menuItem}>
                        Корзина
                        {cartQuantity > 0 && (
                            <span className={headerStyles.cartQuantity}>{cartQuantity}</span>
                        )}
                    </Link>
                    <div className={headerStyles.verticalLine}></div>
                    {username ? (
                        <span className={headerStyles.menuItem} onClick={handleMouseEnter} ref={menuRef}>
                            {username}
                        </span>
                    ) : (
                        <Popup
                            trigger={
                                <div className={headerStyles.menuItem}>
                                    <img src={AdminImg} alt="admin" />
                                    Войти
                                </div>
                            }
                            modal
                            nested
                        >
                            {close => (
                                showRegistration ? (
                                    <Registration onClose={close} switchToLogin={() => setShowRegistration(false)} />
                                ) : (
                                    <Login onClose={close} fetchUserInfo={fetchUserInfo} switchToRegistration={() => setShowRegistration(true)} />
                                )
                            )}
                        </Popup>
                    )}
                </nav>
            </div>

            {isMenuOpen && (
                <div className={headerStyles.dropdownMenu}>
                    <Link to="/profile" className={headerStyles.dropdownItem}>
                        Личный кабинет
                    </Link>
                    <button className={headerStyles.dropdownItem} onClick={handleLogout}>
                        Выйти
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;