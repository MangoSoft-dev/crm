import { Authentication } from '../../services/Authentication';
import { Emails } from '../../integrations/emails';

const mockRegisterEmail = jest.fn().mockResolvedValue(true);

// Mock the Emails provider integration
jest.mock('../../integrations/emails', () => ({
    Emails: {
        getProvider: jest.fn(() => ({
            registerEmail: mockRegisterEmail
        }))
    }
}));

describe('AuthService - forceChangePassword', () => {
    let authService: Authentication;
    let mockDb: any;
    let mockIdentity: any;

    beforeEach(() => {
        mockDb = {
            query: jest.fn(),
            getFirst: jest.fn(),
            execute: jest.fn()
        };
        authService = new Authentication(mockDb);
        mockIdentity = { ip: '127.0.0.1' };
    });

    afterEach(() => {
        jest.clearAllMocks();
        mockRegisterEmail.mockClear();
    });

    it('should update password and send confirmation email when the Security Code is valid', async () => {
        // Arrange
        // Mock getFirst for validateSecurityCode
        mockDb.getFirst.mockResolvedValueOnce({
            id: 99,
            user_id: 1,
            entity: 'FORCE_CHANGE_PASSWORD',
            entity_id: 'some-key'
        });

        // Mock getFirst to get the user data
        mockDb.getFirst.mockResolvedValueOnce({
            id: 1,
            email: 'user@mangosoft.dev'
        });

        // Mock the update code logic where it checks off the code
        mockDb.execute.mockResolvedValueOnce({ rowCount: 1 });

        // Mock password update
        mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

        const args = { key: 'some-key', newPassword: 'SuperNewPassword!', code: '123456' };

        // Act
        const result = await authService.forceChangePassword(args);

        // Assert
        expect(mockDb.getFirst).toHaveBeenCalledTimes(2);

        // Security Code validation mark logic side effect
        expect(mockDb.execute).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE security.security_codes SET status = 1'),
            expect.any(Array)
        );

        // Status 1 and MD5 password
        expect(mockDb.query).toHaveBeenCalledWith(
            expect.stringContaining('status = 1'),
            ['SuperNewPassword!', 1] // It's mapped with md5 internally: md5($1) -> md5('SuperNewPassword!')
        );

        expect(result.code).toBe('ok');

        expect(mockRegisterEmail).toHaveBeenCalled();
    });

    it('should throw an invalid_credentials error if Security Code is not valid', async () => {
        // Arrange
        mockDb.getFirst.mockResolvedValueOnce(null); // Invalid code

        const args = { key: 'invalid', newPassword: '1', code: '0' };

        // Act & Assert
        await expect(authService.forceChangePassword(args)).rejects.toThrow('loginInvalidOtp');
    });
});
