import ServiceBase, { console } from "./ServiceBase";

export class Account extends ServiceBase {

    key = "Account";
    route = "services/Account";

    cols: any = {
        code: 'code',
        name: 'name',
        status: 'status',
        logoUrl: `(SELECT url FROM security.files WHERE entity = 'AccountLogo' AND entity_id = cast(id as varchar) AND deleted = 0 LIMIT 1)`
    };

    /**
     * Retrieves an account securely by its ID.
     * This is an internal Service utility method and is not exposed directly via GraphQL.
     * 
     * @param id - The unique ID of the account to retrieve.
     * @returns A promise resolving to the account object if found and active (not deleted), otherwise throws an error mapping.
     */
    public async getAccountById(id: string | number) {
        console.log(this.key, this.route, "getAccountById", { id });
        try {
            // Re-using the getFieldsValues functionality but manually mapped for an internal signature
            const selectionSetList = Object.keys(this.cols);
            const fields = this.getFieldsValues(selectionSetList).join(', ');

            const query = `SELECT ${fields} FROM "security".accounts WHERE id = $1 AND deleted = 0`;
            const result = await this.db.getFirst(query, [id]);

            return result;
        } catch (error) {
            console.error(this.key, this.route, error);
            throw error;
        }
    }
}
