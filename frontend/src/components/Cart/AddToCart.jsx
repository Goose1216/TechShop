import axios from 'axios';
import { getToken } from '../../authStorage';

const AddToCart = async (productId, setCartQuantity) => {

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    try {
        const token = getToken();
        let response;
        console.log(document.cookie);
        const csrfToken = getCookie('csrftoken');

        if (token) {
            response = await axios.post('http://localhost:8000/api/v1/carts/add/',
                {
                    product: productId,
                },
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
            response = await axios.post('http://localhost:8000/api/v1/carts/add/',
                {
                    product: productId,
                },
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
        if (response.status === 200) {
            setCartQuantity(prevQuantity => prevQuantity + 1);
            console.log('Корзина обновлена:', response.data);
        } else if (response.status === 204) {
            console.log('Корзина обновлена:', response.data);
        } else {
            throw new Error(`HTTP error ${response.status}`);
        }
    } catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
    }
};

export default AddToCart;