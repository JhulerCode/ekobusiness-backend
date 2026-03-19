import { Router } from 'express'
import controller from './cEmpresas.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'
import { uploadMem } from '#http/middlewares/uploadFiles.js'

const router = Router()

router.get('/', verifyPermiso(['vAdminEmpresas:listar']), controller.find)
router.get('/uno/:id', controller.findById)
router.post('/', verifyPermiso(['vAdminEmpresas:crear']), controller.create)
router.patch(
    '/:id',
    verifyPermiso(['vEmpresa:editar', 'vAdminEmpresas:editar']),
    uploadMem.single('archivo'),
    controller.update,
)
router.delete('/:id', verifyPermiso(['vAdminEmpresas:eliminar']), controller.delet)

export default router
