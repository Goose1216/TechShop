import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import { getToken, removeToken } from '../../authStorage';
import axios from 'axios';
import headerStyles from '../../styles/Main/Header.module.css';
import AdminImg from '../../img/icon-admin.png';
import SearchImg from '../../img/icons8-search-30.png'
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
    const [showRegistration, setShowRegistration] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const [items, setItems] = useState([]);
    const menuRef = useRef(null);
    const searchRef = useRef(null);
    const { cartQuantity, setCartQuantity } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const token = getToken();

    const fetchUserInfo = async () => {
        try {
            if (token) {
                const response = await api.get('/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                setUsername(response.data.username);
            }
        } catch (error) {
            console.error('Ошибка при получении информации о пользователе:', error);
        }
    };

    const fetchCountCartItems = async () => {
        try {
            const config = token ? {
                headers: { 'Authorization': `Token ${token}` },
                withCredentials: true
            } : { withCredentials: true };

            const response = await axios.get('http://localhost:8000/api/v1/carts/count/', config);
            setCartQuantity(response.data.count);
        } catch (error) {
            console.error('Ошибка при получении информации о корзине:', error);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/products/category/list');
            setItems(response.data);
        } catch (error) {
            console.error('Ошибка при получении подсказок:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (query) {
            navigate(`/products?q=${encodeURIComponent(query)}`);
            setQuery('');
            setSuggestions([]);
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value) {
            const filtered = items.filter(item =>
                item.name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (name) => {
        setQuery(name);
        setSuggestions([]);
        navigate(`/products?q=${encodeURIComponent(name)}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (activeSuggestion >= 0) {
                handleSuggestionClick(suggestions[activeSuggestion].name);
            } else {
                handleSearch(e);
            }
        } else if (e.key === 'ArrowDown') {
            setActiveSuggestion((prev) => (prev + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            setActiveSuggestion((prev) => (prev === 0 ? suggestions.length - 1 : prev - 1));
        } else if (e.key === 'Escape') {
            setSuggestions([]);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const csrfToken = getCookie('csrftoken');
            await axios.post('http://localhost:8000/api/v1/dj-rest-auth/logout/', {}, {
                headers: {
                    'X-CSRFToken': csrfToken,
                },
                withCredentials: true
            });
            removeToken();
            setUsername('');
            navigate('/');
        } catch (error) {
            console.error('Ошибка при выходе из системы:', error);
        }
    };

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    useEffect(() => {
        fetchUserInfo();
        fetchCountCartItems();
        fetchSuggestions();
    }, [token]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target) &&
                (!searchRef.current || !searchRef.current.contains(e.target))) {
                setIsMenuOpen(false);
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setQuery('');
        setSuggestions([]);
    }, [location]);

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
                    <div className={headerStyles.searchContainer} ref={searchRef}>
                        <form onSubmit={handleSearch} className={headerStyles.searchForm}>
                            <input
                                type="text"
                                placeholder="Поиск товаров..."
                                value={query}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                className={headerStyles.searchInput}
                            />
                            <button type="submit" className={headerStyles.searchButton}>
                                <img src={SearchImg} alt="search" />
                            </button>
                        </form>
                        {suggestions.length > 0 && (
                            <ul className={headerStyles.suggestionsList}>
                                {suggestions.map((item, index) => (
                                    <li
                                        key={index}
                                        className={index === activeSuggestion ? headerStyles.activeSuggestion : ''}
                                        onClick={() => handleSuggestionClick(item.name)}
                                    >
                                        {item.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
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
                        <div className={headerStyles.userMenu} ref={menuRef}>
                            <span
                                className={headerStyles.menuItem}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {username}
                            </span>
                            {isMenuOpen && (
                                <div className={headerStyles.dropdownMenu}>
                                    <Link
                                        to="/user"
                                        className={headerStyles.dropdownItem}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <i className="fas fa-user"></i> Личный кабинет
                                    </Link>
                                    <button
                                        className={headerStyles.dropdownItem}
                                        onClick={handleLogout}
                                    >
                                        <i className="fas fa-sign-out-alt"></i> Выйти
                                    </button>
                                </div>
                            )}
                        </div>
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
                                    <Login
                                        onClose={close}
                                        fetchUserInfo={fetchUserInfo}
                                        switchToRegistration={() => setShowRegistration(true)}
                                        setCartQuantity={setCartQuantity}
                                    />
                                )
                            )}
                        </Popup>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;