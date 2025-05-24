import React, { useState } from 'react';
import axios from 'axios';
import styles from '../../styles/Users/EmailVerification.module.css';

const PasswordResetEmail = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/v1/dj-rest-auth/password/reset/',
        { email },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setShowSuccessModal(true);
      } else {
        setError('Не удалось отправить письмо. Попробуйте позже.');
      }
    } catch (err) {
      setError('Ошибка при отправке запроса. Проверьте email и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <h2>Cброс пароля</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="Введите ваш email"
          />
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Отправка...' : 'Отправить письмо'}
          </button>
        </form>
      </div>

      {showSuccessModal && (
        <div className={styles.successModalOverlay}>
          <div className={styles.successModal}>
            <h3>Письмо для сброса пароля отправлено на почту:</h3>
            <p><b>{email}</b></p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className={styles.successModalClose}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PasswordResetEmail;
