const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

router.post('/create-class', mainController.createClass);
router.post('/register-student', mainController.registerStudent);
router.post('/payments/add', mainController.addPayment);
router.get('/classes', mainController.getAllClasses); // Sınıf listesi
router.get('/students/:id', mainController.getStudentDetail); // Detay sayfası
// ...
router.get('/classes/:id', mainController.getClassDetail);
router.get('/students', mainController.getAllStudents);
router.put('/students/:id', mainController.updateStudent);
router.post('/students/change-class', mainController.changeClass);
router.delete('/students/:id', mainController.deleteStudent);
router.delete('/classes/:id', mainController.deleteClass);
router.put('/classes/:id', mainController.updateClass);
router.get('/dashboard', mainController.getDashboardData);
router.post('/students/:id/note', mainController.addStudentNote);
router.delete('/students/:studentId/note/:noteId', mainController.deleteStudentNote);
router.get('/attendance/:classId', mainController.getAttendance);
router.post('/attendance', mainController.saveAttendance);
module.exports = router;