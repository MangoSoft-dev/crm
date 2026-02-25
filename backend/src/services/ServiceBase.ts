import moment from 'moment'
import { GraphQLError, GraphQLErrorExtensions } from 'graphql'

import { console } from '../core/security/logger'
import { Database } from '../core/database'
import { Emails } from '../integrations/emails'

export { console }

export class ServiceBase {

    db: Database
    route: string = 'ServiceBase'
    key: string = "SERVICE_BASE"
    cols: any = {}

    constructor(db: Database) {
        this.db = db
    }

    /**
     * Generates and stores a unique 6-digit security code (OTP) linked to a specific user and entity action.
     * Dispatches an email to the user with the generated code.
     * 
     * @param userId - The ID of the user requesting the code.
     * @param entity - The module or action context (e.g., 'LOGIN_OTP', 'FORCE_CHANGE_PASSWORD').
     * @param entityId - A unique identifier linking the code to the specific request iteration.
     * @param customtime - The validity duration of the code in minutes. Defaults to 2 minutes.
     * @returns A promise resolving to the generated 6-digit `code` as a string.
     */
    async createSecurityCode(userId: number, entity: string, entityId: string, customtime = 2) {

        //create random 6 digits code
        let code = `${Math.floor(100000 + Math.random() * 999999)}`.slice(0, 6);
        let expiredDate = moment().add(customtime, "minutes").toISOString();
        const date = moment().toISOString();

        //Verify user exists
        const user = await this.db.getFirst("SELECT id, email from security.users where id = $1", [userId])
        if (!user)
            throw new GraphQLError("Account not exists", { extensions: { code: 'DB_NOEXISTS' } });

        let values = {
            user_id: userId,
            entity: entity,
            entity_id: entityId,
            code: code,
            expired_date: expiredDate,
            created_by: userId,
            created_at: date,
        };

        //Insert code in DB
        const result = await this.db.execute('INSERT INTO security.security_codes SET $1', [values])

        //if no rows affected, throw error
        if (result.insertId <= 0)
            throw new GraphQLError("DB_NoAffectedRows", { extensions: { code: 'DB_NoAffectedRows' } });


        console.log("SECURITY", "security/securityCodes/createSecurityCode", "code", code)

        //Esend email with code
        await Emails.getProvider().registerEmail(userId, entity, entityId, user.email, "Codigo de verificación", `Codigo de verificación: ${code}`)

        return code

    }

    /**
     * Validates an existing security code (OTP) against the database records.
     * Verifies that the code matches the entity, hasn't expired, and is currently un-used (status = 0).
     * If validated successfully, marks the code's status as 1 (used).
     * 
     * @param entity - The module or action context to validate against.
     * @param entityId - The unique identifier linking the code to the specific request iteration.
     * @param code - The 6-digit code provided by the user to be validated.
     * @param userId - Optional. The ID of the user the code belongs to, adding a layer of validation if provided.
     * @returns A promise resolving to the code record object if valid, or `null` if invalid, expired, or already used.
     */
    async validateSecurityCode(entity: string, entityId: string, code: string, userId?: Number) {

        const date = moment().toISOString();

        //validate user if provided
        if (userId) {
            const user = await this.db.getFirst("SELECT id, email from security.users where id = $1", [userId])
            if (!user)
                throw new GraphQLError("SECURITYCODES", { extensions: { code: 'DB_NOEXISTS' } });
        }

        //Get the code to validate
        const resultCode = await this.db.getFirst(
            `
                SELECT 
                    id,
                    user_id,
                    entity,
                    entity_id
                FROM 
                    security.security_codes 
                WHERE 
                    entity = $1
                    AND entity_id = $2
                    ${userId ? `AND user_id = ${userId}` : ''}
                    AND code =  $3 
                    AND expired_date > $4
                    AND status = 0
                ORDER BY id DESC 
                LIMIT 1
            `,
            [entity, entityId, code, date])

        //If no code found, return null
        if (!resultCode?.id)
            return null


        //update code as used
        await this.db.execute("UPDATE security.security_codes SET status = 1, validated_at = $1 WHERE id = $2", [date, resultCode.id])

        //return code data
        return resultCode

    }

    /**
     * Map the requested GraphQL selection set to the database columns.
     * Uses `this.cols` as a dictionary to translate `camelCase` to `snake_case`.
     * If the field is not present in `this.cols`, it injects it directly.
     * 
     * @param selectionSetList List of fields requested in the GraphQL query
     * @returns Array with the formatted SQL select fields mapping (e.g. ['first_name as "firstName"'])
     */
    getFieldsValues(selectionSetList: string[]): string[] {
        let fields: string[] = []

        selectionSetList.forEach((item: string) => {
            if (this.cols && this.cols[item]) {
                fields.push(`${this.cols[item]} as "${item}"`)
            } else {
                fields.push(`${item} as "${item}"`)
            }
        })

        return fields
    }
}

export default ServiceBase