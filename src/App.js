import React from 'react';
import Home from './Home.js';
import Mint from './Mint.js';
import About from './About.js';
import Header from './components/Navigation.js';
import {  BrowserRouter as Router, Routes, Route } from "react-router-dom";



function Homepage() {
return (
  <div>
  <Header />
  <Home />
  </div>
)
}

function Mintpage() {
  return (
    <div>
    <Header />
    <Mint />
    </div>
  )
  }

  function Aboutpage() {
    return (
      <div>
      <Header />
      <About />
      </div>
    )
    }


export default function App() {
  return (
    <div >
    <Routes>
      <Route  path='/' element={<Homepage />} />
    </Routes>
    <Routes>
      <Route  path='/mint' element={<Mintpage />} />
    </Routes>
    <Routes>
      <Route  path='/about' element={<Aboutpage />} />
    </Routes>
  </div>
  );
}