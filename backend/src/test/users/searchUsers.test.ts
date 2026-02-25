import User from '../../services/User';

describe('UserService - searchUsers', () => {
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

    it('should query and return a list of users mapped by selectionSetList', async () => {
        // Arrange
        mockDb.query.mockResolvedValueOnce({ rows: [{ id: 1, first_name: 'John' }, { id: 2, first_name: 'Jane' }] });
        const selectionSetList = ['id', 'firstName'];
        const args = { limit: 10, offset: 0 };

        // Act
        const result = await userService.searchUsers(args, mockIdentity, null, selectionSetList);

        // Assert
        expect(mockDb.query).toHaveBeenCalledWith(
            expect.stringContaining('LIMIT $2 OFFSET $3'),
            [1, 10, 0]
        );
        expect(result.length).toBe(2);
        expect(result[0].first_name).toBe('John');
    });

    it('should apply openSearch conditions correctly', async () => {
        // Arrange
        mockDb.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'john@example.com' }] });
        const selectionSetList = ['id', 'email'];
        const args = { openSearch: 'john' };

        // Act
        await userService.searchUsers(args, mockIdentity, null, selectionSetList);

        // Assert
        expect(mockDb.query).toHaveBeenCalledWith(
            expect.stringContaining('username ILIKE $2 OR email ILIKE $2'),
            [1, '%john%']
        );
    });

    it('should throw an error on db fault', async () => {
        mockDb.query.mockRejectedValueOnce(new Error('Connection fault'));
        const args = {};

        await expect(
            userService.searchUsers(args, mockIdentity, null, [])
        ).rejects.toThrow('Connection fault');
    });
});
