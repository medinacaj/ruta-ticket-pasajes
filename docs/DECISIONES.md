# RutaTicket — decisiones y límites del producto

**Fuente de verdad:** decisiones de este archivo → issues/ADR del producto → PR, commit y pruebas GitHub del propio repositorio. **Actualizado:** 2026-11-20. Las notas anteriores se conservan como historia, no se presumen vigentes.

## Decisiones específicas

- **[CONFIRMADO]** Conservar requisitos e hitos propios en este repositorio; no mezclar decisiones de PaseListo.
- **[PENDIENTE/REVISAR]** Verificar el issue #1 y los módulos existentes; no reconstruir backend ni declarar producción sin pruebas.
- Aplicar normas de persistencia, fixtures, pruebas de permisos y despliegue solo cuando correspondan al alcance de RutaTicket.

## Criterios obligatorios del producto

- **[NO MODIFICAR]** Conservar fixtures y datos ficticios útiles. Los escenarios sintéticos y los mecanismos de reset deben quedar aislados de producción.
- **[NO MODIFICAR]** No presentar DEMO ni GitHub Actions/CI satisfactoria como prueba de despliegue, funcionamiento en hosting o autorización comercial.
- Para datos mutables, exigir UI funcional, API con permisos, persistencia real, errores, pruebas y auditoría según el riesgo; no sustituir procesos reales por botones decorativos.
- Separar desarrollo, staging y producción; verificar identidades de bases antes de ejecutar migraciones o limpiezas. Respaldos/restauración y rollback cuando corresponda.
- Reutilizar módulos existentes y registrar pruebas, SHA, entorno efectivamente verificado, pendientes y siguiente acción.
- No exponer credenciales, datos reales de clientes ni información privada en documentación pública.
- Las decisiones confirmadas se modifican solo mediante nueva instrucción expresa del propietario y registro revisado **en este repositorio**. El snapshot automático no puede cambiarlas.

## Independencia operativa

La continuidad de RutaTicket reside en este repositorio. La memoria local y `docs/ESTADO_GITHUB_AUTO.md` se consultan aquí, y este último puede estar desactualizado. No se exige leer, actualizar ni sincronizar `medinacaj/ai-project-control`. Las decisiones históricas de ese centro se migran por revisión humana, sin sobrescribir este archivo automáticamente.
