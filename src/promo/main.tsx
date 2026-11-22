import React from 'react';
import { createRoot } from 'react-dom/client';
import Promo from './Promo';
import './styles.css';

createRoot(document.getElementById('root')!).render(<>
  <nav className="product-return" aria-label="Your Evolution workspace">
    <a href="/" target="_top">Open Evolution OS</a>
    <a href="/?section=account#access-overview" target="_top">Account & access</a>
    <a href="/?section=account" target="_top">Sign up</a>
  </nav>
  <Promo />
</>);
