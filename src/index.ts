import express from 'express';
 import type { Request, Response } from 'express';
 import axios from 'axios';
 import dotenv from 'dotenv';
 
 // Configuración de dotenv
 dotenv.config();
 
 // Crear la aplicación Express
 const app = express();
 app.use(express.json());
 
 // URL de la API de Together
 const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
 const MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
 
 // Definir una interfaz para el cuerpo de la solicitud
 interface AnalyzeRequestBody {
   code: string;
   instruction?: string;
 }
 
 // Definir la función controladora con tipos explícitos
 function analyzeCode(req: Request<{}, {}, AnalyzeRequestBody>, res: Response) {
   const { code, instruction } = req.body;
   
   // Validar que se proporciona código
   if (!code) {
     return res.status(400).json({ error: 'El código es requerido' });
   }
   
   // Preparar el contenido para el usuario
   const userContent = instruction 
     ? `${instruction}\n\n${code}` 
     : `Analiza el siguiente código:\n\n${code}`;
   
   // Realizar la solicitud a la API de Together usando Axios
   axios.post(
     TOGETHER_API_URL,
     {
       model: MODEL,
       messages: [
         { role: 'system', content: 'Eres un experto en desarrollo de software.' },
         { role: 'user', content: userContent }
       ],
       temperature: 0.2,
       max_tokens: 1024
     },
     {
       headers: {
         Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
         'Content-Type': 'application/json'
       }
     }
   )
   .then(response => {
     // Extraer y devolver el contenido de la respuesta
     const message = response.data.choices[0].message.content;
     res.json({ result: message });
   })
   .catch(error => {
     console.error('❌ Error:', error.response?.data || error.message);
     res.status(500).json({ 
       error: 'Hubo un problema al generar la respuesta.',
       details: error.response?.data || error.message
     });
   });
 }
 
 // Registrar la ruta
 app.post('/analyze', analyzeCode);
 
 // Iniciar el servidor
 const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
   console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
 });