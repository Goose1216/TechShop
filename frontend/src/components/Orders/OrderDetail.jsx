import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/Orders/OrderDetail.module.css';
import blockstyles from '../../styles/BlockStyle.module.css';

const OrderDetail = ({ token }) => {
    const { uuid } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/v1/orders/${uuid}/`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Accept': 'application/json',
                    },
                    withCredentials: true
                });
                setOrder(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Не удалось загрузить данные заказа');
                console.error('Ошибка загрузки заказа:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [uuid, token]);

    if (loading) {
        return (
            <div className={styles.orderDetailContainer}>
                <div className={blockstyles.spinner}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.orderDetailContainer}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className={styles.orderDetailContainer}>
                <div className={styles.error}>Заказ не найден</div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    return (
        <div className={styles.orderDetailContainer}>
            <div className={styles.orderHeader}>
                <h1>Детали заказа #{order.uuid}</h1>
                <div className={styles.orderStatus} data-status={order.status.toLowerCase()}>
                    {order.status}
                </div>
            </div>

            <div className={styles.orderInfo}>
                <div className={styles.orderInfoSection}>
                    <h2>Информация о заказе</h2>
                    <p><strong>Дата заказа:</strong> {formatDate(order.created_at)}</p>
                    <p><strong>Итоговая сумма:</strong> {order.total_price.toLocaleString('ru-RU')} ₽</p>
                </div>

                <div className={styles.orderInfoSection}>
                    <h2>Данные покупателя</h2>
                    <p><strong>ФИО:</strong> {order.name_client}</p>
                    <p><strong>Email:</strong> {order.email}</p>
                    <p><strong>Телефон:</strong> {order.phone}</p>
                    <p><strong>Адрес доставки:</strong> {order.address}</p>
                </div>
            </div>

            <div className={styles.orderItems}>
                <h2>Состав заказа</h2>
                <div className={styles.itemsList}>
                    {order.order_items.map((item, index) => (
                        <div key={index} className={styles.orderItem}>
                            <div className={styles.itemInfo}>
                                <h3>{item.product}</h3>
                                <p>Цена: {item.price.toLocaleString('ru-RU')} ₽ × {item.quantity}</p>
                            </div>
                            <div className={styles.itemTotal}>
                                {item.total_price.toLocaleString('ru-RU')} ₽
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.orderTotal}>
                    <div className={styles.totalLabel}>Итого:</div>
                    <div className={styles.totalAmount}>{order.total_price.toLocaleString('ru-RU')} ₽</div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;