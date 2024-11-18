import axios from "axios";   

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

axios.defaults.baseURL = API_BASE_URL;

