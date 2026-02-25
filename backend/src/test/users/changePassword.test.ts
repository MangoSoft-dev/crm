import User from '../../services/User';
import * as crypto from 'crypto';

describe('UserService - changePassword', () => {
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

    it('should change the password successfully when current password matches, updating status from -98 to 1', async () => {
        // Arrange
        const currentPasswordStr = 'MyOldPass123!';
        const expectedOldHash = crypto.createHash('md5').update(currentPasswordStr).digest("hex");

        mockDb.query.mockResolvedValueOnce({
            rows: [{ id: 100, password: expectedOldHash, status: -98 }]
        });
        mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

        const args = {
            currentPassword: currentPasswordStr,
            newPassword: 'MyNewPass456!'
        };

        // Act
        const result = await userService.changePassword(args, mockIdentity);

        // Assert
        expect(mockDb.query).toHaveBeenCalledTimes(2);

        // Query 1: Find user
        expect(mockDb.query).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining('id = $1 AND deleted = 0'),
            [100] // identity.id
        );

        // Query 2: Update password and status
        expect(mockDb.query).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('SET password = $1, status = $2'),
            [
                expect.stringMatching(/^[a-f0-9]{32}$/), // md5 hash of newPass
                1,   // The new status because it was -98
                100, // updated_by
                100  // target id
            ]
        );

        expect(result).toBe(true);
    });

    it('should throw an error if the current password does not match', async () => {
        // Arrange
        const wrongHash = crypto.createHash('md5').update('WrongPass!').digest("hex");
        mockDb.query.mockResolvedValueOnce({
            rows: [{ id: 100, password: wrongHash, status: 1 }]
        });

        const args = {
            currentPassword: 'MyOldPass123!',
            newPassword: 'MyNewPass456!'
        };

        // Act & Assert
        await expect(
            userService.changePassword(args, mockIdentity)
        ).rejects.toThrow('Invalid current password');

        expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the user is invalid or not found', async () => {
        mockDb.query.mockResolvedValueOnce({ rows: [] });

        await expect(
            userService.changePassword({ currentPassword: '1', newPassword: '2' }, mockIdentity)
        ).rejects.toThrow('Invalid current user');
    });
});
