import React, { useState } from 'react';
import { getToken } from '../../authStorage';
import axios from 'axios';
import styles from '../../styles/Users/PasswordChange.module.css';
import blockStyle from '../../styles/BlockStyle.module.css';

const PasswordChangeModal = ({ onClose, onLogout }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = getToken();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case 'oldPassword':
        setOldPassword(value);
        break;
      case 'newPassword1':
        setNewPassword1(value);
        break;
      case 'newPassword2':
        setNewPassword2(value);
        break;
      default:
        break;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:8000/api/v1/dj-rest-auth/password/change/',
        {
          "old_password": oldPassword,
          "new_password1": newPassword1,
          "new_password2": newPassword2
        },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

      alert('Пароль успешно обновлён, перезайдите в учетную запись, пожалуйста');
      onLogout();
      onClose();
    }
    catch (error) {
      if (error.response && error.response.data) {
        let errorMessage = 'Произошла ошибка при обновлении данных.';
        if (error.response.data.old_password) {
          errorMessage = error.response.data.old_password;
          setError(errorMessage);
        }
        if (error.response.data.new_password1) {
          errorMessage = error.response.data.new_password1;
          setError(errorMessage);
        }
        if (error.response.data.new_password2) {
          errorMessage = error.response.data.new_password2;
          setError(errorMessage);
        }
      } else {
      }
      console.error('Ошибка при обновлении данных:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>

        <h1>Смена пароля</h1>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.PasswordForm} onSubmit={handleSave}>
          <div className={styles.formGroup}>
            <label htmlFor="oldPassword" className={styles.Label}>Старый пароль</label>
            <input
              type='password'
              name="oldPassword"
              autoComplete="off"
              onChange={handleInputChange}
              value={oldPassword}
              required
              className={styles.inputField}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="newPassword1" className={styles.Label}>Новый пароль</label>
            <input
              type='password'
              name="newPassword1"
              onChange={handleInputChange}
              autoComplete="off"
              value={newPassword1}
              required
              className={styles.inputField}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="newPassword2" className={styles.Label}>Повторите новый пароль</label>
            <input
              type='password'
              name="newPassword2"
              onChange={handleInputChange}
              autoComplete="off"
              value={newPassword2}
              required
              className={styles.inputField}
            />
          </div>

          <div className={styles.buttonContainer}>
            <button className={styles.SaveButton} type="submit" disabled={loading}>
              {loading ? <span className={blockStyle.spinner}></span> : 'Сменить пароль'}
            </button>
            <button
              type="button"
              className={styles.CancelButton}
              onClick={onClose}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeModal;