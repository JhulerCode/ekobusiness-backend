import { Router } from "express"
import controller from "./cArticuloLineas.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'
import { uploadMem } from "../../utils/uploadFiles.js"

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vProductoLineas:listar',
        'vProductosTerminados:listar', 'vProductosTerminados:crear', 'vProductosTerminados:editar', 'vProductosTerminados:clonar', 'vProductosTerminados:crearCombo', 'vProductosTerminados:importar', 'vProductosTerminados:editarBulk',
        'vPrograma:listar', 'vPrograma:crear'
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vProductoLineas:crear'
    ]),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vProductoLineas:editar',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vProductoLineas:editar'
    ]),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso([
        'vProductoLineas:eliminar'
    ]),
    controller.delet
)

router.patch(
    '/fotos/:id',
    verifyPermiso([
        'vProductos:actualizarFotos',
    ]),
    uploadMem.array('archivos'),
    controller.updateFotos
)

export default router