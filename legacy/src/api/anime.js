import axios from 'axios';
export const getItems = (animeInput) => {
   return axios
      .get(animeInput)
      .then((response) => {
         return response.data;
      })
      .catch((e) => console.log(e));
};
