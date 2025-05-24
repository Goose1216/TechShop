import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Main/Header';
import AllProductsPage from './components/Products/AllProductsPage';
import ProductDetail from './components/Products/DetailProductsPage';
import AboutUs from './components/Main/AboutUs';
import Footer from './components/Main/Footer';
import Main from './components/Main/Main';
import GoogleAuth from './components/Users/GoogleAuth';
import YandexAuth from './components/Users/YandexAuth';
import UserProfile from './components/Users/UserProfile';
import CartPage from './components/Cart/CartPage'
import OrderCreate from './components/Orders/OrderCreate'
import OrderDetail from './components/Orders/OrderDetail'
import OrderList from './components/Orders/OrderWindow'
import EmailVerification from './components/Users/SendEmailVerifications'
import EmailConfirmPage from './components/Users/EmailVerificationAccept'
import PasswordReset from './components/Users/PasswordReset'
import PasswordResetEmail from './components/Users/PasswordResetEmail'
import { CartProvider } from './CartContext';

const App = () => {
    return (
        <Router>
         <CartProvider>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/products" element={<AllProductsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/login/google" element={<GoogleAuth />} />
                    <Route path="/login/yandex" element={<YandexAuth />} />
                    <Route path="/user" element={<UserProfile />} />
                    <Route path="/orders" element={<OrderList />} />
                    <Route path="/order/:uuid" element={<OrderDetail />} />
                    <Route path="/create_order" element={<OrderCreate />} />
                    <Route path="/email_verification" element={<EmailVerification />} />
                    <Route path="/email_verification/:key" element={<EmailConfirmPage />} />
                    <Route path="/password_reset" element={<PasswordResetEmail />} />
                    <Route path="/password_reset_confirm/:uid/:key" element={<PasswordReset />} />
                    <Route path="/:slug" element={<ProductDetail />} />
                </Routes>
                <Footer />
            </div>
         </CartProvider>
        </Router>
    );
};

export default App;