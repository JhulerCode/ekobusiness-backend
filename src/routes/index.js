import signin from './_signin/signin.js'
import sistema from './_sistema/rSistema.js'
import verifyToken from '../middlewares/verifyToken.js'

import activity_logs from './activity_logs/rActivityLogs.js'
import articulo_lineas from './articulo_lineas/rArticuloLineas.js'
import articulo_categorias from './articulo_categorias/rArticuloCategorias.js'
import articulos from './articulos/rArticulos.js'
import caja_aperturas from './caja_aperturas/rCajaAperturas.js'
import caja_movimientos from './caja_movimientos/rCajaMovimientos.js'
import colaboradores from './colaboradores/rColaboradores.js'
import cuarentena_productos from './cuarentena_productos/rCuarentenaProductos.js'
import documentos from './documentos/rDocumentos.js'
import formatos from './formatos/rFormatos.js'
import formato_values from './formato_values/rFormatoValues.js'
import inspecciones from './inspecciones/rInspecciones.js'
import kardex from './kardex/rKardex.js'
import maquinas from './maquinas/rMaquinas.js'
import monedas from './monedas/rMonedas.js'
import precio_listas from './precio_listas/rPrecioListas.js'
import precio_lista_items from './precio_lista_items/rPrecioListaItems.js'
import produccion_ordenes from './produccion_ordenes/rProduccionOrdenes.js'
import receta_insumos from './receta_insumos/rRecetaInsumos.js'
import sessions from './sessions/rSessions.js'
import socio_pedidos from './socio_pedidos/rSocioPedidos.js'
import socio_pedido_items from './socio_pedido_items/rSocioPedidoItems.js'
import socios from './socios/rSocios.js'
import tipo_cambios from './tipo_cambios/rTipoCambios.js'
import transacciones from './transacciones/rTransacciones.js'

import store_lineas from './store/rArticuloLineas.js'
import store_categorias from './store/rArticuloCategorias.js'
import store_productos from './store/rArticulos.js'
import store_socios from './store/rSocios.js'
import store_arcos from './store/rArco.js'
import libro_reclamos from './store/rLibroReclamos.js'
import store_auth from './store/rAuth.js'
import izipay from './store/rIzipay.js'
import store_socio_pedidos from './store/rSocioPedidos.js'
import ubigeos from './ubigeos/rUbigeos.js'

function routes(app) {
    app.get('/', (req, res) => {
        // const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress
        res.send(`Eko Business's server is running`)
    })

    app.use('/signin', signin)
    app.use('/api', verifyToken)
    app.use('/api/activity_logs', activity_logs)
    app.use('/api/sistema', sistema)
    app.use('/api/articulo_categorias', articulo_categorias)
    app.use('/api/articulo_lineas', articulo_lineas)
    app.use('/api/articulos', articulos)
    app.use('/api/caja_aperturas', caja_aperturas)
    app.use('/api/caja_movimientos', caja_movimientos)
    app.use('/api/colaboradores', colaboradores)
    app.use('/api/cuarentena_productos', cuarentena_productos)
    app.use('/api/documentos', documentos)
    app.use('/api/formatos', formatos)
    app.use('/api/formato_values', formato_values)
    app.use('/api/inspecciones', inspecciones)
    app.use('/api/kardex', kardex)
    app.use('/api/maquinas', maquinas)
    app.use('/api/monedas', monedas)
    app.use('/api/precio_listas', precio_listas)
    app.use('/api/precio_lista_items', precio_lista_items)
    app.use('/api/produccion_ordenes', produccion_ordenes)
    app.use('/api/receta_insumos', receta_insumos)
    app.use('/api/sessions', sessions)
    app.use('/api/socios', socios)
    app.use('/api/socio_pedidos', socio_pedidos)
    app.use('/api/socio_pedido_items', socio_pedido_items)
    app.use('/api/tipo_cambios', tipo_cambios)
    app.use('/api/transacciones', transacciones)

    app.use('/store/sistema', sistema)
    app.use('/store/lineas', store_lineas)
    app.use('/store/categorias', store_categorias)
    app.use('/store/productos', store_productos)
    app.use('/store/newsletter', store_socios)
    app.use('/store/arco', store_arcos)
    app.use('/store/libro-reclamos', libro_reclamos)
    app.use('/store/ubigeos', ubigeos)
    app.use('/store/izipay', izipay)
    app.use('/store/socio-pedidos', store_socio_pedidos)
    app.use('/store/auth', store_auth)
    app.use('/store/account', verifyToken)
    app.use('/store/account', store_auth)
}

export default routes