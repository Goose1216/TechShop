import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CartPage.css';
import { getToken } from '../../authStorage';

const CartPage = () => {
  const [cartData, setCartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = getToken();
         let response;
        if (token) {
            response = await axios.get('http://localhost:8000/api/v1/carts/',
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    },
                    withCredentials: true
                }
            );
        } else {
            response = await axios.get('http://localhost:8000/api/v1/carts/',
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );
        }
        setCartData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка при загрузке корзины');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleRemoveItem = async (productId) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/carts/remove/${productId}/`, {
        withCredentials: true
      });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               const response = await axios.get('http://localhost:8000/api/v1/carts/get/', {
        withCredentials: true
      });
      setCartData(response.data);
    } catch (err) {
      setError('Не удалось удалить товар');
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        `http://localhost:8000/api/v1/carts/update/${productId}/`,
        { quantity: newQuantity },
        { withCredentials: true }
      );
      // Обновляем данные после изменения количества
      const response = await axios.get('http://localhost:8000/api/v1/carts/get/', {
        withCredentials: true
      });
      setCartData(response.data);
    } catch (err) {
      setError('Не удалось изменить количество');
    }
  };

  if (isLoading) {
    return (
      <div className="cart-container loading">
        <div className="loader"></div>
        <p>Загрузка корзины...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container error">
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
        <Link to="/" className="continue-shopping">Вернуться к покупкам</Link>
      </div>
    );
  }

  if (!cartData?.cart_items || cartData.cart_items.length === 0) {
    return (
      <div className="cart-container empty">
        <h2>Ваша корзина пуста</h2>
        <Link to="/catalog" className="continue-shopping">Начать покупки</Link>
      </div>
    );
  }

  const totalPrice = cartData.cart_items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );

  return (
    <div className="cart-container">
      <h1 className="cart-title">Корзина</h1>

      <div className="cart-content">
        <div className="cart-items">
          {cartData.cart_items.map((item) => (
            <div key={item.product.pk} className="cart-item">
              <div className="item-image">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  onClick={() => navigate(`/product/${item.product.slug}`)}
                />
              </div>

              <div className="item-details">
                <h3>
                  <Link to={`/product/${item.product.slug}`}>{item.product.name}</Link>
                </h3>
                <p className="item-brand">{item.product.brand}</p>

                <div className="item-categories">
                  {item.product.category.map((cat) => (
                    <span key={cat.name_latinica} className="category-tag">
                      {cat.name}
                    </span>
                  ))}
                </div>

                <div className="item-actions">
                  <div className="quantity-control">
                    <button
                      onClick={() => handleUpdateQuantity(item.product.pk, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product.pk, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remove-item"
                    onClick={() => handleRemoveItem(item.product.pk)}
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <div className="item-price">
                <span className="current-price">{item.product.price.toLocaleString()} ₽</span>
                {item.product.discount > 0 && (
                  <span className="original-price">
                    {item.product.price_standart.toLocaleString()} ₽
                  </span>
                )}
                <span className="item-total">
                  {(item.product.price * item.quantity).toLocaleString()} ₽
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Итоговая сумма</h3>
          <div className="summary-row">
            <span>Товары ({cartData.cart_items.length})</span>
            <span>{totalPrice.toLocaleString()} ₽</span>
          </div>
          <div className="summary-row">
            <span>Доставка</span>
            <span className="free-delivery">Бесплатно</span>
          </div>
          <div className="summary-total">
            <span>Итого</span>
            <span>{totalPrice.toLocaleString()} ₽</span>
          </div>
          <button
            className="checkout-button"
            onClick={() => navigate('/checkout')}
          >
            Оформить заказ
          </button>
          <Link to="/catalog" className="continue-shopping">
            Продолжить покупки
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;