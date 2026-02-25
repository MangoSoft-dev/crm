import User from '../../services/User';

describe('UserService - resendInvitation', () => {
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

    it('should generate a new password, hash it with md5, and update the user row', async () => {
        // Arrange
        // Check finding the user query
        mockDb.query.mockResolvedValueOnce({
            rows: [{ id: 5, email: 'test@example.com', username: 'testuser' }]
        });

        // Update query
        mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

        const args = { id: '5' };

        // Act
        const result = await userService.resendInvitation(args, mockIdentity);

        // Assert
        expect(mockDb.query).toHaveBeenCalledTimes(2);

        // Assert checking query is isolated by account_id and deleted=0
        expect(mockDb.query).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining('id = $1 AND deleted = 0 AND account_id = $2'),
            ['5', 1]
        );

        // Assert update query holds a generated md5 hash length (32 chars)
        expect(mockDb.query).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('UPDATE "security".users'),
            [
                expect.stringMatching(/^[a-f0-9]{32}$/), // md5 hash
                100, // updated_by
                '5'  // user id
            ]
        );

        expect(result).toBe(true);
    });

    it('should throw an error if the user is not found', async () => {
        // Arrange
        mockDb.query.mockResolvedValueOnce({ rows: [] });

        const args = { id: '999' };

        // Act & Assert
        await expect(
            userService.resendInvitation(args, mockIdentity)
        ).rejects.toThrow('User not found');

        // Should not have reached the UPDATE line
        expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
});
