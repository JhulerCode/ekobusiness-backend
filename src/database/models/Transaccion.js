import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Socio } from './Socio.js'
import { Articulo } from './Articulo.js'
import { Moneda } from './Moneda.js'
import { SocioPedido } from './SocioPedido.js'
import { ProduccionOrden } from './ProduccionOrden.js'

export const Transaccion = sequelize.define('transacciones', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.TINYINT }, //required COMPRA(1) O VENTA(2)
    fecha: { type: DataTypes.DATEONLY }, //required

    has_pedido: { type: DataTypes.BOOLEAN }, //required
    socio_pedido: { type: DataTypes.STRING }, //required //linked
    socio: { type: DataTypes.STRING }, //required //linked
    guia: { type: DataTypes.STRING }, //required
    factura: { type: DataTypes.STRING }, //required

    pago_condicion: { type: DataTypes.STRING }, //required
    moneda: { type: DataTypes.STRING }, //required //linked
    tipo_cambio: { type: DataTypes.STRING }, //required
    monto: { type: DataTypes.DOUBLE }, //required

    produccion_orden: { type: DataTypes.STRING }, //required

    observacion: { type: DataTypes.STRING },
    estado: { type: DataTypes.STRING },

    anulado_motivo: { type: DataTypes.STRING },

    calidad_revisado_despacho: { type: DataTypes.STRING },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

SocioPedido.hasMany(Transaccion, { foreignKey: 'socio_pedido', as: 'transacciones', onDelete: 'RESTRICT' })
Transaccion.belongsTo(SocioPedido, { foreignKey: 'socio_pedido', as: 'socio_pedido1' })

Socio.hasMany(Transaccion, { foreignKey: 'socio', as: 'transacciones', onDelete: 'RESTRICT' })
Transaccion.belongsTo(Socio, { foreignKey: 'socio', as: 'socio1' })

ProduccionOrden.hasMany(Transaccion, { foreignKey: 'produccion_orden', as: 'transacciones', onDelete: 'RESTRICT' })
Transaccion.belongsTo(ProduccionOrden, { foreignKey: 'produccion_orden', as: 'produccion_orden1' })

Moneda.hasMany(Transaccion, { foreignKey: 'moneda', as: 'transacciones', onDelete: 'RESTRICT' })
Transaccion.belongsTo(Moneda, { foreignKey: 'moneda', as: 'moneda1' })



export const TransaccionItem = sequelize.define('transaccion_items', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    articulo: { type: DataTypes.STRING }, //required //linked

    cantidad: { type: DataTypes.DOUBLE }, //required

    moneda: { type: DataTypes.STRING }, //required //linked
    tipo_cambio: { type: DataTypes.DOUBLE }, //required
    pu: { type: DataTypes.DOUBLE }, //required
    igv_afectacion: { type: DataTypes.STRING }, //required
    igv_porcentaje: { type: DataTypes.DOUBLE }, //required

    fv: { type: DataTypes.DATEONLY },
    lote: { type: DataTypes.STRING },

    is_lote_padre: { type: DataTypes.BOOLEAN }, //required //linked
    stock: { type: DataTypes.DOUBLE },

    calidad_revisado: { type: DataTypes.STRING },

    lote_padre: { type: DataTypes.STRING }, //required //linked
    transaccion: { type: DataTypes.STRING }, //required //linked
})

Articulo.hasMany(TransaccionItem, { foreignKey: 'articulo', as: 'transaccion_items', onDelete: 'RESTRICT' })
TransaccionItem.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

TransaccionItem.hasMany(TransaccionItem, { foreignKey: 'lote_padre', as: 'lote_padre_items', onDelete: 'RESTRICT' })
TransaccionItem.belongsTo(TransaccionItem, { foreignKey: 'lote_padre', as: 'lote_padre1' })

Transaccion.hasMany(TransaccionItem, { foreignKey: 'transaccion', as: 'transaccion_items', onDelete: 'RESTRICT' })
TransaccionItem.belongsTo(Transaccion, { foreignKey: 'transaccion', as: 'transaccion1' })

Moneda.hasMany(TransaccionItem, { foreignKey: 'moneda', as: 'transaccion_items', onDelete: 'RESTRICT' })
TransaccionItem.belongsTo(Moneda, { foreignKey: 'moneda', as: 'moneda1' })