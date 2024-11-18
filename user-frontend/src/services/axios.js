import axios from "axios";
import dotenv from "dotenv";
dotenv.config();    

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

axios.defaults.baseURL = API_BASE_URL;

