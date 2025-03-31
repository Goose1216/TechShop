import React, { useState, useEffect, useRef } from "react";
import mainStyles from '../../styles/Main/Main.module.css';
import blockStyle from '../../styles/BlockStyle.module.css';
import axios from "axios";
import SalePict from '../../img/SalePict.png';
import CartImg from '../../img/orange-cart.png';
import CartImgActive from '../../img/green-cart.png';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import AddToCartButton from '../../AddToCartButton.js';
import { useCart } from '../../CartContext';

const Main = () => {
    const [products, setProducts] = useState([]);
    const [position, setPosition] = useState(0);
    const carouselRef = useRef(null);
    const itemRef = useRef(null);
    const { setCartQuantity } = useCart();

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/v1/products/main/')
            .then(res => {
                console.log(res.data);
                setProducts(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    const newProducts = products.filter(item => item.category.some(cat => cat.name === 'Новинка'));
    const discountProducts = products.filter(item => item.category.some(cat => cat.name === 'Выгодно'));

    const scrollCarousel = (direction) => {
        const itemWidth = itemRef.current.offsetWidth;
        const containerWidth = carouselRef.current.offsetWidth;
        const scrollAmount = containerWidth;

        let newPosition;

        if (direction === 'left') {
            newPosition = position + scrollAmount;
        } else {
            newPosition = position - scrollAmount;
        }

        if (newPosition > 0) {
            newPosition = -(itemWidth * (3 - 1));
        } else if (newPosition < -(itemWidth * (3 - 1))) {
            newPosition = 0;
        }

        setPosition(newPosition);
    };

    return (
        <main className={mainStyles.MainContainer}>
            <h2 className={mainStyles.Stock}>НОВИНКА</h2>
            <div className={mainStyles.carouselContainer}>
                <span ref={carouselRef} className={mainStyles.carousel} style={{ transform: `translateX(${position}px)` }}>
                    {newProducts.reduce((acc, item, index) => {
                        if (index % 4 === 0) {
                            acc.push([]);
                        }
                        acc[acc.length - 1].push(item);
                        return acc;
                    }, []).map((chunk, index) => (
                        <div key={index} ref={itemRef} className={mainStyles.item}>
                            <div className={blockStyle.BlockContainer}>
                                {chunk.map(item => (
                                    <div className={blockStyle.Block} key={item.id}>
                                        <div className={blockStyle.ImageContainer}>
                                            <Link to={`/${item.slug}`}>
                                                <img src={item.image} alt="Изображение товара" className={blockStyle.ProductImage} />
                                            </Link>
                                            {item.discount > 0 && (
                                                <div className={blockStyle.SalePicture}>
                                                    <img src={SalePict} alt="Скидка" />
                                                </div>
                                            )}
                                        </div>
                                        <h1 className={blockStyle.ProductName}>{item.name}</h1>
                                        <div className={blockStyle.RatingContainer}>
                                            <div className={blockStyle.starRating}>
                                                <div className={blockStyle.emptyStars}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} />
                                                    ))}
                                                </div>
                                                <div
                                                    className={blockStyle.filledStars}
                                                    style={{ width: `${(item.total_rate / 5) * 100}%` }}
                                                >
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} color="#ffc107" />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className={blockStyle.totalRate}>{item.total_rate}</span>
                                        </div>
                                        {item.discount > 0 && (
                                            <div className={blockStyle.PriceContainer}>
                                                <span className={blockStyle.OldProductPrice}>{item.price_standart.toLocaleString('ru-RU')} ₽</span>
                                                <span className={blockStyle.ProductPrice}>{item.price.toLocaleString('ru-RU')} ₽</span>
                                            </div>
                                        )}
                                        {!item.discount && (
                                            <span className={blockStyle.ProductPrice}>{item.price.toLocaleString('ru-RU')} ₽</span>
                                        )}
                                        <div className={blockStyle.AddToCartButton}>
                                            <AddToCartButton
                                                imageSrc={CartImg}
                                                activeImageSrc={CartImgActive}
                                                productId={item.pk}
                                                setCartQuantity={setCartQuantity}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </span>
                <span className={mainStyles.TapeButtons}>
                    <button className={mainStyles.arrow} onClick={() => scrollCarousel('left')}>&#60;</button>
                    <button className={mainStyles.arrow} onClick={() => scrollCarousel('right')}>&#62;</button>
                </span>
            </div>

            <h2 className={mainStyles.BestProduct}>ЛУЧШИЕ ПРЕДЛОЖЕНИЯ</h2>
            <div className={mainStyles.BestContainerBlocks}>
                <div className={blockStyle.BlockContainer}>
                    {discountProducts.map(item => (
                        <div className={blockStyle.Block} key={item.id}>
                            <div className={blockStyle.ImageContainer}>
                                <Link to={`/${item.slug}`}>
                                    <img src={item.image} alt="Изображение товара" className={blockStyle.ProductImage} />
                                </Link>
                                {item.discount > 0 && (
                                    <div className={blockStyle.SalePicture}>
                                        <img src={SalePict} alt="Скидка" />
                                    </div>
                                )}
                            </div>
                            <h1 className={blockStyle.ProductName}>{item.name}</h1>
                            <div className={blockStyle.RatingContainer}>
                                <div className={blockStyle.starRating}>
                                    <div className={blockStyle.emptyStars}>
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} />
                                        ))}
                                    </div>
                                    <div
                                        className={blockStyle.filledStars}
                                        style={{ width: `${(item.total_rate / 5) * 100}%` }}
                                    >
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} color="#ffc107" />
                                        ))}
                                    </div>
                                </div>
                                <span className={blockStyle.totalRate}>{item.total_rate}</span>
                            </div>
                            <div className={blockStyle.PriceContainer}>
                                {item.discount > 0 && (
                                    <span className={blockStyle.OldProductPrice}>{item.price_standart.toLocaleString('ru-RU')} ₽</span>
                                )}
                                <span className={blockStyle.ProductPrice}>{item.price.toLocaleString('ru-RU')} ₽</span>
                            </div>
                            <div className={blockStyle.AddToCartButton}>
                                <AddToCartButton
                                    imageSrc={CartImg}
                                    activeImageSrc={CartImgActive}
                                    productId={item.pk}
                                    setCartQuantity={setCartQuantity}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default Main;