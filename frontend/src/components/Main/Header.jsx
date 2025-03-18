import React from 'react';
import headerStyles from '../../styles/Main/Header.module.css';

const Header = () => {
    return (
        <header className={headerStyles.header}>
            <h1>TechShop</h1>
            <nav>
                <ul className={headerStyles.navList}>
                    <li><a href="/">Главная</a></li>
                    <li><a href="/products">Товары</a></li>
                    <li><a href="/about">О нас</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;