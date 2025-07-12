import { Router } from "express"
import controller from "./cColaboradores.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vColaboradores',
        'vFormatosBpm:crear', 'vFormatosBpm:ver', 'vFormatosBpm:editar',
        'vFormatosPhs:crear', 'vFormatosPhs:ver', 'vFormatosPhs:editar',
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso(['vColaboradores_crear']),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso(['vColaboradores_ver', 'vColaboradores_editar']),
    controller.findById
)

router.patch(
    '/:id',
    verifyPermiso(['vColaboradores_editar']),
    controller.update
)

router.delete(
    '/:id',
    verifyPermiso(['vColaboradores_eliminar']),
    controller.delet
)

router.patch('/preferencias/:id', controller.preferencias)

router.get('/login', controller.login)

export default router