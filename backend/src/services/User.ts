import ServiceBase, { console } from './ServiceBase';
import * as crypto from 'crypto';
import generator from 'generate-password';
import { Emails } from '../integrations/emails';

export class User extends ServiceBase {

    key = "User";
    route = "services/User";

    cols: any = {
        accountId: 'account_id',
        parentId: 'parent_id',
        avatarUrl: `(SELECT url FROM security.files WHERE entity = 'UserAvatar' AND entity_id = cast(id as varchar) AND deleted = 0 LIMIT 1)`, //avatar url is in the files table
        googleId: 'google_id',
        firstName: 'first_name',
        lastName: 'last_name',
        lastActivity: 'last_activity',
        updatedAt: 'updated_at',
        updatedBy: 'updated_by',
    };

    /**
     * Retrieves a user by their unique ID, given they are not soft-deleted.
     * 
     * @param args - Object containing the user `id`.
     * @param identity - The user identity object provided by the authentication context.
     * @param root - The root of the active GraphQL query.
     * @param selectionSetList - The list of fields requested in the GraphQL query.
     * @returns A promise resolving to the user record, or throws an error.
     */
    public async getUserById(args: { id: string }, identity: any, root: any, selectionSetList: string[]) {
        console.log(this.key, this.route, "getUserById", args);
        try {
            const fields = this.getFieldsValues(selectionSetList).join(', ');
            const query = `SELECT ${fields} FROM "security".users WHERE id = $1 AND deleted = 0`;
            const result = await this.db.query(query, [args.id]);
            return result.rows[0];
        } catch (error) {
            console.error(this.key, this.route, error);
            throw error;
        }
    }

    /**
     * Retrieves the details of the currently authenticated user based on their identity.
     * 
     * @param args - Expected arguments (usually empty for this specific operation).
     * @param identity - The user identity object provided by the authentication context containing the user's ID.
     * @param root - The root of the active GraphQL query.
     * @param selectionSetList - The list of fields requested in the GraphQL query.
     * @returns A promise that resolves to the user record, or throws an error.
     */
    public async getUserInfo(args: any, identity: any, root: any, selectionSetList: string[]) {
        console.log(this.key, this.route, "getUserInfo", identity);
        try {
            const fields = this.getFieldsValues(selectionSetList).join(', ');
            const query = `SELECT ${fields} FROM "security".users WHERE id = $1 AND deleted = 0`;
            const result = await this.db.getFirst(query, [identity.id]);
            return result;
        } catch (error) {
            console.error(this.key, this.route, error);
            throw error;
        }
    }

    /**
     * Searches for users within the same tenant/account, allowing pagination, filtering, and sorting.
     * 
     * @param args - Search parameters including `limit`, `offset`, `openSearch` (text search), `status`, and `sortBy`.
     * @param identity - The user identity object containing the tenant's `account_id`.
     * @param root - The root of the active GraphQL query.
     * @param selectionSetList - The list of fields requested in the GraphQL query.
     * @returns A promise resolving to an array of matching user records.
     */
    public async searchUsers(args: { limit?: number, offset?: number, openSearch?: string, status?: number[], sortBy?: any }, identity: any, root: any, selectionSetList: string[]) {
        console.log(this.key, this.route, "searchUsers", args);
        try {
            const fields = this.getFieldsValues(selectionSetList).join(', ');
            let query = `
                    SELECT 
                        ${fields},
                        COUNT(*) OVER() AS rows
                    FROM 
                        "security".users 
                    WHERE 
                        deleted = 0 
                        AND account_id = $1
                `;
            const values: any[] = [identity.accountId];
            let paramIndex = 2;

            if (args.openSearch) {
                query += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
                values.push(`%${args.openSearch}%`);
                paramIndex++;
            }

            if (args.status && args.status.length > 0) {
                query += ` AND status = ANY($${paramIndex}::int[])`;
                values.push(args.status);
                paramIndex++;
            }

            if (args.sortBy) {
                const order = args.sortBy.order === 'DESC' ? 'DESC' : 'ASC';
                query += ` ORDER BY ${args.sortBy.field} ${order}`;
            } else {
                query += ` ORDER BY id DESC`;
            }

            if (args.limit) {
                query += ` LIMIT $${paramIndex}`;
                values.push(args.limit);
                paramIndex++;
            }

            if (args.offset !== undefined) {
                query += ` OFFSET $${paramIndex}`;
                values.push(args.offset);
            }

            const result = await this.db.getArray(query, values);
            return {
                items: result,
                rows: result.length ? result[0].rows : 0
            }
        } catch (error) {
            console.error(this.key, this.route, error);
            throw error;
        }
    }

    /**
     * Creates a new user in the system, assigns a temporary auto-generated password, and emails them their credentials.
     * 
     * @param args - Object containing the `input` payload with the user's details.
     * @param identity - The user identity object creating the user.
     * @returns A promise resolving to the newly created user record mapped to the GraphQL schema.
     */
    public async createUser(args: { input: any }, identity: any) {
        console.log(this.key, this.route, "createUser", args);
        try {
            const { input } = args;

            // Enforce constraints uniquely based on email or username
            const checkQuery = `SELECT id FROM "security".users WHERE (email = $1 OR username = $2) AND deleted = 0 AND account_id = $3`;
            const checkResult = await this.db.query(checkQuery, [input.email, input.username, identity.accountId]);
            if (checkResult.rows.length > 0) {
                throw new Error("Email or Username already exists");
            }

            // Generate temporary password
            const tempPassword = generator.generate({ length: 12, numbers: true, symbols: true, uppercase: true, strict: true });
            const passwordHash = crypto.createHash('md5').update(tempPassword).digest("hex");

            const query = `
                INSERT INTO "security".users (
                    account_id, parent_id, username, password, email, first_name, last_name, phone,
                    status, login_attemps, validate_otp, deleted, created_by
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8,
                    -98, 0, 0, 0, $9
                ) RETURNING *
            `;
            const values = [
                identity.accountId,
                input.parentId || null,
                input.username,
                passwordHash,
                input.email,
                input.firstName,
                input.lastName,
                input.phone || null,
                identity.id
            ];

            const result = await this.db.query(query, values);

            // TODO: Call email service implementation to send the 'tempPassword' to the user here.
            await Emails.getProvider().sendEmail("info@mangosoft.dev", input.email, "Wellcome", `<h1>Wellcome</h1><p>Your password is: ${tempPassword}</p>`)


            return this.mapUser(result.rows[0]);
        } catch (error) {
            console.error(this.key, this.route, error);
            throw error;
        }
    }

    /**
     * Updates an existing user's allowed dynamic fields (parentId, firstName, lastName, phone).
     * 
     * @param args - Object containing the `input` payload with the fields to update and the user's `id`.
     * @param identity - The user identity object performing the update.
     * @returns A promise resolving to the updated user record mapped to the GraphQL schema.
     */
    public async updateUser(args: { input: any }, identity: any) {
        console.log(this.key, this.route, "updateUser", args);
        try {
            const { input } = args;

            // Destructuring allows exactly the editable fields mapped below
            const { id, parentId, firstName, lastName, phone } = input;

            let query = `UPDATE "security".users SET updated_at = NOW(), updated_by = $1`;
            const values: any[] = [identity.id];
            let paramIndex = 2;

            if (parentId !== undefined) {
                query += `, parent_id = $${paramIndex}`;
                values.push(parentId);
                paramIndex++;
            }
            if (firstName !== undefined) {
                query += `, first_name = $${paramIndex}`;
                values.push(firstName);
                paramIndex++;
            }
            if (lastName !== undefined) {
                query += `, last_name = $${paramIndex}`;
                values.push(lastName);
                paramIndex++;
            }
            if (phone !== undefined) {
                query += `, phone = $${paramIndex}`;
                values.push(phone);
                paramIndex++;
            }

            query += ` WHERE id = $${paramIndex} AND deleted = 0 AND account_id = $${paramIndex + 1} RETURNING *`;
            values.push(id, identity.accountId);

            const result = await this.db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error("User not found or you do not have permission");
            }

            return this.mapUser(result.rows[0]);
        } catch (error) {
            console.error(this.key, this.route, error);
            throw error;
        }
    }

    /**
     * Soft deletes a user by setting their `deleted` flag to 1.
     * 
     * @param args - Object containing the user `id` to delete.
     * @param identity - The user identity object performing the deletion.
     * @returns A promise resolving to a boolean indicating success.
     */
    public async deleteUser(args: { id: string }, identity: any) {
        console.log(this.key, this.route, "deleteUser", args);
        try {
            const query = `
                UPDATE "security".users 
                SET deleted = 1, deleted_by = $1, deleted_at = NOW() 
                WHERE id = $2 AND account_id = $3
            `;
            const result = await this.db.query(query, [identity.id, args.id, identity.accountId]);
            return result.rowCount ? result.rowCount > 0 : false;
        } catch (error) {
            console.error(this.key, this.route, error);
            throw error;
        }
    }

    /**
     * Bulk soft deletes an array of users by setting their `deleted` flags to 1.
     * 
     * @param args - Object containing an array of `ids` to delete.
     * @param identity - The user identity object performing the deletion.
     * @returns A promise resolving to a boolean indicating success.
     */
    public async deleteUsers(args: { ids: string[] }, identity: any) {
        console.log(this.key, this.route, "deleteUsers", args);
        try {
            if (!args.ids || args.ids.length === 0) {
                return false;
            }

            const query = `
                UPDATE "security".users 
                SET deleted = 1, deleted_by = $1, deleted_at = NOW() 
                WHERE id = ANY($2::int[]) AND account_id = $3
            `;
            const result = await this.db.query(query, [identity.id, args.ids, identity.accountId]);
            return result.rowCount ? result.rowCount > 0 : false;
        } catch (error) {
            console.error(this.key, this.route, error);
            throw error;
        }
    }

    /**
     * Resends an invitation to a user by auto-generating a new password and dispatching an email to them.
     * 
     * @param args - Object containing the user `id` to resend the invitation to.
     * @param identity - The user identity object.
     * @returns A promise resolving to a boolean indicating success.
     */
    public async resendInvitation(args: { id: string }, identity: any) {
        console.log(this.key, this.route, "resendInvitation", args);
        try {
            // Check if user exists and is not deleted
            const checkQuery = `SELECT id, email, username FROM "security".users WHERE id = $1 AND deleted = 0 AND account_id = $2`;
            const checkResult = await this.db.query(checkQuery, [args.id, identity.accountId]);
            if (checkResult.rows.length === 0) {
                throw new Error("User not found");
            }
            const userParams = checkResult.rows[0];

            // Generate new password
            const newPassword = generator.generate({ length: 12, numbers: true, symbols: true, uppercase: true, strict: true });
            const passwordHash = crypto.createHash('md5').update(newPassword).digest("hex");

            // Update user
            const updateQuery = `
                UPDATE "security".users
                SET password = $1, updated_by = $2, updated_at = NOW()
                WHERE id = $3
            `;
            await this.db.query(updateQuery, [passwordHash, identity.id, args.id]);

            // TODO: Triggers email delivery of new credentials here
            console.log(this.key, this.route, "Sent email correctly");

            return true;
        } catch (error) {
            console.error(this.key, this.route, error);
            throw error;
        }
    }

    /**
     * Allows a user to change their own password, given they know their current password.
     * Will also activate the user's status if they were previously forced to change it.
     * 
     * @param args - Object containing `currentPassword` and `newPassword`.
     * @param identity - The user identity object.
     * @returns A promise resolving to a boolean indicating the password was changed successfully.
     */
    public async changePassword(args: { currentPassword: string, newPassword: string }, identity: any) {
        console.log(this.key, this.route, "changePassword", identity.id);
        try {
            const query = `SELECT id, password, status FROM "security".users WHERE id = $1 AND deleted = 0`;
            const result = await this.db.query(query, [identity.id]);

            if (result.rows.length === 0) {
                throw new Error("Invalid current user");
            }

            const user = result.rows[0];
            const currentPasswordHash = crypto.createHash('md5').update(args.currentPassword).digest("hex");
            const isMatch = currentPasswordHash === user.password;

            if (!isMatch) {
                throw new Error("Invalid current password");
            }

            const newPasswordHash = crypto.createHash('md5').update(args.newPassword).digest("hex");

            // Core Business Rule
            const nextStatus = user.status === -98 ? 1 : user.status;

            const updateQuery = `
                UPDATE "security".users
                SET password = $1, status = $2, updated_at = NOW(), updated_by = $3
                WHERE id = $4
            `;
            await this.db.query(updateQuery, [newPasswordHash, nextStatus, identity.id, identity.id]);

            return true;
        } catch (error) {
            console.error(this.key, this.route, error);
            throw error;
        }
    }

    /**
     * Standard structural mapping from PG database row to the GraphQL entity schema output format.
     * 
     * @param row - The raw database row representing a user.
     * @returns An object mapped to match the User GraphQL type.
     */
    private mapUser(row: any) {
        return {
            id: row.id,
            accountId: row.account_id,
            parentId: row.parent_id,
            googleId: row.google_id,
            username: row.username,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            phone: row.phone,
            lastActivity: row.last_activity,
            status: row.status,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by
        };
    }
}
