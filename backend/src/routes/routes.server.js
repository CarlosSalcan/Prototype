const express=require('express')
const router=express.Router();
const user=require('../controllers/users.controllers.js');

router.get('/equipos',user.getEquipos)
router.get('/condicion',user.getCondicion)
router.post('/agg_condicion',user.postCondicion)
router.post('/login',user.conf_cred)
router.get('/buscar-equipos', user.searchEquipos);

module.exports = router;