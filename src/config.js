import { config } from 'dotenv'

config()

export default {
    hostFrontend: process.env.HOST_FRONTEND || '',
    tokenMyApi: process.env.TOKEN_MY_API || '',

    dbUri: process.env.DB_URI || '',

    MINIO_DOMAIN: process.env.MINIO_DOMAIN || '',
    MINIO_USER: process.env.MINIO_USER || '',
    MINIO_PASSWORD: process.env.MINIO_PASSWORD || '',
    MINIO_BUCKET: process.env.MINIO_BUCKET || '',

    RECAPTCHA_PRIVATE_KEY: process.env.RECAPTCHA_PRIVATE_KEY || '',

    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    // SOPORTE_EMAIL: process.env.SOPORTE_EMAIL || '',
    // SOPORTE_EMAIL_PASS: process.env.SOPORTE_EMAIL_PASS || '',
}