import { Router } from 'express'

import addEmpresaId from '#http/middlewares/addEmpresaId.js'
import verifyToken from '#http/middlewares/verifyToken.js'

import sistema from '#core/_sistema/rSistema.js'

import lineas from '#ecommerce/rArticuloLineas.js'
import categorias from '#ecommerce/rArticuloCategorias.js'
import articulos from '#ecommerce/rArticulos.js'
import derecho_arcos from '#ecommerce/rDerechoArcos.js'
import izipay from '#ecommerce/rIzipay.js'
import libro_reclamos from '#ecommerce/rLibroReclamos.js'
import socio_pedidos from '#ecommerce/rSocioPedidos.js'
import ubigeos from '#core/ubigeos/rUbigeos.js'
import auth from '#ecommerce/auth/rAuth.js'

import accounts from '#ecommerce/accounts/rAccounts.js'

const router = Router()

router.use('/ecommerce/sistema', sistema)

router.use('/ecommerce/lineas', addEmpresaId, lineas)
router.use('/ecommerce/categorias', addEmpresaId, categorias)
router.use('/ecommerce/productos', addEmpresaId, articulos)
router.use('/ecommerce/insumos', addEmpresaId, articulos)
router.use('/ecommerce/arco', derecho_arcos)
router.use('/ecommerce/izipay', addEmpresaId, izipay)
router.use('/ecommerce/libro-reclamos', libro_reclamos)
router.use('/ecommerce/pedidos', addEmpresaId, socio_pedidos)
router.use('/ecommerce/ubigeos', addEmpresaId, ubigeos)
router.use('/ecommerce/auth', auth)

router.use('/ecommerce', verifyToken)
router.use('/ecommerce/account', accounts)

export default router