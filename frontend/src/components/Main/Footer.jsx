import React from 'react';
import footerStyles from '../../styles/Main/Footer.module.css';

const Footer = () => {
    return (
        <footer className={footerStyles.footer}>
            <p>© 2023 TechShop. Все права защищены.</p>
            <div className={footerStyles.socialLinks}>
                <a href="https://facebook.com">Facebook</a>
                <a href="https://twitter.com">Twitter</a>
                <a href="https://instagram.com">Instagram</a>
            </div>
        </footer>
    );
};

export default Footer;