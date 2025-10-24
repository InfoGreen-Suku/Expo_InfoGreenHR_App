import apiClient from '../logger/apiClient';

export const  PostSharedFile= async(formData: any)=> {
    // console.log(formData);
    try {
        let apiSharedfileUrl = 'https://infogreen.synology.me:82/api.php'; // Fallback URL
        const response = await apiClient.post(apiSharedfileUrl, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
    //   console.log(response.data);
    return response.data
    } catch (error) {
      console.log("error",error);  
    }
}