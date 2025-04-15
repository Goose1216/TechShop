import React, { useState, useEffect } from 'react';
import styles from '../../styles/Users/UserProfile.module.css';
import { getToken, removeToken } from '../../authStorage';
import axios from 'axios';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: ''
    });
    const [newData, setNewData] = useState({});
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        general: ''
    });

    const token = getToken();

    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/dj-rest-auth/user/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            setUser(response.data);
            setFormData({
                username: response.data.username,
                email: response.data.email,
                first_name: response.data.first_name || '',
                last_name: response.data.last_name || '',
            });
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                general: 'Ошибка при загрузке данных пользователя'
            }));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewData({
            ...newData,
            [name]: value,
        });
        setFormData({
            ...formData,
            [name]: value,
        });
        setErrors(prev => ({
            ...prev,
            [name]: '',
            general: ''
        }));
    };

    const handleSave = async () => {
        try {
            setErrors({
                username: '',
                email: '',
                first_name: '',
                last_name: '',
                general: ''
            });

            await axios.patch('http://localhost:8000/api/v1/dj-rest-auth/user/', newData, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            setNewData({});
            fetchUserData();
            window.alert("Данные успешно обновлены")
            window.location.reload();

        } catch (err) {
            if (err.response && err.response.data) {
                const newErrors = {
                    username: '',
                    email: '',
                    first_name: '',
                    last_name: '',
                    general: ''
                };

                for (const key in err.response.data) {
                    if (key in newErrors) {
                        newErrors[key] = err.response.data[key].join(' ');
                    } else {
                        newErrors.general = err.response.data[key].join(' ');
                    }
                }

                setErrors(newErrors);
            } else {
                setErrors(prev => ({
                    ...prev,
                    general: 'Произошла ошибка при обновлении данных'
                }));
            }
        }
    };

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

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
            window.location.href = '/';
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                general: 'Ошибка при выходе из системы'
            }));
            console.error('Ошибка при выходе из системы:', error);
        }
    };

    const handleChangePassword = () => {
        window.location.href = '/change-password';
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.profileHeader}>
                <h1>Личный кабинет</h1>
                <p className={styles.welcomeMessage}>Добро пожаловать, {user?.username}!</p>
            </div>

            {errors.general && (
                <div className={styles.errorMessage}>
                    {errors.general}
                </div>
            )}


            <div className={styles.profileForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="username">Имя пользователя</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={errors.username ? styles.errorInput : ''}
                    />
                    {errors.username && (
                        <span className={styles.fieldError}>{errors.username}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Электронная почта</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        readOnly
                        className={errors.email ? styles.errorInput : ''}
                    />
                    {errors.email && (
                        <span className={styles.fieldError}>{errors.email}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="first_name">Имя</label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className={errors.first_name ? styles.errorInput : ''}
                    />
                    {errors.first_name && (
                        <span className={styles.fieldError}>{errors.first_name}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="last_name">Фамилия</label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className={errors.last_name ? styles.errorInput : ''}
                    />
                    {errors.last_name && (
                        <span className={styles.fieldError}>{errors.last_name}</span>
                    )}
                </div>
            </div>

            <div className={styles.buttonGroup}>
                <button onClick={handleSave} className={styles.saveButton}>
                    Сохранить изменения
                </button>
                <button onClick={handleChangePassword} className={styles.changePasswordButton}>
                    Сменить пароль
                </button>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Выйти из аккаунта
                </button>
            </div>
        </div>
    );
};

export default UserProfile;