import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { DB } from './constants'

export class Database {
    private static instance: Database;
    private pool: Pool;

    private constructor() {
        const config: PoolConfig = DB;

        this.pool = new Pool(config);

        this.pool.on('error', (err: any) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }

    // Patrón Singleton para asegurar una única instancia del Pool
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    /**
     * Ejecuta una consulta SQL.
     * @template T El tipo de dato esperado para las filas de la tabla.
     */
    public async query<T extends QueryResultRow = any>(
        text: string,
        params?: any[]
    ): Promise<QueryResult<T>> {
        const start = Date.now();
        try {
            const res = await this.pool.query<T>(text, params);
            const duration = Date.now() - start;

            console.log('Query executed', { text, duration, rows: res.rowCount });
            return res;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    public async execute<T extends QueryResultRow = any>(
        text: string,
        params?: any[]
    ): Promise<any> {
        const start = Date.now();
        try {
            const result = await this.pool.query<T>(text, params);
            const duration = Date.now() - start;

            console.log('Query executed', { text, duration, rows: result.rowCount });

            if (result.command == 'UPDATE')
                return { affectedRows: result.rowCount, rows: result.rows }

            if (result.command == 'INSERT')
                return { insertId: result.rows[0]?.id, rows: result.rows }

            if (Array.isArray(result)) {
                return result.map((item: any) => item.rows)
            }

            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    public async getFirst<T extends QueryResultRow = any>(
        text: string,
        params?: any[]
    ): Promise<any> {

        const result = await this.query(text, params)
        return result?.rows.length > 0 && result?.rows[0] || null
    }

    public async getArray<T extends QueryResultRow = any>(
        text: string,
        params?: any[]
    ): Promise<any[]> {

        const result = await this.query(text, params)
        return result?.rows
    }

    public async close(): Promise<void> {
        await this.pool.end();
    }
}

// Exportamos la instancia única
export const db = Database.getInstance();