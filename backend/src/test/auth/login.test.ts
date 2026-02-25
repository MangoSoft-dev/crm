import { Authentication } from '../../services/Authentication';
import md5 from 'md5';

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'mocked.jwt.token')
}));

describe('AuthService - login', () => {
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
    });

    it('should successfully login and return token credentials', async () => {
        // Arrange
        const passwordHash = md5('MySuperSecurePass');
        mockDb.getFirst.mockResolvedValueOnce({
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            password: passwordHash,
            login_attemps: 0,
            status: 1,
            validate_otp: 0
        });

        // The createCredentials method executes a query to update last activity
        mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

        const args = {
            username: 'testuser',
            password: 'MySuperSecurePass'
        };

        // Act
        const result = await authService.login(args, mockIdentity);

        // Assert
        expect(mockDb.getFirst).toHaveBeenCalledWith(
            expect.stringContaining('username = $1 or email = $2'),
            ['testuser', 'testuser']
        );

        // createCredentials is called and updates the user
        expect(mockDb.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE'),
            expect.arrayContaining([expect.any(String), '127.0.0.1', expect.any(String), 1])
        );

        expect(result).toHaveProperty('token', 'mocked.jwt.token');
        expect(result).toHaveProperty('refreshToken', 'mocked.jwt.token');
        expect(result.id).toBe(1);
    });

    it('should throw GraphQLError for invalid user or password', async () => {
        // Arrange
        mockDb.getFirst.mockResolvedValueOnce(null);

        const args = { username: 'nounser', password: 'wrong' };

        // Act & Assert
        await expect(authService.login(args, mockIdentity)).rejects.toThrow('loginInvalid');
    });

    it('should throw GraphQLError when user is found but password does not match', async () => {
        // Arrange
        mockDb.getFirst.mockResolvedValueOnce({
            id: 1,
            password: md5('correctPass'),
            login_attemps: 0,
            status: 1
        });

        const args = { username: 'testuser', password: 'wrongPass' };

        await expect(authService.login(args, mockIdentity)).rejects.toThrow('loginInvalid');
    });

    it('should block login if user status is not 1 (and not -98)', async () => {
        // Arrange
        mockDb.getFirst.mockResolvedValueOnce({
            id: 1,
            password: md5('correctPass'),
            login_attemps: 0,
            status: 0 // Inactive
        });

        const args = { username: 'testuser', password: 'correctPass' };

        await expect(authService.login(args, mockIdentity)).rejects.toThrow('loginInvalid');
    });
});
