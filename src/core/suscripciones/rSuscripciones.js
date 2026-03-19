import { Router } from 'express'
import controller from './cSuscripciones.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(['vSuscripciones:listar', 'vAdminSuscripciones:editar']),
    controller.find,
)

router.post('/', verifyPermiso(['vAdminSuscripciones:crear']), controller.create)

router.get('/uno/:id', controller.findById)

router.patch('/:id', verifyPermiso(['vAdminSuscripciones:editar']), controller.update)

router.delete('/:id', verifyPermiso(['vAdminSuscripciones:eliminar']), controller.delet)

export default router
