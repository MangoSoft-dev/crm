import { Account } from '../../services/Account';

describe('Account Service - getAccountById', () => {
    let accountService: Account;
    let mockDb: any;

    beforeEach(() => {
        // 1. Mock native functions of the abstract DB
        mockDb = {
            query: jest.fn(),
            getFirst: jest.fn(),
            execute: jest.fn(),
            getArray: jest.fn()
        };

        // 2. Inject dependency
        accountService = new Account(mockDb);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully build the query using cols dictionary and return the database row', async () => {
        // Arrange
        const mockRow = {
            code: 'MNG',
            name: 'MangoSoft',
            status: 1,
            logoUrl: 'https://example.com/logo.png'
        };

        mockDb.getFirst.mockResolvedValueOnce(mockRow);

        const accountIdToLookup = 10;

        // Act
        const result = await accountService.getAccountById(accountIdToLookup);

        // Assert
        expect(mockDb.getFirst).toHaveBeenCalledTimes(1);

        // Validating that the cols map to Postgres fields/subqueries correctly
        expect(mockDb.getFirst).toHaveBeenCalledWith(
            expect.stringContaining('SELECT code as "code", name as "name", status as "status", (SELECT url FROM security.files WHERE entity = \'AccountLogo\' AND entity_id = cast(id as varchar) AND deleted = 0 LIMIT 1) as "logoUrl" FROM "security".accounts WHERE id = $1 AND deleted = 0'),
            [accountIdToLookup]
        );

        // Validating return object matches standard mapping
        expect(result).toEqual(mockRow);
    });

    it('should throw an error if the database query fails', async () => {
        // Arrange
        const errorMessage = 'Database Connection Error';
        mockDb.getFirst.mockRejectedValueOnce(new Error(errorMessage));

        // Act & Assert
        await expect(accountService.getAccountById(5)).rejects.toThrow(errorMessage);
        expect(mockDb.getFirst).toHaveBeenCalledTimes(1);
    });
});
