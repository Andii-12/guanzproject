const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

// Generate QR code for a specific table
router.get('/generate/:tableNumber', async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const menuUrl = `${frontendUrl}/menu?table=${tableNumber}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    res.json({
      qrCode: qrCodeDataUrl,
      tableNumber,
      menuUrl
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

// Get all table QR codes
router.get('/tables', async (req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const tables = Array.from({ length: 20 }, (_, i) => i + 1); // Generate for tables 1-20
    
    const tableQRCodes = await Promise.all(
      tables.map(async (tableNumber) => {
        const menuUrl = `${frontendUrl}/menu?table=${tableNumber}`;
        const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 300,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });

        return {
          tableNumber,
          qrCode: qrCodeDataUrl,
          menuUrl
        };
      })
    );

    res.json(tableQRCodes);
  } catch (error) {
    console.error('Error generating table QR codes:', error);
    res.status(500).json({ message: 'Failed to generate table QR codes' });
  }
});

module.exports = router; 