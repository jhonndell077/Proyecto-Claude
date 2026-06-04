const env = {
  PORT: parseInt(process.env.PORT ?? "4000"),
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
};

export default env;
