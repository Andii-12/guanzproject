import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import axios from 'axios';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const QRManager = () => {
  const [qrCodes, setQRCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/qr/tables');
      setQRCodes(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch QR codes. Please try again.');
      console.error('Error fetching QR codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = async (qrCode, tableNumber) => {
    try {
      const response = await fetch(qrCode);
      const blob = await response.blob();
      saveAs(blob, `table-${tableNumber}-qr.png`);
    } catch (err) {
      console.error('Error downloading QR code:', err);
      setError('Failed to download QR code. Please try again.');
    }
  };

  const handleDownloadAll = async () => {
    try {
      setDownloading(true);
      setError(null);
      
      const zip = new JSZip();
      const downloadPromises = qrCodes.map(async ({ qrCode, tableNumber }) => {
        const response = await fetch(qrCode);
        const blob = await response.blob();
        zip.file(`table-${tableNumber}-qr.png`, blob);
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'table-qr-codes.zip');
    } catch (err) {
      console.error('Error creating zip file:', err);
      setError('Failed to download all QR codes. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Table QR Codes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownloadAll}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Downloading...
            </>
          ) : (
            'Download All QR Codes'
          )}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {qrCodes.map(({ qrCode, tableNumber, menuUrl }) => (
          <Grid item xs={12} sm={6} md={4} key={tableNumber}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  Table {tableNumber}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <img
                    src={qrCode}
                    alt={`QR Code for Table ${tableNumber}`}
                    style={{ width: '200px', height: '200px' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ wordBreak: 'break-all' }}>
                  {menuUrl}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleDownloadQR(qrCode, tableNumber)}
                  disabled={downloading}
                >
                  Download QR Code
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default QRManager; 