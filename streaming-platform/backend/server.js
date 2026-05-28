
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { syncAll } = require('./services/mediaScanner');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/admin', adminRoutes);

// Servir frontend estático
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Sincronización inicial de media
syncAll().catch(err => console.error('Error sincronizando media', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
