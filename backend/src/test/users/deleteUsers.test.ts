import User from '../../services/User';

describe('UserService - deleteUsers', () => {
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

    it('should bulk soft delete given array of ids and return true', async () => {
        // Arrange
        mockDb.query.mockResolvedValueOnce({ rowCount: 3 });
        const args = { ids: ['10', '11', '12'] };

        // Act
        const result = await userService.deleteUsers(args, mockIdentity);

        // Assert
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            expect.stringContaining('WHERE id = ANY($2::int[]) AND account_id = $3'),
            [
                100, // deleted_by
                ['10', '11', '12'], // array of ids
                1 // account_id
            ]
        );
        expect(result).toBe(true);
    });

    it('should return false early if ids array is empty or undefined', async () => {
        expect(await userService.deleteUsers({ ids: [] }, mockIdentity)).toBe(false);
        // @ts-ignore
        expect(await userService.deleteUsers({}, mockIdentity)).toBe(false);
        expect(mockDb.query).not.toHaveBeenCalled();
    });
});
