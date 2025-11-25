import { Router } from "express"
import controller from "./cArticuloCategorias.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'
import { uploadMem } from "#http/middlewares/uploadFiles.js"

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

router.patch(
    '/fotos/:id',
    verifyPermiso([
        'vProductos:actualizarFotos',
    ]),
    uploadMem.array('archivos'),
    controller.updateFotos
)

export default router