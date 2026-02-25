import User from '../../services/User';

describe('UserService - getUserInfo', () => {
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
        userService = new User(mockDb as any);

        // Inyección de dependencia simulada sobre la clase padre
        userService.db = mockDb;

        mockIdentity = { id: 100, account_id: 1 };
    });

    it('should return the current user object when found using proper columns mapping', async () => {
        // Setup del mock emulando el retorno desde pg-node
        mockDb.query.mockResolvedValueOnce({ rows: [{ id: 100, first_name: 'Jane', account_id: 1 }] });

        // Simula variables de Request
        const selectionSetList = ['id', 'firstName'];

        // Ejecución
        const result = await userService.getUserInfo({}, mockIdentity, null, selectionSetList);

        // Verificación: validamos que el query haya extraído correctamente las columnas de la BD empleando getFieldsValues()
        // getFieldsValues no está fully mockeado aquí, la implementación real de baseService armará los campos, 
        // pero validamos que busque por el ID del token de identidad en lugar de args.id
        expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('first_name as "firstName"'), [100]);
        expect(result).toHaveProperty('id', 100);
        expect(result).toHaveProperty('first_name', 'Jane');
    });

    it('should throw an error when database fault occurs', async () => {
        mockDb.query.mockRejectedValueOnce(new Error('Connection fault'));

        await expect(
            userService.getUserInfo({}, mockIdentity, null, [])
        ).rejects.toThrow('Connection fault');
    });

    it('should return undefined or null if the user does not exist (or deleted)', async () => {
        // Setup database yielding 0 rows
        mockDb.query.mockResolvedValueOnce({ rows: [] });

        const result = await userService.getUserInfo({}, mockIdentity, null, ['id']);

        // Al retornar array vacío en rows, devolverá undefinied el rows[0]
        expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), [100]);
        expect(result).toBeUndefined();
    });
});
