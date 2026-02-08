
export const PORT = process.env.PORT || 60001
export const SECRET = process.env.SECRET || 'bYkqet-pansat-kavdi1'
export const SECRET_REFRESH = process.env.SECRET_REFRESH || 'caxty1-qAqdeq-wizsip'
export const SECRET_API_KEY = process.env.SECRET_API_KEY || 'pebwyj-Wivge1-wijmob'
export const SECRET_FILE = process.env.SECRET_FILE || 'rahhib-virgo3-Dogjyj'
export const FILE_PATH = process.env.FILE_PATH || '/app/files'
export const DOMAIN_URL = process.env.DOMAIN_URL || 'https://eservices.app.com'
export const FILE_URL = process.env.DOMAIN_URL || '' + '/files/'

export const DB_TYPE = process.env.DB_TYPE || 'postgres'
export const DB_MODE = process.env.DB_MODE || 'POOL'

export const DB = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
    max: process.env.DB_MAX && Number(process.env.DB_MAX) || 10, // Máximo de conexiones en el pool
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT_MILLIS && Number(process.env.DB_IDLE_TIMEOUT_MILLIS) || 30000, // Tiempo máximo que una conexión puede estar inactiva
    connectionTimeoutMillis: process.env.DB_IDLE_TIMEOUT_MILLIS && Number(process.env.DB_IDLE_TIMEOUT_MILLIS) || 30000, // Tiempo máximo que una conexión puede estar inactiva
}

export const SMTP_VALUES: any = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    }
}

export const LOGIN_CONFIG: any = {
    expiresIn: process.env.LOGIN_EXPIRES_IN || '1h',
    validateIp: process.env.LOGIN_VALDIDATE_IP === 'true',
    maxAttemps: parseInt(process.env.LOGIN_MAX_ATTEMPS || '3'),
    validateChangeIp: process.env.LOGIN_VALIDATE_CHANGE_IP === 'true'
}

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
export const GOOGLE_SECRET = process.env.GOOGLE_SECRET || ''