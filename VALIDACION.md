# Validación v2 — 30 de octubre de 2026

## Ejecutado

- 15 pruebas de Node aprobadas: nueve de datos/VCF/búsqueda y seis grupos nuevos de cifrado, rechazo de manipulación, coste KDF, URL de contactos, VCF e imágenes/límites.
- En navegador real mediante una base de pruebas aislada: seis grupos aprobados. Migración de base v1 con fotos y número `00007`; registro v2 sin nombre literal ni estado en claro; bloqueo y contraseña incorrecta; dos conexiones y rechazo de revisión antigua; exportación desde el último estado; imágenes realmente decodificadas y rechazo de bytes rotos; cambio de contraseña conservando legibilidad de copia anterior; guardado inválido sin cambiar revisión.
- Interfaz local: configuración de cifrado con contraseña ficticia y alta de un destinatario ficticio.
- Se observó caché v1 en el origen local previo y la nueva pantalla en un origen local separado. Esto confirma que la actualización debe cerrar los clientes antiguos; no constituye por sí solo una prueba completa de transición en Safari.

## Pendiente de dispositivo

Safari/iPhone físico: selección de fotos, guardado del archivo cifrado en Archivos, restauración de esa copia, tamaño de biblioteca habitual, bloqueo al cambiar de aplicación, modo avión y transición de v1 a v2. No se ha accedido a datos reales ni elegido una contraseña del usuario.

El lanzamiento local de Edge mediante el ejecutor de comandos fue impedido por el entorno. Se usó el navegador integrado para las pruebas de la bóveda. El recorrido `tests/browser.cjs` se entrega actualizado; no se presenta como ejecutado en esta revisión. Las pruebas anteriores de Edge de v1 siguen siendo evidencia de aquella versión, no de v2.

No es una certificación criptográfica ni una prueba de penetración independiente. No se ha comprobado doble factor de GitHub, permisos privados del dispositivo ni protección de rama. `_headers` no se aplica en GitHub Pages. El origen no se ha cambiado y el almacenamiento sigue siendo un estado cifrado completo con límites, no escrituras separadas de fotos.
