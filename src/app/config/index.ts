import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,

  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,

  jwt_access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET,
  jwt_access_token_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,

  jwt_refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
  jwt_refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,

  frontend_base_url: process.env.FRONTEND_BASE_URL,
  backend_base_url: process.env.BACKEND_BASE_URL,

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },

  ssl: {
    store_id: process.env.SSL_STORE_ID,
    store_pass: process.env.SSL_STORE_PASS,
  },

  payment: {
    success_url: process.env.PAYMENT_SUCCESS_URL,
    success_pending_approval_url:
      process.env.PAYMENT_SUCCESS_PENDING_APPROVAL_URL,
    fail_url: process.env.PAYMENT_FAIL_URL,
    cancel_url: process.env.PAYMENT_CANCEL_URL,
  },
};
