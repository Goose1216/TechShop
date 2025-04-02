import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import SalePict from '../../img/SalePict.png';
import CartImg from '../../img/orange-cart.png';
import CartImgActive from '../../img/green-cart.png';
import AddToCartButton from '../../AddToCartButton.js';
import { useCart } from '../../CartContext';
import allProductsStyles from '../../styles/Products/AllProductsPage.module.css';
import blockStyle from '../../styles/BlockStyle.module.css';
import { FaStar } from 'react-icons/fa';

const AllProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100000);
    const [brands, setBrands] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [sortOption, setSortOption] = useState('-price');
    const { setCartQuantity } = useCart();
    const location = useLocation();

     function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    useEffect(() => {
        fetchProducts();
    }, [window.location.search, currentPage, sortOption, selectedBrands, minPrice, maxPrice]);

   const fetchProducts = () => {
        const urlParams = new URLSearchParams(window.location.search); //
        const searchQuery = urlParams.get('q') || ''; //

        const params = new URLSearchParams({
            page: currentPage,
            sort: sortOption,
            price: `${minPrice}-${maxPrice}`,
            brand: selectedBrands.join('-'),
            q: searchQuery, //
        });

        const csrfToken = getCookie('csrftoken');

        axios.get(`http://localhost:8000/api/v1/products/list?${params.toString()}`, {}, {headers: {'X-CSRFToken': csrfToken }})
            .then(response => {
                setProducts(response.data.results);
                setTotalPages(response.data.count_pages);
                setBrands(response.data.brands);
                setMaxPrice(response.data.max_price)
            })
            .catch(error => console.error('Ошибка загрузки данных:', error));
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const handleBrandChange = (brand) => {
        if (selectedBrands.includes(brand)) {
            setSelectedBrands(selectedBrands.filter(b => b !== brand));
        } else {
            setSelectedBrands([...selectedBrands, brand]);
        }
    };

    const handlePriceChange = (event) => {
        const { name, value } = event.target;
        if (name === 'minPrice') {
            setMinPrice(parseInt(value));
        } else {
            setMaxPrice(parseInt(value));
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 3;
    const ellipsis = <span className={allProductsStyles.ellipsis}>...</span>;

    pages.push(
        <button
            key={1}
            className={currentPage === 1 ? allProductsStyles.activePage : allProductsStyles.pageButton}
            onClick={() => handlePageChange(1)}
        >
            1
        </button>
    );

    if (currentPage > maxVisiblePages) {
        pages.push(ellipsis);
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
            pages.push(
                <button
                    key={i}
                    className={currentPage === i ? allProductsStyles.activePage : allProductsStyles.pageButton}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }
    }

    if (currentPage < totalPages - maxVisiblePages + 1) {
        pages.push(ellipsis);
    }

    if (totalPages > 1) {
        pages.push(
            <button
                key={totalPages}
                className={currentPage === totalPages ? allProductsStyles.activePage : allProductsStyles.pageButton}
                onClick={() => handlePageChange(totalPages)}
            >
                {totalPages}
            </button>
        );
    }

    return pages;
};

    return (
        <div className={allProductsStyles.container}>
            <div className={allProductsStyles.filters}>
                <div className={allProductsStyles.filterSection}>
                    <h3>Цена</h3>
                    <div className={allProductsStyles.priceRange}>
                        <input
                            type="number"
                            name="minPrice"
                            value={minPrice}
                            onChange={handlePriceChange}
                            placeholder="От"
                        />
                        <input
                            type="number"
                            name="maxPrice"
                            value={maxPrice}
                            onChange={handlePriceChange}
                            placeholder="До"
                        />
                    </div>
                </div>

                <div className={allProductsStyles.filterSection}>
                    <h3>Бренды</h3>
                    {brands.map(brand => (
                        <label key={brand} className={allProductsStyles.brandLabel}>
                            <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand)}
                                onChange={() => handleBrandChange(brand)}
                            />
                            {brand}
                        </label>
                    ))}
                </div>

                <div className={allProductsStyles.filterSection}>
                    <h3>Сортировка</h3>
                    <select value={sortOption} onChange={handleSortChange}>
                        <option value="-price">Сначала дорогие</option>
                        <option value="price">Сначала недорогие</option>
                        <option value="name">По алфавиту</option>
                        <option value="-total_rate">По рейтингу</option>
                    </select>
                </div>
            </div>

            <div className={allProductsStyles.productsGrid}>
                {products.map(product => (
                    <div key={product.pk} className={allProductsStyles.productCard}>
                        <Link to={`/${product.slug}`} className={allProductsStyles.productLink}>
                            <img src={product.image} alt={product.name} className={allProductsStyles.productImage} />
                            <h3 className={allProductsStyles.productName}>{product.name}</h3>
                        </Link>
                        <p className={allProductsStyles.productBrand}>Бренд: {product.brand}</p>

                            {product.discount > 0 && (
                                <span className={allProductsStyles.oldProductPrice}>
                                    {product.price_standart.toLocaleString('ru-RU')} ₽
                                </span>
                            )}
                        <p className={allProductsStyles.productPrice}>{product.price.toLocaleString('ru-RU')} ₽ </p>
                        {product.discount > 0 && (
                            <div className={blockStyle.SalePicture}>
                                <img src={SalePict} alt="Скидка" />
                            </div>
                        )}
                        <div className={allProductsStyles.AddToCartButton}>
                            <AddToCartButton
                                imageSrc={CartImg}
                                activeImageSrc={CartImgActive}
                                productId={product.pk}
                                setCartQuantity={setCartQuantity}
                            />
                        </div>
                         <div className={allProductsStyles.RatingContainer}>
                       <div className={blockStyle.starRating}>
                        <div className={blockStyle.emptyStars}>
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} />
                            ))}
                        </div>
                        <div
                            className={blockStyle.filledStars}
                            style={{ width: `${(product.total_rate / 5) * 100}%` }}
                        >
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} color="#ffc107" />
                            ))}
                        </div>
                    </div>
                    <span className={blockStyle.totalRate}>{product.total_rate}</span>
                    </div>
                    </div>
                ))}
            </div>

            {/* Пагинация */}
            <div className={allProductsStyles.pagination}>
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                    &lt;&lt;
                </button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    &lt;
                </button>
                {renderPagination()}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    &gt;
                </button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                    &gt;&gt;
                </button>
            </div>
        </div>
    );
};

export default AllProductsPage;