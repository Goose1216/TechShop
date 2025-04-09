import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../styles/Products/DetailProductsPage.module.css';
import AddToCartButton from '../../AddToCartButton';
import blockStyle from '../../styles/BlockStyle.module.css';
import CartImg from '../../img/orange-cart.png';
import CartImgActive from '../../img/green-cart.png';
import ListReview from '../Reviews/ListReview';
import CreateReview from '../Reviews/CreateReview';
import { useCart } from '../../CartContext';
import { getToken } from '../../authStorage';
import { useParams } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const ProductDetail = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState('1');
    const { setCartQuantity } = useCart();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isReviewed, setIsReviewed] = useState(false);
    const { slug } = useParams();

    const fetchProductDetail = async () => {
        const token = getToken();
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }

        try {
            const response = await axios.get(`http://localhost:8000/api/v1/products/${slug}/`, { headers });
            setProduct(response.data);
            setIsAuthorized(response.data.is_authorized);
            setIsReviewed(response.data.is_reviewed);
            console.log(isAuthorized, response.data.is_authorized);
            console.log(isReviewed, response.data.is_reviewed);
    } catch (error) {
        console.error('Ошибка при получении данных о товаре:', error);
    } finally {
        setLoading(false);
    }
};

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        console.log(product.id);
        await CreateReview(product.id, reviewText, rating);
        setReviewText('');
        setRating('1');
        await ListReview(slug, setReviews);
    };

    useEffect(() => {
        fetchProductDetail();
        ListReview(slug, setReviews);
    }, [slug]);

    if (loading) {
        return <div className={styles.textLoadingOrError}>Загрузка...</div>;
    }

    if (!product) {
        return <div className={styles.textLoadingOrError}>Товар не найден.</div>;
    }

    return (
        <div className={styles.DetailContainer}>
            <h1 className={styles.productName}>{product.name}</h1>
            <div className={styles.productDetailContainer}>
                <img src={product.image} alt={product.name} className={styles.productImage} />
                <div className={styles.productInfo}>
                    <p className={styles.productBrand}>Бренд: {product.brand}</p>

                    <div className={styles.productCategories}>
                        <h2>Категории:</h2>
                        <ul>
                            {product.category.map(cat => (
                                <li key={cat.name}>{cat.name}</li>
                            ))}
                        </ul>
                    </div>
                     <div className={styles.productCategories}>
                        <h2>Размеры:</h2>
                        <ul>
                            <li>Высота: {product.height ? product.height : 'Нет данных'}</li>
                            <li>Ширина: {product.width ? product.width : 'Нет данных'}</li>
                            <li>Длина: {product.depth ? product.depth : 'Нет данных'}</li>
                        </ul>
                     </div>
                     <div className={styles.productPrice}>
                        Цена: {product.price.toLocaleString('ru-RU')} ₽
                        {product.discount > 0 && (
                            <span className={styles.discountPrice}>
                                {product.price_standart}
                            </span>
                        )}
                    </div>
                    <div className={styles.addToCartContainer}>
                        <AddToCartButton
                            imageSrc={CartImg}
                            activeImageSrc={CartImgActive}
                            productId={product.id}
                            countItem={1}
                            setCartQuantity={setCartQuantity}
                            className={blockStyle.AddToCartButtonCatalog}
                        />
                    </div>
                </div>
            </div>
           <div className={styles.reviewsSection}>
    <h1>Отзывы</h1>
    {isAuthorized ? (
        isReviewed ? (
            <div className={styles.review}>
                <h2>Вы уже оставили отзыв на этот товар!</h2>
            </div>
        ) : (
            <div className={styles.review}>
              <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                <div className={styles.star_rating}>
                    <div className={styles.star_rating__wrap}>
                        {[5, 4, 3, 2, 1].map(star => (
                            <>
                                <input
                                    key={`star-rating-${star}`}
                                    className={styles.star_rating__input}
                                    id={`star-rating-${star}`}
                                    type="radio"
                                    name="rating"
                                    value={star}
                                    onChange={() => setRating(star)}
                                />
                                <label
                                    className={`${styles['star_rating__ico']} fa fa-star-o fa-lg`}
                                    htmlFor={`star-rating-${star}`}
                                    title={`${star} out of 5 stars`}
                                ></label>
                            </>
                        ))}
                    </div>
                </div>
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Напишите ваш отзыв... (Можете оставить пустым)"
                    className={styles.reviewInput}
                />
                <button type="submit" className={styles.submitButton}>Отправить отзыв</button>
            </form>
            </div>
        )
    ) : (
        <div className={styles.reviewNot}>
            <h2>Хотите оставить отзыв? Авторизуйтесь!</h2>
        </div>
    )}
    {reviews.length === 0 ? (
                <div className={styles.reviewNot}>
                    <h2> ОТЗЫВОВ ПОКА НЕТ :( </h2>
                    <h3> Будьте первым кто его оставит! </h3>
                </div>
                ) : (
                    reviews.map(rew => {
                        return (
                            <div key={rew.pk} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                   <span className={styles.reviewRating}>
                                        {Array.from({ length: 5 }, (_, index) => (
                                            <i
                                                key={index}
                                                className={`fa ${index < rew.rate ? 'fa-star' : 'fa-star-o'}`}
                                                style={{ color: index < rew.rate ? 'gold' : 'gray' }}
                                                title={`${rew.rate} из 5 звёзд`}
                                            ></i>
                                        ))}
                                   </span>
                                   <h3 className={styles.reviewAuthor}>{rew.author}</h3>
                                </div>
                                <p className={styles.reviewText}>{rew.review}</p>
                            </div>
                        );
                    })
                )}
</div>

        </div>
    );
};

export default ProductDetail;