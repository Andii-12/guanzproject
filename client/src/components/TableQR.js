import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const TableQR = ({ tableNumber }) => {
  const url = `${window.location.origin}/menu?table=${tableNumber}`;
  
  return (
    <Paper elevation={3} sx={{ p: 2, m: 2 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Table {tableNumber}
        </Typography>
        <QRCodeCanvas 
          value={url}
          size={200}
          level="H"
          includeMargin={true}
        />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Scan to order
        </Typography>
      </Box>
    </Paper>
  );
};

const TableQRList = () => {
  const tables = [1, 2, 3, 4, 5];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Table QR Codes
      </Typography>
      <Grid container spacing={2}>
        {tables.map((tableNumber) => (
          <Grid item xs={12} sm={6} md={4} key={tableNumber}>
            <TableQR tableNumber={tableNumber} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TableQRList; 