import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/Users/PasswordReset.module.css';
import blockStyle from '../../styles/BlockStyle.module.css';

const PasswordReset = () => {
  const { uid, key } = useParams();
  const navigate = useNavigate();

  const [new_password1, setNewPassword1] = useState('');
  const [new_password2, setNewPassword2] = useState('');
  const [newPassword1Error, setNewPassword1Error] = useState('');
  const [newPassword2Error, setNewPassword2Error] = useState('');
  const [nonFieldErrors, setNonFieldErrors] = useState('');
  const [loading, setLoading] = useState(false);

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    setNewPassword1Error('');
    setNewPassword2Error('');
    setNonFieldErrors('');

    try {
      const url = `http://127.0.0.1:8000/v1/dj-rest-auth/password/reset/confirm/${uid}/${key}/`;
      const body = {
        new_password1,
        new_password2,
        uid: uid,
        token: key,
      };

      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        navigate('/');
      } else {
        setNonFieldErrors('Ошибка при сбросе пароля. Попробуйте позже.');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const data = error.response.data;

        if (data.new_password1) {
          setNewPassword1Error(data.new_password1[0]);
        }
        if (data.new_password2) {
          setNewPassword2Error(data.new_password2[0]);
        }
        if (data.non_field_errors) {
          setNonFieldErrors(data.non_field_errors[0]);
        }
      } else if (error.response && error.response.status === 500) {
        setNonFieldErrors('Внутренняя ошибка сервера. Попробуйте позже.');
      } else {
        setNonFieldErrors('Ошибка сети. Пожалуйста, попробуйте снова.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {nonFieldErrors && <div className={styles.errorMessage}>{nonFieldErrors}</div>}
      <h2>Сброс пароля</h2>
      <form className={styles.form} onSubmit={resetPassword}>
        <div className={styles.formGroup}>
          <label htmlFor="new_password1" className={styles.label}>Новый пароль</label>
          <input
            type="password"
            id="new_password1"
            value={new_password1}
            onChange={(e) => setNewPassword1(e.target.value)}
            className={styles.input}
            required
          />
          {newPassword1Error && <div className={styles.fieldError}>{newPassword1Error}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="new_password2" className={styles.label}>Подтверждение нового пароля</label>
          <input
            type="password"
            id="new_password2"
            value={new_password2}
            onChange={(e) => setNewPassword2(e.target.value)}
            className={styles.input}
            required
          />
          {newPassword2Error && <div className={styles.fieldError}>{newPassword2Error}</div>}
        </div>

        <button className={styles.submitButton} type="submit" disabled={loading}>
          {loading ? <span className={blockStyle.spinner}></span> : 'Сбросить пароль'}
        </button>
      </form>
    </div>
  );
};

export default PasswordReset;
