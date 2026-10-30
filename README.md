# Control de Décimos 2.0

PWA para iPhone, desarrollable desde Windows, sin dependencias de producción ni servicios de pago. Datos y fotos locales cifrados; no hay cuenta ni sincronización remota de registros.

## Actualizar desde la versión anterior

1. Antes de actualizar, exporta una copia desde la versión anterior y comprueba que esté en Archivos. Si usaste varias ventanas, guarda sus formularios y recarga la ventana de exportación primero.
2. Con conexión, abre la app, cierra todas sus ventanas y pestañas y vuelve a abrir desde el icono. Puede hacer falta una primera apertura para descargar la actualización y una segunda para activarla. No borres datos de Safari ni desinstales para actualizar.
3. Aparecerá **Protege tus décimos**. Guarda una contraseña única de al menos 14 caracteres en tu gestor de contraseñas; recomendamos varias palabras aleatorias. Escríbela dos veces y confirma que la has guardado. Nadie puede recuperarla por ti.
4. La app cifra los datos existentes. Solo sustituye el registro anterior después de cifrarlo y comprobar que puede descifrarlo. Antes de ese paso ofrece guardar una copia anterior sin cifrar cuando hay destinatarios. Si falla, no borra la base anterior.
5. Revisa personas, entregas y fotos. Exporta una **nueva copia cifrada** y comprueba que puedes restaurarla en otro navegador usando la contraseña. Conserva las copias anteriores de forma privada hasta verificar la migración.

La base pasa de versión 1 a 2; el código antiguo ya no puede abrirla con versión 1. No reviertas los archivos a la v1 después de migrar. Si la biblioteca antigua supera los límites nuevos, la migración se detiene: usa «Guardar copia anterior» y conserva esa copia para una migración asistida; no se recortan registros automáticamente.

## Protección y contraseña

- AES-256-GCM con autenticación, IV aleatorio de 96 bits por escritura, sal aleatoria de 128 bits y derivación PBKDF2-HMAC-SHA256 con 600.000 iteraciones. Implementación mediante Web Crypto del navegador, sin librerías criptográficas externas.
- La contraseña no se guarda. La clave no extraíble se conserva en memoria mientras está desbloqueada. Los nombres, teléfonos, notas, números y fotos se guardan dentro del contenido cifrado.
- Botón **Bloquear**, bloqueo tras 5 minutos sin uso o tras un minuto en segundo plano. El contenido se oculta mientras la página está en segundo plano. Guarda los formularios antes de salir: bloquear descarta cambios no guardados. Durante operaciones en curso, el bloqueo automático espera a que terminen.
- **Copias y ayuda → Cambiar contraseña** exige la contraseña actual y dos entradas de la nueva. Cambiarla vuelve a cifrar la base. Las copias antiguas siguen necesitando su contraseña antigua.
- La exportación lee siempre el último registro guardado, aunque otra ventana lo haya actualizado. El resultado es un JSON cifrado con la contraseña de la app en ese momento, con todos los años y fotos guardadas.
- Para restaurar: selecciona la copia, introduce su contraseña si está cifrada, espera la validación de imágenes y confirma el reemplazo total. Una contraseña incorrecta, foto dañada o error de guardado no confirma una restauración exitosa.
- Se admiten copias antiguas v1 sin cifrar para migrar; después de importarlas quedan cifradas en el dispositivo. La copia antigua que guardaste en Archivos no se cifra retroactivamente.

**No hay recuperación de contraseña.** Perderla puede hacer irrecuperables la base y sus copias. No se incluye un botón de borrado o reinicio que pueda destruir los únicos datos. Si tienes una copia y su contraseña, puedes restaurarla en una instalación nueva configurada con otra contraseña.

## Límites de seguridad y privacidad

No existe seguridad absoluta. El cifrado protege los datos guardados y las copias frente a lectura sin contraseña; no protege de un dispositivo comprometido, una extensión con acceso, una contraseña débil ni código malicioso servido en una actualización mientras introduces la contraseña. La cuenta de GitHub y el dispositivo deben estar protegidos.

GitHub Pages mantiene otras aplicaciones de `mouai300.github.io` en el mismo origen. Esta versión no mueve tus datos a otro dominio: eso exigiría una migración y una dirección elegida por el propietario. No alojes código no confiable en ese origen. Un dominio exclusivo reduce ese riesgo.

La app se niega a abrir sus datos dentro de un marco de otra página. El service worker añade protección de incrustación a las navegaciones que sirve. `_headers` incluye cabeceras estrictas para alojamientos que soportan ese archivo, **pero GitHub Pages no lo aplica**; no se afirma que la primera respuesta de Pages tenga esas cabeceras. Para protección HTTP uniforme desde la primera visita se necesita un alojamiento configurable.

No se garantiza el borrado forense de copias antiguas del almacenamiento del navegador o del sistema. Las fotos están descifradas en memoria mientras las utilizas. El sistema puede tomar capturas de la app; la ocultación al pasar a segundo plano no garantiza eliminar todas las miniaturas del sistema.

## Uso

Destinatarios: alta manual, edición, notas, importación VCF y contactos seleccionados mediante Atajos. Una persona puede tener múltiples entregas. Cada entrega tiene año, estado pendiente/entregado, notas y varios números de cinco cifras con cantidad entera obligatoria; serie y fracción son opcionales. Cantidad significa unidades, no importe. Para una entrega parcial, crea dos entregas.

Puedes añadir fotos individuales a cada registro de décimo y conjuntas a la entrega. Se admiten JPEG, PNG y WebP; para HEIC exporta primero a JPEG. Se validan cabeceras y dimensiones antes de decodificar y se adaptan a JPEG de hasta 2.000 píxeles. Se bloquea el formulario durante el procesamiento para no perder cambios. La copia guarda esas versiones, no los originales de cámara.

Límites: 5.000 destinatarios, 10.000 entregas, 200 registros de décimos por entrega y 20.000 en total; 1.000 fotos en total y 48 MB de texto Base64 para fotos; 100 fotos por registro/entrega; 25 MB y 50 megapíxeles por imagen de entrada; 64 MiB de estado antes de cifrar y 90 MB de archivo de copia. Son límites preventivos, no una garantía de rendimiento en todos los iPhone. Se mantiene una transacción de estado completo cifrado: para bibliotecas grandes sigue siendo preferible una futura arquitectura por registros/fotos separados.

La búsqueda encuentra nombre, teléfono, número, serie, fracción y notas de entrega. El resumen anual cuenta unidades y no cambia por el filtro de texto o estado; esa distinción aparece en pantalla.

## Atajos y VCF

No existe acceso nativo ni sincronización automática con Contactos. VCF importa nombre y primer teléfono y muestra selección y confirmación. Las fotos del contacto se ignoran; los campos de texto con codificación antigua se omiten con aviso. Se admiten nombres con separadores escapados y líneas plegadas. Máximo VCF: 5 MB.

En Atajos: seleccionar un contacto → obtener nombre y un teléfono → codificar cada valor por separado para URL → componer texto → Abrir URL. Formato:

`https://mouai300.github.io/control-de-decimos/#action=contact&name=Ana%20Garc%C3%ADa&phone=%2B34600111222`

Solo se admiten fragmentos `#`, origen y ruta de esta misma aplicación. Se revisan los datos antes de guardarlos. No uses `?`: puede enviar el contacto al alojamiento antes de que la app lo rechace. El fragmento se limpia de la barra al recibirlo, pero no lo compartas públicamente.

Si Atajos abre Safari en otra instancia, usa Copiar al portapapeles como última acción; abre la app instalada → Destinatarios → Pegar enlace de Atajos. No se garantiza que un enlace abra directamente la app instalada ni que Safari comparta su almacenamiento con ella.

## Probar en Windows e instalar en iPhone

Con Node.js 20 o posterior, abre una terminal en esta carpeta y ejecuta `node server.mjs`; abre `http://localhost:4173`. No necesita `npm install`. No abras `index.html` con doble clic. El servidor escucha solo en el propio PC; admite `PORT` para pruebas aisladas.

Para iPhone, usa la dirección HTTPS publicada en Safari → Compartir → Añadir a pantalla de inicio → Abrir como app web → Añadir. Abre el icono con conexión hasta «Disponible sin conexión». Configura la protección y verifica una entrega de prueba en modo avión. Windows y iPhone no sincronizan sus bases: usa una copia cifrada si necesitas transferir datos.

Para publicar los cambios, sube juntos los archivos HTML/CSS/JS de producción, manifiesto e iconos. Incluye los nuevos `crypto.js`, `images.js` y `security-ui.js`. No publiques copias, datos o fotos personales. En esta entrega se incluyen también documentación y pruebas para mantenimiento.

## Pruebas y actualizaciones

`npm test` ejecuta las pruebas de lógica y cifrado. En entornos que impiden procesos secundarios, usa Node reciente con `node --test --test-isolation=none tests/*.test.mjs`.

`tests/vault.html`, servido localmente, ejecuta pruebas de base de datos en una base aislada de nombre aleatorio: migración, fotos, bloqueo, contraseña incorrecta, concurrencia, exportación reciente, cambio de contraseña y rechazo de guardados inválidos. No utiliza la base normal de la app.

Para el recorrido automatizado opcional, instala Playwright como herramienta de desarrollo (`npm install --no-save playwright`), inicia el servidor y ejecuta `node tests/browser.cjs` con Edge instalado. No utiliza el perfil habitual del navegador.

La comprobación de GitHub Actions se ejecuta en push y pull request. Solo tiene permiso de lectura; la acción de checkout está fijada a un commit. Esto no configura por sí solo reglas de rama ni bloquea la publicación de Pages. Para exigir sus resultados antes de publicar, el propietario debe activar la regla correspondiente en GitHub.

Cada publicación debe cambiar la versión de caché en `sw.js`. La app ofrece **Actualizar aplicación** cuando detecta una versión esperando; guarda o cierra los formularios antes de activarla. La caché se identifica por la dirección de instalación. No se borra IndexedDB al actualizar.

Consulta `VALIDACION.md` para distinguir lo probado de lo pendiente. Fuentes: [OWASP, almacenamiento criptográfico](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html), [OWASP, PBKDF2](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [MDN, AES-GCM](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams).
