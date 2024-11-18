// interviewService.js

import axios from 'axios';

// Mülakatları getirme
export const fetchInterviews = async () => {
    const response = await axios.get(`/interviews`);
    return response.data;
};

// Yeni mülakat oluşturma
export const createInterview = async (interviewData) => {
    const response = await axios.post(`/interviews`, interviewData);
    return response.data;
};

// Mülakat güncelleme
export const updateInterview = async (interviewId, interviewData) => {
    const response = await axios.put(`/interviews/${interviewId}`, interviewData);
    return response.data;
};

// Mülakat silme
export const deleteInterview = async (interviewId) => {
    const response = await axios.delete(`/interviews/${interviewId}`);
    return response.data;
};

// ID'ye göre mülakat getirme
export const getInterviewById = async (interviewId) => {
    const response = await axios.get(`/interviews/${interviewId}`);
    return response.data;
};

// Soru paketindeki soruları ID ile getirme
export const getQuestionsInPackage = async (packageId) => {
    const response = await axios.get(`/question-packages/${packageId}/questions`);
    return response.data;
};
