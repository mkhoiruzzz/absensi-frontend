import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ currentUser, onLogout }) => {
  return (
    <>
      <Navbar currentUser={currentUser} onLogout={onLogout} />
      <div className="container">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;