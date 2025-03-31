import axios from 'axios';
import { getToken } from '../../authStorage';

const AddToCart = async (productId, setCartQuantity) => {
    try {
        const token = getToken();
        let response;
        console.log(document.cookie);
        if (token) {
            response = await axios.post('http://localhost:8000/api/v1/carts/',
                {
                    product: productId,
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    },
                    withCredentials: true
                }
            );
        } else {
            response = await axios.post('http://localhost:8000/api/v1/carts/',
                {
                    product: productId,
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
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