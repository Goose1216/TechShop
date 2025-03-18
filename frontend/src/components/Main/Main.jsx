import React, { useState, useEffect, useRef } from "react";
import mainStyles from '../../styles/Main/Main.module.css';
import blockStyle from '../../styles/BlockStyle.module.css';
import axios from "axios";
import SalePict from '../../img/SalePict.png';
import { Link } from 'react-router-dom';

const Main = () => {
    const [products, setProducts] = useState([]);
    const [position, setPosition] = useState(0);
    const carouselRef = useRef(null);
    const itemRef = useRef(null);

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
        } else if (newPosition < -(itemWidth * (3- 1))) {
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
                                        <div>
                                            <Link to={`/${item.slug}`}>
                                                <img src={item.image} alt="Изображение товара" />
                                            </Link>
                                        </div>
                                       <h1 className={blockStyle.ProductName}>{item.name}</h1>
                                       {item.discount > 0 && (
                                       <div>
                                          <div className={blockStyle.OldProductPrice}>{item.price_standart.toLocaleString('ru-RU')} ₽</div>
                                          <div className={blockStyle.SalePicture}>
                                              <img src={SalePict} alt="Скидка" />
                                          </div>
                                       </div>
                                       )}
                                        <span className={blockStyle.ProductPrice}>{item.price.toLocaleString('ru-RU')} ₽</span>
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
                            <div>
                                <Link to={`/${item.slug}`}>
                                    <img src={item.image} alt="Изображение товара" />
                                </Link>
                            </div>
                            <h1 className={blockStyle.ProductName}>{item.name}</h1>
                           {item.discount > 0 && (
                           <div>
                              <div className={blockStyle.OldProductPrice}>{item.price_standart.toLocaleString('ru-RU')} ₽</div>
                              <div className={blockStyle.SalePicture}>
                                  <img src={SalePict} alt="Скидка" />
                              </div>
                           </div>
                           )}
                            <span className={blockStyle.ProductPrice}>{item.price.toLocaleString('ru-RU')} ₽</span>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default Main;