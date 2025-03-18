import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Main/Header';
import Footer from './components/Main/Footer';
import Main from './components/Main/Main';

const App = () => {
    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" element={<Main />} />

                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

export default App;