import dotenv from "dotenv";
import {v2 as cloudinary} from 'cloudinary';
dotenv.config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME_CLOUDDINARY,
    api_key: process.env.API_KEY_CLOUDDINARY,
    api_secret: process.env.API_SECRET_CLOUDINARY
});

export default cloudinary;