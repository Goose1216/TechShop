import React, { useState } from 'react';
import regStyles from '../../styles/Users/AuthStyles.module.css';
import blockStyle from '../../styles/BlockStyle.module.css';
import axios from 'axios';
import { setToken } from '../../authStorage';
import { Link } from 'react-router-dom';

const Registration = ({ onClose, switchToLogin }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [password1Error, setPassword1Error] = useState('');
    const [password2Error, setPassword2Error] = useState('');
    const [nonFieldErrors, setNonFieldErrors] = useState('');
    const [loading, setLoading] = useState(false);

    const register = async (e) => {
        e.preventDefault();
        setLoading(true);

        setEmailError('');
        setUsernameError('');
        setPassword1Error('');
        setPassword2Error('');
        setNonFieldErrors('');

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v1/dj-rest-auth/registration/', {
                username,
                email,
                password1,
                password2,
            });

            const token = response.data.key;
            setToken(token);
            switchToLogin();
        } catch (error) {
            if (error.response && error.response.data) {
                const responseData = error.response.data;

                if (responseData.email) {
                    setEmailError(responseData.email[0]);
                }
                if (responseData.username) {
                    setUsernameError(responseData.username[0]);
                }
                if (responseData.password1) {
                    setPassword1Error(responseData.password1[0]);
                }
                if (responseData.password2) {
                    setPassword2Error(responseData.password2[0]);
                }
                if (responseData.non_field_errors) {
                    setPassword2Error(responseData.non_field_errors[0]);
                }
            } else {
                setNonFieldErrors('Ошибка при регистрации. Пожалуйста, попробуйте снова.');
            }
            console.error('Ошибка:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={regStyles.modalOverlay}>
            <div className={regStyles.modalContent}>
                {nonFieldErrors && <div className={regStyles.errorMessage}>{nonFieldErrors}</div>}
                <h1>Регистрация</h1>
                <form className={regStyles.AuthForm} onSubmit={register}>
                    <div className = {regStyles.formItem}>
                        <label htmlFor="username" className={regStyles.AuthLabel}>Имя пользователя</label>
                        <input
                            type="text"
                            autoComplete="off"
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            className={regStyles.LoginAuthInput}
                            required
                        />
                        {usernameError && <div className={regStyles.errorMessageName}>{usernameError}</div>}
                    </div>

                    <div className = {regStyles.formItem}>
                        <label htmlFor="email" className={regStyles.AuthLabel}>Почта</label>
                        <input
                            type="email"
                            autoComplete="off"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className={regStyles.LoginAuthInput}
                            required
                        />
                        {emailError && <div className={regStyles.errorMessageEmail}>{emailError}</div>}
                    </div>

                    <div className = {regStyles.formItem}>
                        <label htmlFor="password1" className={regStyles.AuthLabel}>Пароль</label>
                        <input
                            type="password"
                            onChange={(e) => setPassword1(e.target.value)}
                            autoComplete="off"
                            value={password1}
                            className={regStyles.PasswordAuthInput}
                            required
                        />
                        {password1Error && <div className={regStyles.errorMessagePass}>{password1Error}</div>}
                    </div>

                    <div className = {regStyles.formItem}>
                        <label htmlFor="password2" className={regStyles.AuthLabel}>Подтвердите Пароль</label>
                        <input
                            type="password"
                            onChange={(e) => setPassword2(e.target.value)}
                            autoComplete="off"
                            value={password2}
                            className={regStyles.PasswordAuthInput}
                            required
                        />
                        {password2Error && <div className={regStyles.errorMessagePassConf}>{password2Error}</div>}
                    </div>

                    <button className={regStyles.AuthButton} type="submit" disabled={loading}>
                        {loading ? <span className={blockStyle.spinner}></span> : 'Зарегистрироваться'}
                    </button>
                    <button onClick={switchToLogin} className={regStyles.RegLink}>
                        Уже зарегистрированы? Войти
                    </button>
                </form>
                <button onClick={onClose} className={regStyles.closeButton}>Закрыть</button>
            </div>
        </div>
    );
};

export default Registration;