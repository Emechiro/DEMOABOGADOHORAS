const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

router.use(authenticate);

router.get('/', documentController.getAll);
router.get('/:id', documentController.getById);
router.get('/:id/download', documentController.download);
router.post('/', upload.single('file'), handleUploadError, documentController.upload);
router.post('/multiple', upload.array('files', 10), handleUploadError, documentController.uploadMultiple);
router.put('/:id', documentController.update);
router.delete('/:id', documentController.delete);
router.delete('/:id/permanent', authorize('admin'), documentController.permanentDelete);

module.exports = router;
