import * as dotenv from 'dotenv';
dotenv.config();

import { Authentication } from '../../services';
import { db, Database } from '../../core/database';

/**
 * Utility script to perform a real login against the development database
 * and print out the token credentials for manual testing purposes.
 * 
 * Run this test using: npx jest src/test/auth/loginCredentials.test.ts
 */
describe('AuthService - loginCredentials (Utility)', () => {
    let authService: Authentication;

    beforeAll(() => {
        // Initialize the real database connection
        authService = new Authentication(db);
    });

    afterAll(async () => {
        // Close DB pool to allow Jest to exit cleanly
        await db.close();
    });

    it('should generate a real login token for ronalcamilo@gmail.com', async () => {
        const username = 'ronalcamilo@gmail.com';
        const password = 'Karen123';

        const args = { username, password };
        const identity = { ip: '127.0.0.1' };

        console.log('--- STARTING LOGIN REQUEST ---');
        console.log(`Attempting login for: ${args.username} `);

        try {
            const credentials = await authService.login(args, identity);

            console.log('\n======================================================');
            console.log('✅ LOGIN SUCCESSFUL');
            console.log('======================================================');
            console.log(`USER ID: ${credentials.id} `);
            console.log(`\n🔑 ACCESS TOKEN: \n${credentials.token} `);
            console.log(`\n🔄 REFRESH TOKEN: \n${credentials.refreshToken} `);
            console.log('======================================================\n');

            expect(credentials).toHaveProperty('token');
            expect(credentials).toHaveProperty('refreshToken');
        } catch (error: any) {
            console.error('\n❌ LOGIN FAILED');
            console.error(error.message || error);
            if (error.extensions) {
                console.error('Extensions:', error.extensions);
            }
            throw error; // Fail the test explicitly
        }
    });
});
