import axios from "axios"

export const notFound = async () => {
    const response = await axios.get("https://dog.ceo/api/breeds/image/random");    
    console.log(response);
    
    return response.data.message;
}

export const unauthorized = async () => {
    const response = await axios.get("https://api.thecatapi.com/v1/images/search");    
    console.log(response);
    
    return response.data[0].url;
}