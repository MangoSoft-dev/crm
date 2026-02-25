
import moment from "moment";
import { db } from '../../core/database';
import { console } from "../../core/security/logger";

export class EmailProviderBase {


    constructor() {
    }

    async sendEmail(from: string, to: string | string[], subject: string, body: string, cc?: string | string[]): Promise<string> {
        throw 'function not implemented yet'
    }

    async registerEmail(userId: Number, entity: string, entityId: string, to: string, subject: string, body: string, accountId?: Number, cc?: string) {
        const date = moment().toISOString();
        console.log("EMAIL", "emails/base/registerEmail", "registerEmail", { userId, entity, entityId, to, subject, body })

        let values = {
            from: 'info@genesis.info',
            account_id: accountId,
            entity: entity,
            entity_id: entityId,
            to: to,
            cc: cc,
            body: body,
            subject: subject,
            status: 0,
            created_by: userId,
            created_at: date
        }

        const setValues = db.getSetValues(values)

        await db.execute(`
            INSERT INTO security.emails (${setValues.columns})
            VALUES (${setValues.placeholders})
        `, setValues.queryValues)
    }

}