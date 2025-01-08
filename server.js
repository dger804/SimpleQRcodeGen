import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url';
import { QRCodeStyling } from 'qr-code-styling/lib/qr-code-styling.common.js';
import nodeCanvas from 'canvas';
import { JSDOM } from 'jsdom';

const app = express()
dotenv.config()

const port=process.env.PORT || '3000'
const host=process.env.HOST || 'http://localhost'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json());

app.post('/api/generate-qr', async (req, res) => {
  const { data, size, color, bgColor, format, image, margin } = req.body;

  if (!data) {
    return res.status(400).json({ error: 'El campo "data" es obligatorio.' });
  }

  const options = {
    width: size || 300,
    height: size || 300,
    data: data,
    image: image || "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    margin: margin || 0,
    dotsOptions: {
      color: color || '#000000',
      type: 'rounded',
    },
    backgroundOptions: {
      color: bgColor || '#ffffff',
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 10
    },
    cornersSquareOptions:{
      type: 'square'
    },
    cornersDotOptions:{
      type: 'dot',
    },
    qrOptions :{
      errorCorrectionLevel: 'H'
    }
  };

  try {
    const qrCode = new QRCodeStyling({
      jsdom: JSDOM, // Requerido para entornos Node.js
      nodeCanvas,   // Requerido para renderizar en Node.js
      type: format || 'png',
      ...options,
    });

    const buffer = await qrCode.getRawData(format || 'png');

    res.setHeader('Content-Type', format === 'svg' ? 'image/svg+xml' : 'image/png');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Error generando el código QR', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor iniciado en ${host}:${port}`);
});