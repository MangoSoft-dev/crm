import User from '../../services/User';

describe('UserService - getUserById', () => {
    let userService: User;
    let mockDb: any;
    let mockIdentity: any;

    beforeEach(() => {
        // Mock de la base de datos (Database)
        mockDb = {
            query: jest.fn(),
            getFirst: jest.fn(),
            execute: jest.fn()
        };
        userService = new User(mockDb);

        // Inyección de dependencia simulada sobre la clase padre
        userService.db = mockDb;

        mockIdentity = { id: 100, account_id: 1 };
    });

    it('should return a user object when found using proper columns mapping', async () => {
        // Setup del mock emulando el retorno desde pg-node
        mockDb.query.mockResolvedValueOnce({ rows: [{ id: 1, first_name: 'John', account_id: 1 }] });

        // Simula variables de Request
        const selectionSetList = ['id', 'firstName'];

        // Ejecución
        const result = await userService.getUserById({ id: '1' }, mockIdentity, null, selectionSetList);

        // Verificación: validamos que el query haya extraído correctamente las columnas de la BD empleando getFieldsValues()
        expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('first_name as "firstName"'), ['1']);
        expect(result).toHaveProperty('id', 1);
        expect(result).toHaveProperty('first_name', 'John');
    });

    it('should throw an error when database fault occurs', async () => {
        mockDb.query.mockRejectedValueOnce(new Error('Connection fault'));

        await expect(
            userService.getUserById({ id: '1' }, mockIdentity, null, [])
        ).rejects.toThrow('Connection fault');
    });

    it('should return undefined or null if the user does not exist', async () => {
        // Setup database yielding 0 rows
        mockDb.query.mockResolvedValueOnce({ rows: [] });

        const result = await userService.getUserById({ id: '999' }, mockIdentity, null, ['id']);

        // Since result.rows is empty, it should return undefined instead of throwing
        expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), ['999']);
        expect(result).toBeUndefined();
    });
});
