import React, { useState, useEffect, useCallback  } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CartPage.css';
import styles from '../../styles/BlockStyle.module.css'
import { getToken } from '../../authStorage';
import { useCart } from '../../CartContext';

const CartPage = () => {
  const [cartData, setCartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [tempQuantity, setTempQuantity] = useState('');
  const { setCartQuantity } = useCart();
  const [updateTimeout, setUpdateTimeout] = useState(null);
  const token = getToken();


   function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

  const fetchCart = async () => {
      try {
        let response;
        const csrfToken = getCookie('csrftoken');
        if (token) {
            response = await axios.get('http://localhost:8000/api/v1/carts/',
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                        'X-CSRFToken': csrfToken,
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
                        'X-CSRFToken': csrfToken,
                    },
                    withCredentials: true
                }
            );
        }
        setCartData(response.data);
        setCartQuantity(response.data.cart_items.length);
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка при загрузке корзины');
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveItem = async (productId) => {
    try {
    const csrfToken = getCookie('csrftoken');
      const response = await axios.delete(
        `http://localhost:8000/api/v1/carts/remove/${productId}/`,
        {
        headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
          withCredentials: true
        }
      );

      if (response.status == 200) {
        setShowSuccessModal(true);
      }

    } catch (err) {
      setError('Не удалось удалить товар');
    }
};

    const debouncedUpdateQuantity = useCallback((productId, newQuantity) => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        const csrfToken = getCookie('csrftoken');
        await axios.put(
          `http://localhost:8000/api/v1/carts/update/${productId}/`,
          { quantity: newQuantity },
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            },
            withCredentials: true
          }
        );
        fetchCart();
      } catch (err) {
        setError('Не удалось изменить количество');
      }
    }, 500);

    setUpdateTimeout(timeout);
  }, [updateTimeout, fetchCart]);

 const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartData(prev => ({
      ...prev,
      cart_items: prev.cart_items.map(item =>
        item.product.pk === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    }));

        debouncedUpdateQuantity(productId, newQuantity);
      };

      useEffect(() => {
        return () => {
          if (updateTimeout) {
            clearTimeout(updateTimeout);
          }
        };
      }, [updateTimeout]);


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
        <Link to="/products" className="continue-shopping">Начать покупки</Link>
      </div>
    );
  }


  const startEditing = (productId, currentQuantity) => {
    setEditingQuantity(productId);
    setTempQuantity(currentQuantity.toString());
  };

  const finishEditing = async (productId) => {
    const quantity = parseInt(tempQuantity);
    if (!isNaN(quantity)) {
      await handleUpdateQuantity(productId, quantity);
    }
    setEditingQuantity(null);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      setTempQuantity(value);
    }
  };

  const handleKeyDown = (e, productId) => {
    if (e.key === 'Enter') {
      finishEditing(productId);
    }
  };

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
                  <Link to={`/${item.product.slug}`}>{item.product.name}</Link>
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

                {editingQuantity === item.product.pk ? (
                  <input
                    type="text"
                    value={tempQuantity}
                    onChange={handleQuantityChange}
                    onBlur={() => finishEditing(item.product.pk)}
                    onKeyDown={(e) => handleKeyDown(e, item.product.pk)}
                    className="quantity-input"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => startEditing(item.product.pk, item.quantity)}
                    className="quantity-value"
                  >
                    {item.quantity}
                  </span>
                )}

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
                  {(item.total_price).toLocaleString()} ₽
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Итоговая сумма</h3>
          <div className="summary-row">
            <span>Товары ({cartData.cart_items.length})</span>
            <span>{cartData.total_price.toLocaleString()} ₽</span>
          </div>
          <div className="summary-row">
            <span>Доставка</span>
            <span className="free-delivery">Бесплатно</span>
          </div>
          <div className="summary-total">
            <span>Итого</span>
            <span>{cartData.total_price.toLocaleString()} ₽</span>
          </div>
          {token ? (
          <button
            className="checkout-button"
            onClick={() => navigate('/create_order')}
          >
            Оформить заказ
          </button>
        ) : (
          <button
            className="checkout-button disabled"
            disabled
            title="Для оформления заказа необходимо авторизоваться"
          >
            Оформить заказ
          </button>
        )}
          <Link to="/products" className="continue-shopping">
            Продолжить покупки
          </Link>
        </div>
      </div>
      <div className="cart-actions">
      <button
        className="clear-cart-button"
        onClick={async () => {
          try {
            const token = getToken();
            let deleteResponse;
            const csrfToken = getCookie('csrftoken');

            if (token) {
                deleteResponse = await axios.delete('http://localhost:8000/api/v1/carts/delete/', {
                headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': `Token ${token}`,
                                'X-CSRFToken': csrfToken,
                            },
                withCredentials: true
            })} else {
                deleteResponse = await axios.delete('http://localhost:8000/api/v1/carts/delete/', {
                headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrfToken,
                            },
                withCredentials: true
                });
            }
             if (deleteResponse.status === 200) {
                setShowSuccessModal(true);
              }
          } catch (err) {
            setError('Не удалось очистить корзину');
          }
        }}
      >
        Очистить корзину
      </button>
    </div>
 {showSuccessModal && (
        <div className={styles.successModalOverlay}>
          <div className={styles.successModal}>
            <h3>Корзина успешно обновлена!</h3>
            <button
              onClick={() => {
              setShowSuccessModal(false);
              fetchCart();
              }}
              className={styles.successModalClose}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;