import { Router } from 'express'
import controller from './cEmpresas.js'
import verifyPermiso from '#http/middlewares/verifyPermiso.js'
import { uploadMem } from '#http/middlewares/uploadFiles.js'

const router = Router()

router.get('/uno/:id', controller.findById)

router.patch(
    '/:id',
    verifyPermiso(['vEmpresa:editar']),
    uploadMem.single('archivo'),
    controller.update,
)

export default router
