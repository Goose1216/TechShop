import React, { useState, useEffect } from 'react';
import { getToken } from '../../authStorage';
import axios from 'axios';
import { useCart } from '../../CartContext';
import styles from '../../styles/Orders/OrderCreate.module.css';
import blockstyles from '../../styles/BlockStyle.module.css';
import { Link } from 'react-router-dom';

const OrderCreate = ({ token }) => {
    const { setCartQuantity, setCartItems, cartItems } = useCart();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartLoadingError, setCartLoadingError] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [nameClient, setNameClient] = useState('');
    const [formError, setFormError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const fetchCart = async () => {
        try {
            setLoading(true);
            setCartLoadingError(null);

            const token = getToken();
            const csrfToken = getCookie('csrftoken');
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            };

            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }

            const response = await axios.get('http://localhost:8000/api/v1/carts/', {
                headers,
                withCredentials: true
            });

            setCart(response.data);
            setCartItems(response.data.cart_items || []);
            setCartQuantity(response.data.cart_items?.length || 0);
        } catch (err) {
            setCartLoadingError(err.response?.data?.message || 'Ошибка при загрузке корзины');
            console.error('Ошибка загрузки корзины:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!email || !phone || !address || !nameClient) {
            setFormError('Все поля обязательны для заполнения.');
            return;
        }

        const phoneRegex = /^(?:\+7|8)\d{10}$/;
        if (!phoneRegex.test(phone)) {
            setFormError('Номер телефона должен начинаться с +7 или 8 и состоять из 10 цифр.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setFormError('Введите корректный email.');
            return;
        }

        try {
            setFormLoading(true);
            const csrfToken = getCookie('csrftoken');

            const response = await axios.post(
                'http://localhost:8000/api/v1/orders/create/',
                {
                    email: email,
                    phone: phone,
                    address: address,
                    name_client: nameClient,
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    withCredentials: true
                }
            );

            if (response.status === 201) {
                setCartItems([]);
                setCartQuantity(0);
                setShowSuccessModal(true);
                // Очищаем форму только после успешного создания заказа
                setEmail('');
                setPhone('');
                setAddress('');
                setNameClient('');
            }
        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            setFormError('Ошибка при оформлении заказа. Пожалуйста, попробуйте снова.');
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.orderContainer}>
                <div className={blockstyles.spinner}></div>
            </div>
        );
    }

    if (cartLoadingError) {
        return (
            <div className={styles.orderContainer}>
                <div className={styles.error}>{cartLoadingError}</div>
                <button onClick={fetchCart} className={styles.button}>
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className={styles.orderContainer}>
            <div className={styles.leftSection}>
                <h2 className={styles.title}>Оформление заказа</h2>
                {formError && <p className={styles.error}>{formError}</p>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Телефон:</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+7 (999) 999-99-99"
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Адрес:</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>ФИО:</label>
                        <input
                            type="text"
                            value={nameClient}
                            onChange={(e) => setNameClient(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={styles.button}
                        disabled={formLoading || cart?.cart_items?.length === 0}
                    >
                        {formLoading ? 'Оформление...' : 'Оформить заказ'}
                    </button>
                </form>
            </div>
            <div className={styles.rightSection}>
                <h3>Товары в корзине</h3>
                {cart?.cart_items?.length > 0 ? (
                    <div>
                        <ul className={styles.cartList}>
                            {cart.cart_items.map((item) => (
                                <li key={item.product.pk} className={styles.cartItem}>
                                    <Link to={`/${item.product.slug}`}>
                                        <img
                                            src={item.product.image}
                                            alt="Изображение товара"
                                            className={styles.itemImage}
                                        />
                                    </Link>
                                    <div className={styles.itemDetails}>
                                        <Link to={`/${item.product.slug}`}>
                                            <h1 className={styles.ProductName}>{item.product.name}</h1>
                                        </Link>
                                        <p>Цена: {item.product.price?.toLocaleString('ru-RU')} ₽</p>
                                        <p>Количество: {item.quantity}</p>
                                        <p>Итого: {(item.total_price || 0).toLocaleString('ru-RU')} ₽</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.totalPrice}>
                            Итого: {(cart.total_price || 0).toLocaleString('ru-RU')} ₽
                        </div>
                    </div>
                ) : (
                    <p>Ваша корзина пуста.</p>
                )}
            </div>

            {showSuccessModal && (
                <div className={blockstyles.successModalOverlay}>
                    <div className={blockstyles.successModal}>
                        <h3>Заказ успешно создан!</h3>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className={blockstyles.successModalClose}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderCreate;