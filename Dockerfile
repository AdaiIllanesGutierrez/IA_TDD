FROM node:18-alpine

WORKDIR /app

# Copiar los archivos de configuración primero
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --only=production
RUN npm install
RUN npm install -g typescript
# Crear estructura para archivos de salida
RUN mkdir -p dist

# Copiar el código fuente
COPY . .

RUN npm run build
# Crear una versión JavaScript del archivo index.ts
RUN echo '// Converted from TypeScript to JavaScript\n\
const express = require("express");\n\
const axios = require("axios");\n\
const dotenv = require("dotenv");\n\
\n\
// Configuración de dotenv\n\
dotenv.config();\n\
\n\
// Crear la aplicación Express\n\
const app = express();\n\
app.use(express.json());\n\
\n\
// URL de la API de Together\n\
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";\n\
const MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1";\n\
\n\
// Definir la función controladora\n\
function analyzeCode(req, res) {\n\
  const { code, instruction } = req.body;\n\
  \n\
  // Validar que se proporciona código\n\
  if (!code) {\n\
    return res.status(400).json({ error: "El código es requerido" });\n\
  }\n\
  \n\
  // Preparar el contenido para el usuario\n\
  const userContent = instruction \n\
    ? `${instruction}\\n\\n${code}` \n\
    : `Analiza el siguiente código:\\n\\n${code}`;\n\
  \n\
  // Realizar la solicitud a la API de Together usando Axios\n\
  axios.post(\n\
    TOGETHER_API_URL,\n\
    {\n\
      model: MODEL,\n\
      messages: [\n\
        { role: "system", content: "Eres un experto en desarrollo de software." },\n\
        { role: "user", content: userContent }\n\
      ],\n\
      temperature: 0.2,\n\
      max_tokens: 1024\n\
    },\n\
    {\n\
      headers: {\n\
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,\n\
        "Content-Type": "application/json"\n\
      }\n\
    }\n\
  )\n\
  .then(response => {\n\
    // Extraer y devolver el contenido de la respuesta\n\
    const message = response.data.choices[0].message.content;\n\
    res.json({ result: message });\n\
  })\n\
  .catch(error => {\n\
    console.error("❌ Error:", error.response?.data || error.message);\n\
    res.status(500).json({ \n\
      error: "Hubo un problema al generar la respuesta.",\n\
      details: error.response?.data || error.message\n\
    });\n\
  });\n\
}\n\
\n\
// Registrar la ruta\n\
app.post("/analyze", analyzeCode);\n\
\n\
// Iniciar el servidor\n\
const PORT = process.env.PORT || 3000;\n\
app.listen(PORT, () => {\n\
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);\n\
});\n' > dist/index.js

# Exponer el puerto
EXPOSE 3000

# Establecer variables de entorno
ENV NODE_ENV=production

# Iniciar la aplicación
CMD ["node", "dist/index.js"]