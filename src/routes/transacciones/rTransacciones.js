import { Router } from "express"
import controller from "./cTransacciones.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vCompras:listar',
        'vVentas:listar'
    ]),
    controller.find
)

router.post(
    '/',
    verifyPermiso([
        'vCompraPedidos:ingresarMercaderia',
        'vCompras:crear',
        'vVentaPedidos:entregarMercaderia',
        'vVentas:crear',
    ]),
    controller.create
)

router.get(
    '/uno/:id',
    verifyPermiso([
        'vCompras:ver',
        'vVentas:ver',
        'vArticulos:kardex',
    ]),
    controller.findById
)

router.patch(
    '/:id',
    controller.update
)

router.delete(
    '/:id',
    controller.delet
)

// router.patch(
//     '/anular/:id',
//     verifyPermiso([
//         'vCompras:anular',
//         'vVentas:anular',
//     ]),
//     controller.anular
// )

export default router