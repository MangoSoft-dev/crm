import { Authentication } from '../../services/Authentication';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('AuthService - refreshToken', () => {
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

    it('should decode successfully, grab user data from DB and generate new credentials', async () => {
        // Arrange
        // Setup payload mapping
        (jwt.verify as jest.Mock).mockReturnValueOnce({ id: 5 });
        (jwt.sign as jest.Mock).mockReturnValue('new.jwt.token'); // We will use this in createCredentials

        // Simulate reading from the database
        mockDb.getFirst.mockResolvedValueOnce({
            id: 5,
            username: 'jwtman',
            email: 'jwt@mangosoft.dev',
            password: 'pwd',
            login_attemps: 0,
            status: 1
        });

        // Mock DB interaction in createCredentials
        mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

        const args = { token: 'old.jwt.token' };

        // Act
        const result = await authService.refreshToken(args, mockIdentity);

        // Assert
        expect(jwt.verify).toHaveBeenCalledWith('old.jwt.token', expect.any(String));

        expect(mockDb.getFirst).toHaveBeenCalledWith(
            expect.stringContaining('id= $1'),
            [5]
        );

        expect(result).toHaveProperty('token', 'new.jwt.token');
        expect(result).toHaveProperty('refreshToken', 'new.jwt.token');
    });

    it('should throw error generic exception when JWT decoding fails', async () => {
        // Arrange
        (jwt.verify as jest.Mock).mockImplementationOnce(() => {
            throw new Error('Expired Token');
        });

        const args = { token: 'invalid' };

        // Act & Assert
        await expect(authService.refreshToken(args, mockIdentity)).rejects.toMatch('Invalid credentials');
    });

    it('should throw invalid error if DB user does not exist', async () => {
        // Arrange
        (jwt.verify as jest.Mock).mockReturnValueOnce({ id: 555 });
        mockDb.getFirst.mockResolvedValueOnce(null);

        const args = { token: 'good' };

        // Act & Assert
        await expect(authService.refreshToken(args, mockIdentity)).rejects.toMatch('Invalid credentials');
    });
});
