import React, { useState } from 'react';
import { getItems } from '../api/anime';
import '../css/nav.css';

const Nav = ({ handleInput, handleSubmit, animeInput }) => {
   return (
      <form className="nav" onSubmit={handleSubmit}>
         <input
            className="animeInput"
            onChange={handleInput}
            placeholder="Enter Anime Name"
            value={animeInput}
         ></input>
         <button className="animeButton">Go</button>
      </form>
   );
};

export default Nav;
