import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Main/Header';
import AllProductsPage from './components/Products/AllProductsPage';
import AboutUs from './components/Main/AboutUs';
import Footer from './components/Main/Footer';
import Main from './components/Main/Main';
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
                    <Route path="/about" element={<AboutUs />} />
                </Routes>
                <Footer />
            </div>
         </CartProvider>
        </Router>
    );
};

export default App;