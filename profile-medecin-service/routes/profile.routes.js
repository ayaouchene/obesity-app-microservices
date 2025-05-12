const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');

router.get('/', profileController.getProfile);
router.put('/photo/profile', profileController.updateProfilePhoto);
router.put('/photo/cover', profileController.updateCoverPhoto);
router.delete('/photo/profile', profileController.deleteProfilePhoto);
router.delete('/photo/cover', profileController.deleteCoverPhoto);
router.put('/contact', profileController.updateContact);
router.put('/availability', profileController.updateAvailability);
router.post('/certificates', profileController.addCertificate);
router.put('/certificates/:certificateId', profileController.updateCertificate);
router.delete('/certificates/:certificateId', profileController.deleteCertificate);
router.get('/followed-patients', profileController.getFollowedPatients);
router.delete('/followed-patients/:patientId', profileController.removeFollowedPatient);

module.exports = router;