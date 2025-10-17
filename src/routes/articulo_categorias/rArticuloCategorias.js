import { Router } from "express"
import controller from "./cArticuloCategorias.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'
import { upload, uploadMem } from "../../utils/uploadFiles.js"

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vArticuloCategorias:listar',
        'vArticulos:listar', 'vArticulos:crear', 'vArticulos:editar', 'vArticulos:clonar', 'vArticulos:importar', 'vArticulos:editarBulk',
        'vProductoCategorias:listar',
        'vProductosTerminados:listar', 'vProductosTerminados:crear', 'vProductosTerminados:editar', 'vProductosTerminados:clonar', 'vProductosTerminados:crearCombo', 'vProductosTerminados:importar', 'vProductosTerminados:editarBulk',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vArticuloCategorias:crear',
        'vProductoCategorias:crear'
    ]),
    upload.single('archivo'),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vArticuloCategorias_ver', 'vArticuloCategorias:editar',
        'vProductoCategorias_ver', 'vProductoCategorias:editar',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso([
        'vArticuloCategorias:editar',
        'vProductoCategorias:editar'
    ]),
    uploadMem.single('archivo'),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso([
        'vArticuloCategorias:eliminar',
        'vProductoCategorias:eliminar'
    ]),
    controller.delet
)

export default router