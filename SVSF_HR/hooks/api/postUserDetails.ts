
// this code is for post all userdetails to the api server 

import axios from "axios";

export const postUserDetails = async(userData: any) => {
  // console.log("data:",userData);
    try {
      const response = await axios.post('https://infogreen.in/api/infogreen_app_user_details.php', userData);
      // console.log(response.data);
    return response.data
    } catch (error) {
      console.log(error);  
    }
};

