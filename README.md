# RutaTicket · SaaS de boletería digital de transporte

**Estado: primer MVP de demostración local (v0.1). No es un SaaS operativo, una caja real ni un sistema de venta habilitado.**

Boletería destinada a operadores terrestres y marítimos, producto **independiente de PaseListo** (eventos). Requisitos aprobados en [REQUISITOS_SAAS](docs/REQUISITOS_SAAS.md).

## Funciones presentes en esta entrega
- Panel por operador **ficticio** con indicadores y salidas de prueba.
- Registro de rutas/salidas terrestres y marítimas; capacidad y tarifa referencial en VES.
- Selector visual de asientos; emisión de boletos DEMO con código único de prueba.
- Reglas de no duplicar asiento en una sesión y liberación tras anulación.
- Control de embarque con código de un solo uso de prueba.
- Cierre de caja ficticio con diferencia esperado/declarado y bloqueo de nuevas ventas de prueba en esa sesión.
- Auditoría y tests automatizados de aislamiento básico, duplicados, validaciones y caja.

**Limitaciones:** la información es sintética, volátil y se pierde al recargar. Cambiar de operador desde el selector no es autenticación. No hay ventas reales, pagos, QR firmados, preservación multiusuario, prevención de carreras entre dispositivos, roles reales, servidores, modo offline ni permisos de transporte comprobados.

## Ejecutar

Con Python 3 y un navegador actual:

```sh
python3 -m http.server 8080
```

Abrir **http://localhost:8080**.

Con Node.js 20+ (sin instalación de dependencias):

```sh
npm test
npm run check
```

La validación automatizada de navegador Chromium ahora está integrada en `tests/browser-demo.py`: cubre ancho de 320–1280 px, asiento por teclado, aislamiento visual entre operadores ficticios, reinicio de datos y ausencia de conexiones a terceros. **Siguen pendientes** pruebas físicas con lectores de pantalla, múltiples dispositivos y una autorización formal antes de cualquier venta real.

## Próximos hitos
Leer [arquitectura y etapas](docs/ARQUITECTURA_Y_HITOS.md) para el desarrollo de backend PostgreSQL, separación por taquilla/operador, ventas concurrentes, QR, pagos autorizados, cierres verificados, SaaS multicliente y normas para transporte. No se autoriza despliegue, fondos ni datos personales reales.

## Continuidad y estado verificable · 21/11/2026

**Propósito:** MVP de boletería digital para transporte.

**Límite:** No es un sistema transaccional real; independiente de PaseListo.

- **Código:** revisar commits y PR recientes del propio repositorio, sin trasladar supuestos de otro producto.
- **Pruebas/CI:** verificar los workflows y resultados asociados al SHA exacto. Esta actualización del README no constituye prueba funcional.
- **Despliegue:** confirmar por separado la versión servida y el funcionamiento real del entorno; demo o CI verde no acreditan producción.
- **Operación:** continuar el último bloqueo real, documentando rama, SHA, PR, evidencia de pruebas, entorno verificado y siguiente acción.
- **Protección:** preservar fixtures sintéticos, separar entornos y no divulgar credenciales ni datos reales.

**Fuente oficial:** documentación y decisiones de este producto. Leer [memoria operativa](docs/MEMORIA_OPERATIVA.md) y [decisiones](docs/DECISIONES.md). [Issue relevante](https://github.com/medinacaj/saas-ruta-ticket/issues/1).
