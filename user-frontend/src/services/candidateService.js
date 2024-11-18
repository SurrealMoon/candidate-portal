import axios from 'axios';


// Aday bilgilerini kaydeden işlev
export const createCandidate = async (candidateData) => {
    try {
        const response = await axios.post(`/candidates`, candidateData);
        return response.data;
    } catch (error) {
        // Hata mesajını frontend'e iletmek için error'u yeniden fırlatıyoruz
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || 'Bir hata oluştu');
        } else {
            throw new Error('Sunucuya bağlanırken bir hata oluştu');
        }
    }
};
