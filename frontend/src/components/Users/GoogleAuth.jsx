import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import blockStyle from '../../styles/BlockStyle.module.css';
import axios from 'axios';
import { setToken } from '../../authStorage';
import { useLocation } from 'react-router-dom';

const GoogleAuth = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

    const getQueryParams = () => {
        const params = new URLSearchParams(location.search);
        return {
            code: params.get('code') || '',
        };
    };

    const { code } = getQueryParams();

    useEffect(() => {
        const login = async () => {
            try {
                const response = await axios.post(
                    'http://localhost:8000/api/v1/dj-rest-auth/google/login/',
                    {
                        code: code,
                        id_token: clientId,
                        client_secret: clientSecret,
                    },
                    {
                         headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        withCredentials: true
                    }
                );

                const token = response.data.key;
                setToken(token);
                navigate('/');
            } catch (error) {
                setError('Ошибка авторизации. Пожалуйста, попробуйте снова.');
                console.error('Ошибка:', error);
            }
        };

        if (code) {
            login();
        } else {
            setError('Ошибка авторизации. Пожалуйста, попробуйте снова.');
        }
    }, []);

    return (
        <div className ={blockStyle.regBody}>
           { error != '' && <div>{error}</div>}
            <span className={blockStyle.spinner}></span>
        </div>
    );
};

export default GoogleAuth;
