import { Router } from 'express'
import controller from './cMrpBoms.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get('/', controller.find)

router.get('/uno/:id', verifyPermiso(['vMrpBom:editar']), controller.findById)

router.post('/', verifyPermiso(['vMrpBom:crear']), controller.create)

router.patch('/:id', verifyPermiso(['vMrpBom:editar']), controller.update)

router.delete('/:id', verifyPermiso(['vMrpBom:eliminar']), controller.delet)

export default router
