import User from '../../services/User';

describe('UserService - createUser', () => {
    let userService: User;
    let mockDb: any;
    let mockIdentity: any;

    beforeEach(() => {
        mockDb = {
            query: jest.fn(),
            getFirst: jest.fn(),
            execute: jest.fn()
        };
        userService = new User(mockDb);
        mockIdentity = { id: 100, account_id: 1 };
    });

    it('should create a user, hash a generated password, and return mapped inserted user', async () => {
        // Arrange
        // First query checks if exists (returns 0 rows for success)
        mockDb.query.mockResolvedValueOnce({ rows: [] });

        // Second query does the insertion and returns the inserted row
        mockDb.query.mockResolvedValueOnce({
            rows: [{
                id: 5,
                account_id: 1,
                username: 'newuser',
                email: 'test@example.com',
                status: -98,
                created_by: 100
            }]
        });

        const args = {
            input: {
                username: 'newuser',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
            }
        };

        // Act
        const result = await userService.createUser(args, mockIdentity);

        // Assert
        expect(mockDb.query).toHaveBeenCalledTimes(2);

        // Check if the unique constraint validation fired
        expect(mockDb.query).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining('email = $1 OR username = $2'),
            ['test@example.com', 'newuser', 1]
        );

        // Check insertion
        expect(mockDb.query).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('INSERT INTO "security".users'),
            expect.arrayContaining([
                1,                  // account_id (from identity)
                null,               // parentId
                'newuser',          // username
                expect.any(String), // passwordHash
                'test@example.com', // email
                'Test',             // firstName
                'User',             // lastName
                null,               // phone
                100                 // created_by (from identity)
            ])
        );

        expect(result.id).toBe(5);
        expect(result.status).toBe(-98);
    });

    it('should throw Error if username or email already exists', async () => {
        // Arrange: Mock DB finding an existing user
        mockDb.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

        const args = {
            input: {
                username: 'existinguser',
                email: 'exists@example.com',
                firstName: 'Test',
                lastName: 'User',
            }
        };

        // Act & Assert
        await expect(
            userService.createUser(args, mockIdentity)
        ).rejects.toThrow('Email or Username already exists');

        expect(mockDb.query).toHaveBeenCalledTimes(1); // Only checked, didn't insert
    });
});
