import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import './Nav.css';
import { Link } from  "react-router-dom";

export default function Header() {
  
  return (
    <div className="topnav">
  <div className="topnav-left">
    <div className = "leftist">
    <Link className="passive" to="/">Generative SVG NFTs</Link>
    </div>
    <div className = "left-normal">
    <Link to="/mint">Mint</Link>
    <Link to="/about">About</Link>
    </div>
  </div>
  <div className="topnav-right">
    
  </div>
  
</div>
      )
      }