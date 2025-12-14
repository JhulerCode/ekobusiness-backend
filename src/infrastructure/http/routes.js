import { Router } from 'express'

import verifyVersion from './middlewares/verifyVersion.js'
import verifyToken from './middlewares/verifyToken.js'

import signin from '#core/_signin/signin.js'
import sistema from '#core/_sistema/rSistema.js'
import empresas from '#core/empresas/rEmpresas.js'

import activity_logs from '#core/activity_logs/rActivityLogs.js'
import articulo_lineas from '#core/articulo_lineas/rArticuloLineas.js'
import articulo_categorias from '#core/articulo_categorias/rArticuloCategorias.js'
import articulos from '#core/articulos/rArticulos.js'
import asistencias from '#core/asistencias/rAsistencias.js'
import caja_aperturas from '#core/caja_aperturas/rCajaAperturas.js'
import caja_movimientos from '#core/caja_movimientos/rCajaMovimientos.js'
import colaboradores from '#core/colaboradores/rColaboradores.js'
import documentos from '#core/documentos/rDocumentos.js'
import formatos from '#core/formatos/rFormatos.js'
import formato_values from '#core/formato_values/rFormatoValues.js'
import inspecciones from '#core/inspecciones/rInspecciones.js'
import kardex from '#core/kardex/rKardex.js'
import maquinas from '#core/maquinas/rMaquinas.js'
import monedas from '#core/monedas/rMonedas.js'
import precio_listas from '#core/precio_listas/rPrecioListas.js'
import precio_lista_items from '#core/precio_lista_items/rPrecioListaItems.js'
import produccion_ordenes from '#core/produccion_ordenes/rProduccionOrdenes.js'
import receta_insumos from '#core/receta_insumos/rRecetaInsumos.js'
import sessions from '#core/sessions/rSessions.js'
import socio_pedidos from '#core/socio_pedidos/rSocioPedidos.js'
import socio_pedido_items from '#core/socio_pedido_items/rSocioPedidoItems.js'
import socios from '#core/socios/rSocios.js'
import tipo_cambios from '#core/tipo_cambios/rTipoCambios.js'
import transacciones from '#core/transacciones/rTransacciones.js'

import store_lineas from '#core/store/rArticuloLineas.js'
import store_categorias from '#core/store/rArticuloCategorias.js'
import store_articulos from '#core/store/rArticulos.js'
import store_socios from '#core/store/rSocios.js'
import store_arcos from '#core/store/rArco.js'
import libro_reclamos from '#core/store/rLibroReclamos.js'
import store_auth from '#core/store/rAuth.js'
import izipay from '#core/store/rIzipay.js'
import store_socio_pedidos from '#core/store/rSocioPedidos.js'
import ubigeos from '#core/ubigeos/rUbigeos.js'

// import socios1 from '#core/socios/infrastructure/http/SocioRoutes.js'

const router = Router()

router.get('/', (req, res) => {
    res.send(`Eko Business's server is running`)
})

router.use('/signin', verifyVersion, signin)
router.use('/api', verifyVersion)
router.use('/api', verifyToken)

router.use('/api/sistema', sistema)
router.use('/api/empresas', empresas)

router.use('/api/activity_logs', activity_logs)
router.use('/api/articulo_lineas', articulo_lineas)
router.use('/api/articulo_categorias', articulo_categorias)
router.use('/api/articulos', articulos)
router.use('/api/asistencias', asistencias)
router.use('/api/caja_aperturas', caja_aperturas)
router.use('/api/caja_movimientos', caja_movimientos)
router.use('/api/colaboradores', colaboradores)
router.use('/api/documentos', documentos)
router.use('/api/formatos', formatos)
router.use('/api/formato_values', formato_values)
router.use('/api/inspecciones', inspecciones)
router.use('/api/kardex', kardex)
router.use('/api/maquinas', maquinas)
router.use('/api/monedas', monedas)
router.use('/api/precio_listas', precio_listas)
router.use('/api/precio_lista_items', precio_lista_items)
router.use('/api/produccion_ordenes', produccion_ordenes)
router.use('/api/receta_insumos', receta_insumos)
router.use('/api/sessions', sessions)
router.use('/api/socios', socios)
router.use('/api/socio_pedidos', socio_pedidos)
router.use('/api/socio_pedido_items', socio_pedido_items)
router.use('/api/tipo_cambios', tipo_cambios)
router.use('/api/transacciones', transacciones)
router.use('/api/ubigeos', ubigeos)

router.use('/store/sistema', sistema)
router.use('/store/lineas', store_lineas)
router.use('/store/categorias', store_categorias)
router.use('/store/productos', store_articulos)
router.use('/store/insumos', store_articulos)
router.use('/store/newsletter', store_socios)
router.use('/store/arco', store_arcos)
router.use('/store/libro-reclamos', libro_reclamos)
router.use('/store/ubigeos', ubigeos)
router.use('/store/izipay', izipay)
router.use('/store/socio-pedidos', store_socio_pedidos)
router.use('/store/auth', store_auth)
router.use('/store/account', verifyToken)
router.use('/store/account', store_auth)

export default router