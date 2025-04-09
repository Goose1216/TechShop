import { getToken } from '../../authStorage';
import axios from 'axios';

const CreateReview = async (productId, review, rate, ListReview) => {
    const token = getToken();
    try {
        const response = await axios.post('http://localhost:8000/api/v1/products/reviews/create/',
            {
                product: productId,
                review: review,
                rate: rate,
            },
            {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );
        if (response.status === 201) {
            console.log('Отзыв добавлен:', response.data);
        } else {
            throw new Error(`HTTP error ${response.status}`);
        }
    } catch (error) {
        console.error('Ошибка при создании отзыва:', error);
    }
};

export default CreateReview;
