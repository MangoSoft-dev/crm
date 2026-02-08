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

    constructor(db: Database) {
        this.db = db
    }

    /**
     * Method to create a security code
     * @param userId user linked to the code
     * @param entity entity related to the code or module
     * @param entityId id related to the entity
     * @param customtime live on minutes
     * @returns 
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
     * Validate a security code
     * @param entity entity related to the code or module
     * @param entityId id related to the entity
     * @param code code to validate
     * @param userId user linked to the code
     * @returns 
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
}

export default ServiceBase