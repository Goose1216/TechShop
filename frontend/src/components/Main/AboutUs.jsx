import React from 'react';
import aboutStyles from '../../styles/Main/AboutUsPage.module.css';

const AboutUsPage = () => {
    return (
        <div className={aboutStyles.container}>
            <h1 className={aboutStyles.title}>О нас</h1>

            <section className={aboutStyles.section}>
                <h2 className={aboutStyles.sectionTitle}>Наша история</h2>
                <p className={aboutStyles.sectionText}>
                    Компания <strong>TechShop</strong> была основана в 2010 году с целью предоставления клиентам самых современных и качественных электронных товаров.
                    Начиная с небольшого магазина в центре Москвы, мы быстро выросли в крупнейшего онлайн-ритейлера электроники в России.
                    Сегодня мы гордимся тем, что предлагаем широкий ассортимент товаров, начиная от смартфонов и ноутбуков до умной домашней техники и аксессуаров.
                </p>
                <p className={aboutStyles.sectionText}>
                    Наша миссия — сделать технологии доступными для каждого. Мы стремимся к тому, чтобы каждый клиент мог найти у нас именно то, что ему нужно,
                    по доступной цене и с гарантией качества.
                </p>
            </section>

            <section className={aboutStyles.section}>
                <h2 className={aboutStyles.sectionTitle}>Наши ценности</h2>
                <ul className={aboutStyles.valuesList}>
                    <li className={aboutStyles.valueItem}>
                        <strong>Качество:</strong> Мы тщательно отбираем товары, чтобы предложить вам только лучшее.
                    </li>
                    <li className={aboutStyles.valueItem}>
                        <strong>Доступность:</strong> Мы делаем технологии доступными для каждого.
                    </li>
                    <li className={aboutStyles.valueItem}>
                        <strong>Инновации:</strong> Мы всегда в курсе последних технологических трендов.
                    </li>
                    <li className={aboutStyles.valueItem}>
                        <strong>Клиентоориентированность:</strong> Мы ценим каждого клиента и стремимся к максимальному удовлетворению ваших потребностей.
                    </li>
                </ul>
            </section>

            <section className={aboutStyles.section}>
                <h2 className={aboutStyles.sectionTitle}>Наши филиалы</h2>
                <div className={aboutStyles.branches}>
                    <div className={aboutStyles.branch}>
                        <h3 className={aboutStyles.branchTitle}>Москва</h3>
                        <p className={aboutStyles.branchAddress}>
                            ул. Тверская, 10<br />
                            Телефон: +7 (495) 123-45-67
                        </p>
                    </div>
                    <div className={aboutStyles.branch}>
                        <h3 className={aboutStyles.branchTitle}>Санкт-Петербург</h3>
                        <p className={aboutStyles.branchAddress}>
                            Невский проспект, 25<br />
                            Телефон: +7 (812) 987-65-43
                        </p>
                    </div>
                    <div className={aboutStyles.branch}>
                        <h3 className={aboutStyles.branchTitle}>Краснодар</h3>
                        <p className={aboutStyles.branchAddress}>
                            ул. Северная, 450<br />
                            Телефон: +7 (996) 456-78-90
                        </p>
                    </div>
                </div>
            </section>

            <section className={aboutStyles.section}>
                <h2 className={aboutStyles.sectionTitle}>Свяжитесь с нами</h2>
                <p className={aboutStyles.sectionText}>
                    Мы всегда рады помочь вам! Вы можете связаться с нами любым удобным способом:
                </p>
                <ul className={aboutStyles.contactList}>
                    <li className={aboutStyles.contactItem}>
                        <strong>Телефон:</strong> +7 (996) 456-78-90
                    </li>
                    <li className={aboutStyles.contactItem}>
                        <strong>Email:</strong> info@techshop.ru
                    </li>
                    <li className={aboutStyles.contactItem}>
                        <strong>Социальные сети:</strong>
                        <div className={aboutStyles.socialLinks}>
                            <a href="https://facebook.com/techshop" target="_blank" rel="noopener noreferrer">Facebook</a>
                            <a href="https://twitter.com/techshop" target="_blank" rel="noopener noreferrer">Twitter</a>
                            <a href="https://instagram.com/techshop" target="_blank" rel="noopener noreferrer">Instagram</a>
                        </div>
                    </li>
                </ul>
            </section>

            <section className={aboutStyles.section}>
                <h2 className={aboutStyles.sectionTitle}>Мы на карте</h2>
                <div className={aboutStyles.mapContainer}>
                    <iframe
                        src="https://yandex.ru/map-widget/v1/?um=constructor%3Af6be88954ec4f970630910d9ac88c145cf8409f9a7cd2dc73f58c4eab47e01e8&amp;source=constructor" width="100%" height="411" frameborder="0"
                        width="100%"
                        height="400"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                    ></iframe>
                </div>
            </section>
        </div>
    );
};

export default AboutUsPage;