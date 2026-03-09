# Testing Guidelines for Services (Backend) - AI Guidelines

If you are an AI Model working on writing test flows for this project, follow these steps:

This project uses **Jest** and **ts-jest** to run unit tests focused on Business Logic and SQL construction residing within classes in the `src/services` folder.

## 1. Folder Structure

Unlike placing tests adjacent to the source file, we use an *external integration folder* architecture to facilitate individual execution and debugging of method contexts.

All tests must be placed inside `src/test/`. They should be grouped by the entity or module name in lowercase, and split every unit scenario by exported function name:

```text
src/
  services/
    User.ts
  test/
    users/
      getUserById.test.ts
      createUser.test.ts
      updateUser.test.ts
```

## 2. Dependency Injection and Mocks (Golden Rule)

Since Service classes (e.g., `class User extends ServiceBase`) interact directly with PostgreSQL via the internal `this.db` property, under **no circumstances** should unit tests touch a real database.

### Mandatory Pattern (DB Mock)
You must mock the generic Database class by injecting it into the constructor during initialization (`beforeEach`):

```typescript
// Canonical initialization pattern in tests

import ServiceClass from '../../services/ServiceClass'; // Import the real service class

describe('Subdomain - methodName', () => {
    let serviceInstance: ServiceClass;
    let mockDb: any;
    let mockIdentity: any;

    beforeEach(() => {
        // 1. Mock native functions of the abstract DB
        mockDb = {
            query: jest.fn(),
            getFirst: jest.fn(),
            execute: jest.fn()
        };
        
        // 2. Inject dependency (Our mocked DB)
        serviceInstance = new ServiceClass(mockDb);
        
        // 3. Standardized session variables
        mockIdentity = { id: 100, account_id: 1 };
    });

    it('should mock a db response and process it', async () => {
        // Mock how postgres responds
        mockDb.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        
        await serviceInstance.method({});
        
        // Validate it was called respecting validations and security
        expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
});
```

### Mocking Nested Service Calls
If your method instantiates another service internally (e.g., resolving a nested GraphQL entity using `new Account(this.db)`), the nested service will use the exact same `mockDb` instance. You must provide mock responses for the queries executed by the nested service in the correct sequence.

```typescript
    it('should mock nested service DB responses', async () => {
        // 1. Mock the primary service DB call
        mockDb.query.mockResolvedValueOnce({ rows: [{ id: 1, accountId: 10 }] });
        // 2. Mock the nested service DB call (e.g. new Account(this.db).getAccountById(10))
        mockDb.getFirst.mockResolvedValueOnce({ id: 10, name: 'Test Account' });
        
        const result = await serviceInstance.methodWithNestedResolution({}, mockIdentity, null, ['id', 'account']);
        
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.getFirst).toHaveBeenCalledTimes(1);
        expect(result.account.name).toBe('Test Account');
    });
```

## 3. Execution Commands

To start or check that nothing is broken, use the configured CLI scripts:

1. **`npm test`**: Will run all files matching the `*.test.ts` pattern found under the `src/test` subdirectory.
2. **`npm run test:watch`**: Starts a hot Jest server that will recompile your specific test upon saving files, interacting in real-time with your terminal. Ideal for debugging.

## 4. Common Validations

* **Database Faults:** Simulate asynchronous failures to confirm the integrity of the `try/catch` block in your services: `mockDb.query.mockRejectedValueOnce(new Error('Connection fault'))`.
* **Identity Security:** Ensure that `$1` or `$2` positional parameters in PostgreSQL injected into `mockDb.query` reflect native parameters of your strict `mockIdentity` variable.
* **Dynamic Mapping (getFieldsValues):** Test variables passed through the `selectionSetList` array to observe if the framework extracts `snake_case` using aliases for `camelCase`.
