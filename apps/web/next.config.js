/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    READ_CAPTCHA_WITH_AI: process.env.READ_CAPTCHA_WITH_AI,
    DISPLAY_COPY_CURL_BUTTON: process.env.DISPLAY_COPY_CURL_BUTTON,
    DISPLAY_AUTO_REGISTER_BUTTON: process.env.DISPLAY_AUTO_REGISTER_BUTTON,
    GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY,
  },
};

export default nextConfig;
