import axios from "axios";
const apiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

const getApiUrl = (url) => {
    if (!url) return apiUrl;
    if (/^https?:\/\//i.test(url)) return url;
    return apiUrl ? `${apiUrl}${url}` : url;
};

export const postData = async (url, formData) => {
    try {
        
        const response = await fetch(getApiUrl(url), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },

            body: JSON.stringify(formData)
        });


        if (response.ok) {
            const data = await response.json();
            //console.log(data)
            return data;
        } else {
            const errorData = await response.json();
            return errorData;
        }

    } catch (error) {
        console.error('Error:', error);
    }

}



export const fetchDataFromApi = async (url) => {
    try {
        const params={
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },
        
        } 

         const { data } = await axios.get(getApiUrl(url),params)
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}


export const uploadImage = async (url, updatedData ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
          
          },
    
    } 

    var response;
    await axios.put(getApiUrl(url),updatedData, params).then((res)=>{
        response=res;
        
    })
    return response;
   
}


export const uploadImages = async (url, formData ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
          
          },
    
    } 

    var response;
    await axios.post(getApiUrl(url),formData, params).then((res)=>{
        response=res;
        
    })
    return response;
   
}



export const editData = async (url, updatedData ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 

    var response;
   await axios.put(getApiUrl(url),updatedData, params).then((res)=>{
        response=res;
        
    })
    return response;
   
}





export const deleteImages = async (url,image ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 
    const { res } = await axios.delete(getApiUrl(url), params);
    return res;
}


export const deleteData = async (url ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 
    const { res } = await axios.delete(getApiUrl(url),params)
    return res;
}

export const deleteMultipleData = async (url,data ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 
    const { res } = await axios.delete(getApiUrl(url),data,params)
    return res;
}