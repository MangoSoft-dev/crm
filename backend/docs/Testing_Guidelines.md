# Guía de Testing para Servicios (Backend)

Este proyecto utiliza **Jest** y **ts-jest** para ejecutar pruebas unitarias enfocadas en la Lógica de Negocio y construcción SQL que reside dentro de las clases en la carpeta `src/services`.

## 1. Estructura de Carpetas

A diferencia de ubicar los tests adjunto al archivo origen, utilizamos una arquitectura de _carpetas de integración externa_ para facilitar la ejecución y depuración individual de contextos de método.

Todos los tests deben alojarse dentro de `src/test/`. Deben agruparse por el nombre del módulo o entidad en minúsculas y dividir cada escenario unitario por nombre de la función exportada:

```
src/
  services/
    User.ts
  test/
    users/
      getUserById.test.ts
      createUser.test.ts
      updateUser.test.ts
```

## 2. Inyección de Dependencias y Mocks (Regla de Oro)

Dado que las clases de Servicio (ej. `class User extends ServiceBase`) interaccionan directamente con PostgreSQL a través de la propiedad interna `this.db`, bajo **ninguna circunstancia** las pruebas unitarias deben tocar una base de datos real. 

### Patrón Obligatorio (Mock de BD)
Debes simular la clase genérica de Base de Datos inyectándola al constructor durante la inicialización (`beforeEach`):

```typescript
// Patrón canónico de inicialización en tests

import ServiceClass from '../../services/ServiceClass'; // Importa la clase del servicio real

describe('Subdominio - nombreMetodo', () => {
    let serviceInstance: ServiceClass;
    let mockDb: any;
    let mockIdentity: any;

    beforeEach(() => {
        // 1. Mock functions nativas de la DB abstracta
        mockDb = {
            query: jest.fn(),
            getFirst: jest.fn(),
            execute: jest.fn()
        };
        
        // 2. Inyectamos dependencia (Nuestra BD mockeada)
        serviceInstance = new ServiceClass(mockDb);
        
        // 3. Variables de sesión estandarizadas
        mockIdentity = { id: 100, account_id: 1 };
    });

    it('debería simular una respuesta de db y ser procesada', async () => {
        // Mockear cómo nos responde postgres
        mockDb.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        
        await serviceInstance.metodo({});
        
        // Validar que se llamó respetando validaciones y seguridad
        expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
});
```

## 3. Comandos de Ejecución

Para iniciar o comprobar que nada se ha roto emplea los scripts configurados de CLI:

1. **`npm test`**: Ejecutará todos los archivos coincidentes con el patrón `*.test.ts` que se encuentren bajo el subdirectorio `src/test`.
2. **`npm run test:watch`**: Arranca un servidor Jest en caliente que recompilará tu prueba específica al guardar archivos interactuando en tiempo real con tu terminal. Ideal para debugging.

## 4. Validaciones Comunes

* **Fallo Base de Datos:** Simula fallos asíncronos para confirmar la integridad del `try/catch` de tus servicios: `mockDb.query.mockRejectedValueOnce(new Error('Connection fault'))`.
* **Seguridad Identity:** Evalúa que `$1` ó `$2` en los parámetros posicionales de PostgreSQL inyectadas al `mockDb.query` reflejen los parámetros nativos de tu variable `mockIdentity` estricta.
* **Mapeo Dinámico (getFieldsValues):** Testea variables pasadas mediante el array `selectionSetList` para observar si el framework extrae `snake_case` como alias a `camelCase`.
