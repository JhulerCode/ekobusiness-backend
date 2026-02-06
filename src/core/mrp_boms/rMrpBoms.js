import { Router } from 'express'
import controller from './cMrpBoms.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get('/', verifyPermiso(['vReceta:listar']), controller.find)

router.get('/uno/:id', verifyPermiso(['vReceta:editar']), controller.findById)

router.post('/', verifyPermiso(['vReceta:crear']), controller.create)

router.patch('/:id', verifyPermiso(['vReceta:editar']), controller.update)

router.delete('/:id', verifyPermiso(['vReceta:eliminar']), controller.delet)

export default router
