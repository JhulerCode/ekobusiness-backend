import { Router } from 'express'

import verifyVersion from '#http/middlewares/verifyVersion.js'
import verifyToken from '#http/middlewares/verifyToken.js'

import auth from '#core/_auth/rAuth.js'
import sistema from '#core/_sistema/rSistema.js'
import empresas from '#core/empresas/rEmpresas.js'

import activity_logs from '#core/activity_logs/rActivityLogs.js'
import articulo_lineas from '#core/articulo_lineas/rArticuloLineas.js'
import articulo_categorias from '#core/articulo_categorias/rArticuloCategorias.js'
import articulo_suppliers from '#core/articulo_suppliers/rArticuloSuppliers.js'
import articulos from '#core/articulos/rArticulos.js'
import asistencias from '#core/asistencias/rAsistencias.js'
import caja_aperturas from '#core/caja_aperturas/rCajaAperturas.js'
import caja_movimientos from '#core/caja_movimientos/rCajaMovimientos.js'
import colaboradores from '#core/colaboradores/rColaboradores.js'
import combo_componentes from '#core/combo_componentes/rComboComponentes.js'
import documentos from '#core/documentos/rDocumentos.js'
import formatos from '#core/formatos/rFormatos.js'
import formato_values from '#core/formato_values/rFormatoValues.js'
import helpdesk_tickets from '#core/helpdesk_tickets/rHelpdeskTickets.js'
import inspecciones from '#core/inspecciones/rInspecciones.js'
import kardex from '#core/kardex/rKardex.js'
import maquinas from '#core/maquinas/rMaquinas.js'
import monedas from '#core/monedas/rMonedas.js'
import mrp_boms from '#core/mrp_boms/rMrpBoms.js'
import mrp_bom_lines from '#core/mrp_bom_lines/rMrpBomLines.js'
import mrp_bom_socios from '#core/mrp_bom_socios/rMrpBomSocios.js'
import precio_listas from '#core/precio_listas/rPrecioListas.js'
import precio_lista_items from '#core/precio_lista_items/rPrecioListaItems.js'
import produccion_ordenes from '#core/produccion_ordenes/rProduccionOrdenes.js'
import sessions from '#core/sessions/rSessions.js'
import socio_pedidos from '#core/socio_pedidos/rSocioPedidos.js'
import socio_pedido_items from '#core/socio_pedido_items/rSocioPedidoItems.js'
import socios from '#core/socios/rSocios.js'
import tipo_cambios from '#core/tipo_cambios/rTipoCambios.js'
import transacciones from '#core/transacciones/rTransacciones.js'
import transaccion_items from '#core/transaccion_items/rTransaccionItems.js'
import ubigeos from '#core/ubigeos/rUbigeos.js'

const router = Router()

router.get('/', (req, res) => {
    res.send(`Eko Business's server is running`)
})

router.use('/api', verifyVersion)
router.use('/api/auth', auth)

router.use('/api', verifyToken)
router.use('/api/sistema', sistema)
router.use('/api/empresas', empresas)

router.use('/api/activity_logs', activity_logs)
router.use('/api/articulo_lineas', articulo_lineas)
router.use('/api/articulo_categorias', articulo_categorias)
router.use('/api/articulo_suppliers', articulo_suppliers)
router.use('/api/articulos', articulos)
router.use('/api/asistencias', asistencias)
router.use('/api/caja_aperturas', caja_aperturas)
router.use('/api/caja_movimientos', caja_movimientos)
router.use('/api/colaboradores', colaboradores)
router.use('/api/combo_componentes', combo_componentes)
router.use('/api/documentos', documentos)
router.use('/api/formatos', formatos)
router.use('/api/formato_values', formato_values)
router.use('/api/helpdesk_tickets', helpdesk_tickets)
router.use('/api/inspecciones', inspecciones)
router.use('/api/kardex', kardex)
router.use('/api/maquinas', maquinas)
router.use('/api/monedas', monedas)
router.use('/api/mrp_boms', mrp_boms)
router.use('/api/mrp_bom_lines', mrp_bom_lines)
router.use('/api/mrp_bom_socios', mrp_bom_socios)
router.use('/api/precio_listas', precio_listas)
router.use('/api/precio_lista_items', precio_lista_items)
router.use('/api/produccion_ordenes', produccion_ordenes)
router.use('/api/sessions', sessions)
router.use('/api/socios', socios)
router.use('/api/socio_pedidos', socio_pedidos)
router.use('/api/socio_pedido_items', socio_pedido_items)
router.use('/api/tipo_cambios', tipo_cambios)
router.use('/api/transacciones', transacciones)
router.use('/api/transaccion_items', transaccion_items)
router.use('/api/ubigeos', ubigeos)

export default router
