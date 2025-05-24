import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Loader = () => (
  <div style={{ textAlign: 'center', marginTop: 100 }}>
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#007bff"
    >
      <g fill="none" fillRule="evenodd">
        <circle cx="25" cy="25" r="20" strokeOpacity="0.5" strokeWidth="5" />
        <path d="M45 25c0-11.046-8.954-20-20-20" strokeWidth="5">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
    <p>Подтверждение почты...</p>
  </div>
);

const EmailConfirmPage = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [successModal, setSuccessModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!key) {
      setError('Ключ подтверждения отсутствует в URL');
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/v1/dj-rest-auth/registration/verify-email/',
          { key },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          setSuccessModal(true);
          setLoading(false);
        } else {
          setError('Не удалось подтвердить почту. Попробуйте позже.');
          setLoading(false);
        }
      } catch (err) {
        setError('Ошибка при подтверждении почты. Проверьте ссылку или попробуйте позже.');
        setLoading(false);
      }
    };

    verifyEmail();
  }, [key]);

  const handleModalClose = () => {
    setSuccessModal(false);
    navigate('/user');
  };

  if (loading) return <Loader />;

  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {successModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: 30,
              borderRadius: 8,
              maxWidth: 400,
              textAlign: 'center',
              boxShadow: '0 0 15px rgba(0,0,0,0.3)',
            }}
          >
            <h2>Почта успешно подтверждена!</h2>
            <button
              onClick={handleModalClose}
              style={{
                marginTop: 20,
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              Перейти в личный кабинет
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailConfirmPage;
