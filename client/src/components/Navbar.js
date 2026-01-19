import React from 'react';
import { Link } from 'react-router-dom';
import { FaSchool, FaUsers, FaPlusCircle, FaSignOutAlt, FaChalkboardTeacher } from 'react-icons/fa';

// App.js'ten gelen onLogout fonksiyonunu alıyoruz
const Navbar = ({ onLogout }) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
            <div className="container">
                <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
                    <FaSchool className="me-2" size={24} /> BERLINER AKADEMIE
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/"><FaSchool className="me-1" /> Dashboard</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/students"><FaUsers className="me-1" /> Öğrenciler</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/classes"><FaChalkboardTeacher className="me-1" /> Sınıflar</Link>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle text-warning fw-bold" href="#" role="button" data-bs-toggle="dropdown">
                                <FaPlusCircle className="me-1" /> Yeni Kayıt
                            </a>
                            <ul className="dropdown-menu">
                                <li><Link className="dropdown-item" to="/add-student">Öğrenci Ekle</Link></li>
                                <li><Link className="dropdown-item" to="/add-class">Sınıf Ekle</Link></li>

                            </ul>
                        </li>

                        {/* ÇIKIŞ YAP BUTONU */}
                        <li className="nav-item ms-3 border-start ps-3">
                            <button className="btn btn-outline-danger btn-sm text-white" onClick={onLogout}>
                                <FaSignOutAlt className="me-1" /> Çıkış
                            </button>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;