export default () => ({
  db_url: process.env.DATABASE_URL!,
  sendGrid_api_key: process.env.SENDGRID_API_KEY!,
  sendGrid_sender: process.env.SENDGRID_SENDER!,
  local_host: process.env.LOCAL_HOST!,
  client_host: process.env.CLIENT_HOST!,
  recaptcha_secret_key: process.env.RECAPTCHA_SECRET_KEY!,
  jwt_secret_key: process.env.JWT_SECRET_KEY!,
  google_client_id: process.env.GOOGLE_CLIENT_ID!,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  port: process.env.PORT!,
});
