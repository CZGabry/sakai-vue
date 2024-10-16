import axios from 'axios';



export function useAxios() {

    const axiosInstance = axios.create({
        baseURL: 'https://localhost:7031/' 
    });
    return {
        get: async (endpoint: string, { params = {} } = {}) => {
            try {
                const response = await axios.get(endpoint, { params });
                return response;
            } catch (error) {
                console.error('API call failed:', error);
                throw new Error('Failed to fetch data');
            }
        },
        post: async (endpoint: string, item: any) => {
            try {
                const response = await axios.post(endpoint,item);
                return response;
            } catch (error) {
                console.error('API call failed:', error);
                throw new Error('Failed to fetch data');
            }
        }
    };
}
