import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import regStyles from '../../styles/Users/AuthStyles.module.css';
import blockStyle from '../../styles/BlockStyle.module.css';
import axios from 'axios';
import { setToken } from '../../authStorage';
import GooglePict from '../../img/icons8-google-144.png';
import YandexPict from '../../img/icons8-яндекс-логотип-50.png';
import VkPict from '../../img/icons8-vk-96.png';

const Login = ({ onClose, fetchUserInfo, switchToRegistration, setCartQuantity }) => {
  const [emailOrName, setEmailOrName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const clientIdGoogle = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const redirectUriGoogle = process.env.REACT_APP_GOOGLE_REDIRECT_URI;

  const clientIdYandex = process.env.REACT_APP_YANDEX_CLIENT_ID;
  const redirectUriYandex = process.env.REACT_APP_YANDEX_REDIRECT_URI;

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    axios.defaults.withCredentials = true;

    try {
      const response = await axios.post('http://localhost:8000/api/v1/dj-rest-auth/login/', {
        username: emailOrName,
        password: password,
      }, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      const token = response.data.key;
      setToken(token);
      fetchUserInfo();
      onClose();
      window.location.reload();

      let response_cart;
      if (token) {
        response_cart = await axios.get('http://localhost:8000/api/v1/carts/count/', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          withCredentials: true,
        });
      } else {
        response_cart = await axios.get('http://localhost:8000/api/v1/carts/count/', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
      }
      setCartQuantity(response_cart.data.count);
    } catch (error) {
      setError('Неправильные учетные данные. Пожалуйста, попробуйте снова.');
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/password_reset');
    onClose();
  };

  return (
    <div className={regStyles.modalOverlay}>
      <div className={regStyles.modalContent}>
        {error && <div className={regStyles.errorMessage}>{error}</div>}
        <h1>Авторизация</h1>
        <form className={regStyles.AuthForm} onSubmit={login}>
          <div className={regStyles.formItem}>
            <label htmlFor="login" className={regStyles.AuthLabel}>Логин/почта</label>
            <input
              type="text"
              autoComplete="off"
              onChange={(e) => setEmailOrName(e.target.value)}
              value={emailOrName}
              className={regStyles.LoginAuthInput}
              required
            />
          </div>

          <div className={regStyles.formItem} style={{ marginBottom: '5px' }}>
            <label htmlFor="password" className={regStyles.AuthLabel}>Пароль</label>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              value={password}
              className={regStyles.PasswordAuthInput}
              required
            />
            {/* Кнопка "Забыли пароль?" под полем пароля с меньшими отступами */}
            <button
              type="button"
              onClick={handleForgotPassword}
              className={regStyles.forgotPasswordButton}
              style={{
                marginTop: '4px',
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.875rem',
                textAlign: 'left',
                display: 'block',
              }}
            >
              Забыли пароль?
            </button>
          </div>

          <button className={regStyles.AuthButton} type="submit" disabled={loading}>
            {loading ? <span className={blockStyle.spinner}></span> : 'Войти'}
          </button>

          <button onClick={switchToRegistration} className={regStyles.RegLink} style={{ marginTop: '10px' }}>
            Еще не зарегистрированы?
          </button>
        </form>

        <div className={regStyles.TextSocialAuth}>Или авторизуйтесь с помощью</div>
        <div className={regStyles.ContainerSocialAuth}>
          <a href="" onClick={(e) => {
            e.preventDefault();
            window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${redirectUriGoogle}&prompt=consent&response_type=code&client_id=${clientIdGoogle}&scope=openid%20email%20profile&access_type=offline`;
          }}>
            <img src={GooglePict} className={regStyles.SocialAuth} alt="Google Login" />
          </a>
          <a href="" onClick={(e) => {
            e.preventDefault();
            window.location.href = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientIdYandex}&redirect_uri=${redirectUriYandex}`;
          }}>
            <img src={YandexPict} className={regStyles.SocialAuth} alt="Yandex Login" />
          </a>
          <a href="" onClick={(e) => {
            e.preventDefault();
          }}>
            <img src={VkPict} className={regStyles.SocialAuthVk} alt="Vk Login" />
          </a>
        </div>
        <button onClick={onClose} className={regStyles.closeButton}>Закрыть</button>
      </div>
    </div>
  );
};

export default Login;
