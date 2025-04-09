import axios from 'axios';

const ListReview = async (slug, setReviews) => {
    try {
        const response = await axios.get(`http://localhost:8000/api/v1/products/reviews/list/?slug=${slug}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );
        if (response.status === 200) {
            setReviews(response.data);
            console.log('Отзывы получены:', response.data);
        } else {
            throw new Error(`HTTP error ${response.status}`);
        }
    } catch (error) {
        console.error('Ошибка при получении списка отзывов:', error);
    }
};

export default ListReview;
