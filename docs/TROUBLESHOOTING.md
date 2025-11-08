# Solución de Problemas / Troubleshooting

## Error 401 de OpenAI: "You must be a member of an organization"

### 🔴 Problema

Al intentar generar imágenes con OpenAI DALL-E, recibes este error:

```
Error: 401 You must be a member of an organization to use the API
```

### ✅ Soluciones

#### Opción 1: Usar Replicate (Recomendado)

Replicate es más confiable y fácil de configurar para generación de imágenes:

1. **Obtén tu API token de Replicate:**
   - Ve a https://replicate.com/account/api-tokens
   - Crea una cuenta si no la tienes
   - Copia tu token (empieza con `r8_`)

2. **Configura el token:**
   ```bash
   # En tu archivo .env
   REPLICATE_API_TOKEN=r8_tu_token_aqui
   ```

3. **¡Listo!** El sistema usará Replicate automáticamente

#### Opción 2: Solucionar OpenAI

Si realmente quieres usar OpenAI DALL-E:

**Causa del error:** Tu cuenta de OpenAI necesita configuración organizacional para uso API.

**Solución:**

1. **Verifica tu cuenta:**
   - Ve a https://platform.openai.com/account/organization
   - Asegúrate de tener una organización configurada
   - Verifica que tu cuenta tenga créditos disponibles

2. **Genera una nueva API key:**
   - Ve a https://platform.openai.com/api-keys
   - Borra la API key antigua
   - Crea una nueva API key
   - Asegúrate de que esté asociada a una organización

3. **Configura billing:**
   - Ve a https://platform.openai.com/account/billing
   - Añade método de pago si no lo has hecho
   - Asegúrate de tener créditos o un plan activo

4. **Actualiza tu .env:**
   ```bash
   OPENAI_API_KEY=sk-tu_nueva_key_aqui
   ```

#### Opción 3: Usar ambos servicios

Para máxima confiabilidad, configura ambos:

```bash
# .env
REPLICATE_API_TOKEN=r8_tu_token_aqui
OPENAI_API_KEY=sk_tu_key_aqui
```

El sistema intentará Replicate primero (más confiable) y usará OpenAI como respaldo.

---

## Otros Problemas Comunes

### No se pueden capturar screenshots

**Problema:** Error al capturar screenshots del simulador

**Solución:**
1. Asegúrate de que el simulador esté ejecutándose
2. La app debe estar abierta y visible
3. Para iOS: Verifica `xcrun simctl` esté disponible
4. Para Android: Verifica `adb` esté en tu PATH
5. Alternativa: Captura manualmente (Cmd+S en iOS)

### Imágenes placeholder en lugar de AI

**Problema:** El sistema crea placeholders en vez de imágenes AI

**Causas posibles:**
- No hay API keys configuradas
- API keys inválidas o sin créditos
- Error de conexión a internet
- Servicio AI temporalmente no disponible

**Solución:**
1. Verifica tus API keys en `.env`
2. Comprueba conexión a internet
3. Revisa que tengas créditos en Replicate/OpenAI
4. Mira los logs para ver el error específico

### Error al instalar Sharp

**Problema:** `npm install` falla con errores de Sharp

**Solución:**
```bash
# macOS
brew install vips
npm install sharp

# Linux
sudo apt-get install libvips-dev
npm install sharp
```

### Metadata genérico en lugar de AI

**Problema:** Los textos generados son muy simples

**Causa:** OpenAI no está configurado (GPT-4 solo en OpenAI)

**Solución:**
1. Configura OpenAI API key para generación de texto
2. O edita manualmente los textos en el export
3. El fallback crea textos básicos pero funcionales

---

## Verificación de Configuración

### Comprobar API Keys

```bash
# Ver configuración actual (sin mostrar keys completas)
cat .env | grep API
```

### Probar Replicate

```bash
curl -s -X POST \
  -H "Authorization: Token r8_tu_token" \
  "https://api.replicate.com/v1/predictions" \
  | jq .
```

Si responde sin error 401, tu token funciona.

### Probar OpenAI

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk_tu_key" \
  | jq .
```

Si responde con una lista de modelos, tu key funciona.

---

## Preguntas Frecuentes

### ¿Cuál servicio es mejor?

- **Replicate:** Mejor para imágenes, más fácil de configurar, precios claros
- **OpenAI:** Necesario para textos (GPT-4), bueno para DALL-E si ya tienes cuenta

### ¿Cuánto cuesta?

- **Replicate:** ~$0.02 por imagen generada
- **OpenAI DALL-E:** ~$0.04 por imagen (1024x1024)
- **OpenAI GPT-4:** ~$0.01-0.03 por generación de texto

Para una app completa:
- Con Replicate solo: ~$0.10-0.20
- Con OpenAI: ~$0.20-0.40

### ¿Puedo usar el sistema sin AI?

Sí, pero con limitaciones:
1. Usa tus assets existentes (sin generación)
2. Edita manualmente los textos del export
3. El sistema aún optimiza y organiza todo

---

## Conseguir Ayuda

Si ninguna solución funciona:

1. **Revisa los logs completos** del error
2. **Verifica variables de entorno:** `echo $REPLICATE_API_TOKEN`
3. **Prueba el ejemplo mínimo** (abajo)
4. **Abre un issue** en GitHub con el error completo

### Ejemplo Mínimo

Prueba esto para verificar tu setup:

```typescript
// test-api.ts
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

async function test() {
  try {
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: "a simple test image",
          width: 512,
          height: 512,
        },
      }
    );
    console.log('✓ Replicate funciona!', output);
  } catch (error) {
    console.error('✗ Error:', error);
  }
}

test();
```

```bash
npx ts-node test-api.ts
```

Si esto funciona, el problema está en otra parte del sistema.
