import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import orderStyles from '../../styles/Orders/Order.module.css';
import { useLocation, Link } from 'react-router-dom';
import { getToken } from '../../authStorage';
import blockStyle from '../../styles/BlockStyle.module.css';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [sortingOption, setSortingOption] = useState('Сначала новые');
    const [sortChoice, setSortChoice] = useState(false);
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const token = getToken();

    const sortWindowRef = useRef(null);

    const handleClickOutside = (event) => {
        if (sortWindowRef.current && !sortWindowRef.current.contains(event.target)) {
            setSortChoice(false);
        }
    };

    const handleMouseEnter = () => setSortChoice(true);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

     useEffect(() => {
        fetchOrders();
    }, [sortingOption, location.search]);

    const handleSortingChange = (event) => {
        const selectedValue = event.target.value;
        setSortingOption(sortingOptions[selectedValue]);
        fetchOrders();
};

    const sortingOptions = {
        'created_at': 'Сначала старые',
        '-created_at': 'Сначала новые',
        '-total_price': 'Сначала дорогие',
        'total_price': 'Сначала недорогие'
    };

    const getSortingKey = (value) => Object.keys(sortingOptions).find(key => sortingOptions[key] === value);

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams();
            params.set('sort', getSortingKey(sortingOption));
            const response = await axios.get(`http://localhost:8000/api/v1/orders/list?${params.toString()}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            });
            setOrders(response.data);
        } catch (error) {
            console.error('Ошибка при получении заказов:', error);
        }finally {
            setLoading(false);
        }
    };
    if (loading) {
        return  <div className={orderStyles.OrderContainer}> <span className={blockStyle.spinner}></span></div>;
    }

    return (
        <div className={orderStyles.OrderContainer}>
            <div className={orderStyles.headerOrder}>
                <h1>Мои заказы</h1>
                 <span className={orderStyles.Choice}>
                    Сортировка:
                    <span className={orderStyles.ButtonChoice} ref={sortWindowRef} onClick={handleMouseEnter}>
                        <p>{sortingOption}</p>
                        {sortChoice && (
                            <ul className={orderStyles.sortWindow}>
                                {Object.keys(sortingOptions).map((key) => (
                                    <li key={key}>
                                        <label className={orderStyles.radio_container}>
                                            <input
                                                type="radio"
                                                value={key}
                                                checked={sortingOption === sortingOptions[key]}
                                                onChange={handleSortingChange}
                                                className={orderStyles.radio_input}
                                            />
                                            <span className={orderStyles.radio_custom}></span>
                                            <span className={orderStyles.radio_label}>{sortingOptions[key]}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </span>
                </span>
            </div>
           {orders.length === 0 ? (
                token ? (
                    <h2>У вас пока нет заказов, добавьте понравившиеся товары в корзину и оформите заказ</h2>
                 ) : (
                     <h2>Для просмотра заказов требуется авторизация</h2>
                     )
            ) : (
                <div className={orderStyles.OrderList}>
                    {orders.map(order => (
                       <Link to={`/order/${order.uuid}`} className={orderStyles.customLink}>
                            <div key={order.uuid} className={orderStyles.OrderCard}>
                                <p className={orderStyles.OrderDate}>
                                    Дата заказа: {new Date(order.created_at).toLocaleDateString('ru-RU')}
                                </p>
                                <p className={orderStyles.OrderTotal}>
                                    Сумма заказа: {order.total_price ? order.total_price.toLocaleString('ru-RU') : 'Не указана'} ₽
                                </p>
                                <p className={orderStyles.OrderStatus}>
                                    Статус: {order.status || 'Не указан'}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

};

export default OrderList;