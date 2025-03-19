import React, { useState } from 'react';
import styles from './styles/BlockStyle.module.css';
//import AddToCart from './components/Cart/AddToCart';


const AddToCartButton = ({ imageSrc, activeImageSrc, productId, countItem, setCartQuantity }) => {
    const [isActive, setIsActive] = useState(false);

    const handleAddToCart = async (productId, countItem, setCartQuantity) => {

        if (isActive) {
            return;
        }

        setIsActive(true);

        //await AddToCart(productId, countItem, setCartQuantity);


        setTimeout(() => {
            setIsActive(false);
        }, 2000);
    };

    return (
        <button
            className={`${styles.AddToCartButtonCatalog} ${isActive ? styles.active : ''}`}
            onClick={() => handleAddToCart(productId, countItem, setCartQuantity)}
            disabled={isActive}
        >
            <img src={isActive ? activeImageSrc : imageSrc} alt="Добавить в корзину" />
        </button>
    );
};

export default AddToCartButton;
