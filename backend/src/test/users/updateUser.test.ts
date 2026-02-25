import User from '../../services/User';

describe('UserService - updateUser', () => {
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

    it('should dynamically allocate the updated values and return updated user row', async () => {
        // Arrange
        mockDb.query.mockResolvedValueOnce({
            rows: [{ id: 5, first_name: 'UpdatedName', phone: '123456789' }]
        });

        // Only sending firstName and phone (should ignore others like email/username/etc)
        const args = {
            input: {
                id: 5,
                firstName: 'UpdatedName',
                phone: '123456789'
            }
        };

        // Act
        const result = await userService.updateUser(args, mockIdentity);

        // Assert
        expect(mockDb.query).toHaveBeenCalledTimes(1);

        // Assert dynamic UPDATE query mapping correctly using placeholders
        expect(mockDb.query).toHaveBeenCalledWith(
            expect.stringContaining('first_name = $2, phone = $3'),
            [
                100,            // updated_by (identity.id) - $1
                'UpdatedName',  // firstName - $2
                '123456789',    // phone - $3
                5,              // id to filter - $4
                1               // account_id (identity.account_id) - $5
            ]
        );

        expect(result.firstName).toBe('UpdatedName');
    });

    it('should throw Error if zero rows were affected (User not found or no permission)', async () => {
        // Arrange: DB update returns zero rows
        mockDb.query.mockResolvedValueOnce({ rows: [] });

        const args = {
            input: {
                id: 99,
                lastName: 'Ghost'
            }
        };

        // Act & Assert
        await expect(
            userService.updateUser(args, mockIdentity)
        ).rejects.toThrow('User not found or you do not have permission');
    });
});
