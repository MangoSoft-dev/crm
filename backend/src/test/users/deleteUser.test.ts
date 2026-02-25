import User from '../../services/User';

describe('UserService - deleteUser', () => {
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

    it('should soft delete user and return true if affected rows > 0', async () => {
        // Arrange
        mockDb.query.mockResolvedValueOnce({ rowCount: 1 });
        const args = { id: '10' };

        // Act
        const result = await userService.deleteUser(args, mockIdentity);

        // Assert
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE "security".users'),
            [100, '10', 1] // deleted_by, id, account_id
        );
        expect(mockDb.query).toHaveBeenCalledWith(
            expect.stringContaining('SET deleted = 1'),
            expect.any(Array)
        );
        expect(result).toBe(true);
    });

    it('should return false if row to be deleted was not found', async () => {
        // Arrange
        mockDb.query.mockResolvedValueOnce({ rowCount: 0 });

        // Act
        const result = await userService.deleteUser({ id: '999' }, mockIdentity);

        expect(result).toBe(false);
    });
});
