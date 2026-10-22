import React, { useState } from 'react';
import { getItems } from '../api/anime';
import '../css/anime.css';
import Nav from './nav';
const Anime = () => {
   //setting are states
   const [Item, setItem] = useState([]);
   const [isLoading, setisLoading] = useState(false);
   const [animeInput, setanimeInput] = useState('');
   const [limit, setlimit] = useState(16);
   const [page, setpage] = useState(1);

   //handling all events
   const handleSubmit = (evt) => {
      evt.preventDefault();
      setisLoading(true);
      getItems(
         `https://api.jikan.moe/v3/search/anime?q=${animeInput}&amp;limit=${limit}&page=1`
      )
         .then((res) => {
            setItem(res.results);
            setisLoading(false);
         })
         .catch((e) => {
            console.log(e);
            setisLoading(false);
         });
   };
   const handleInput = (evt) => {
      setanimeInput(evt.target.value);
   };
   const handleNextPage = () => {
      setpage(page + 1);
      setisLoading(true);
      getItems(
         `https://api.jikan.moe/v3/search/anime?q=${animeInput}&amp;limit=${limit}&page=${
            page + 1
         }`
      )
         .then((res) => {
            setItem(res.results);
            setisLoading(false);
         })
         .catch((e) => {
            console.log(e);
            setisLoading(false);
         });
   };

   return isLoading ? (
      <div className="colors" style={{ paddingTop: '200px' }}>
         <div className="spinner">
            <i className="far fa-8x fa-laugh fa-spin"></i>
            <h1 className="title">Loading...</h1>
         </div>
      </div>
   ) : (
      <div>
         <Nav
            handleSubmit={handleSubmit}
            handleInput={handleInput}
            animeInput={animeInput}
         />
         {Item.length === 0 ? (
            <div className="noItemsPage">
               <i class="fas fa-arrow-up"></i>
               <h1>Search for Anime</h1>
            </div>
         ) : (
            <div className="animeCards">
               {Item.map((item, i) => (
                  <a
                     href={item.url}
                     target="_blank"
                     className="animeCard"
                     key={i}
                  >
                     <div className="topSection">
                        <div className="cardTitle">{item.title}</div>
                     </div>
                     <div className="bottomSection">
                        <img className="animeImg" src={item.image_url}></img>
                        <div className="cardDetails">{item.synopsis}</div>
                        <div className="cardDetails">
                           Episodes : {item.episodes}
                        </div>
                        <div className="cardDetails">
                           Members : {item.members}
                        </div>
                        <div className="cardDetails">
                           Ratings : {item.rated}
                        </div>
                        <div className="cardDetails">Score : {item.score}</div>
                        <div className="cardDetails">
                           {' '}
                           {item.airing === true ? 'Airing' : ''}
                        </div>
                     </div>
                  </a>
               ))}{' '}
            </div>
         )}
         {Item.length > 0 ? (
            <div className="nextPage">
               <button onClick={handleNextPage} className="nextBtn">
                  Next Page
               </button>
            </div>
         ) : (
            ''
         )}
      </div>
   );
};

export default Anime;
