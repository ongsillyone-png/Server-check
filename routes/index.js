const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const roomRoutes = require('./room.routes');
const rackRoutes = require('./rack.routes');
const assetTypeRoutes = require('./asset-type.routes');
const serverRoutes = require('./server.routes');
const vmRoutes = require('./vm.routes');
const templateRoutes = require('./template.routes');
const templateItemRoutes = require('./template-item.routes');
const userRoutes = require('./user.routes');
const roleRoutes = require('./role.routes');
const settingRoutes = require('./setting.routes');
const inspectionRoutes = require('./inspection.routes');
const notificationRoutes = require('./notification.routes');

// Redirect root to dashboard
router.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Register route modules
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/rooms', roomRoutes);
router.use('/racks', rackRoutes);
router.use('/asset-types', assetTypeRoutes);
router.use('/servers', serverRoutes);
router.use('/vms', vmRoutes);
router.use('/templates', templateRoutes);
router.use('/template-items', templateItemRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/settings', settingRoutes);
router.use('/inspections', inspectionRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
