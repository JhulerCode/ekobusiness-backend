import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Socio } from './Socio.js'
import { Moneda } from './Moneda.js'
import { Articulo } from './Articulo.js'
import { Colaborador } from './Colaborador.js'

export const SocioPedido = sequelize.define('socio_pedidos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.SMALLINT }, //required
    fecha: { type: DataTypes.DATEONLY }, //required
    codigo: { type: DataTypes.STRING }, //required

    socio: { type: DataTypes.STRING }, //required //linked
    socio_datos: { type: DataTypes.JSON },
    contacto: { type: DataTypes.STRING }, //linked
    contacto_datos: { type: DataTypes.JSON },

    pago_condicion: { type: DataTypes.STRING }, //required
    moneda: { type: DataTypes.STRING }, //required //linked
    tipo_cambio: { type: DataTypes.STRING }, //required
    monto: { type: DataTypes.DOUBLE }, //required

    direccion_entrega: { type: DataTypes.STRING }, //required

    observacion: { type: DataTypes.STRING },
    estado: { type: DataTypes.STRING }, //required

    anulado_motivo: { type: DataTypes.STRING },
    empresa_datos: { type: DataTypes.JSON },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Socio.hasMany(SocioPedido, { foreignKey: 'socio', as: 'socio_pedidos', onDelete: 'RESTRICT' })
SocioPedido.belongsTo(Socio, { foreignKey: 'socio', as: 'socio1' })

Moneda.hasMany(SocioPedido, { foreignKey: 'moneda', as: 'socio_pedidos', onDelete: 'RESTRICT' })
SocioPedido.belongsTo(Moneda, { foreignKey: 'moneda', as: 'moneda1' })


export const SocioPedidoItem = sequelize.define('socio_pedido_items', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    articulo: { type: DataTypes.STRING }, //required //linked
    nombre: { type: DataTypes.STRING }, //required
    unidad: { type: DataTypes.STRING }, //required
    has_fv: { type: DataTypes.BOOLEAN }, //required

    cantidad: { type: DataTypes.DOUBLE }, //required
    entregado: { type: DataTypes.DOUBLE, defaultValue: 0 },

    pu: { type: DataTypes.DOUBLE }, //required
    igv_afectacion: { type: DataTypes.STRING },
    igv_porcentaje: { type: DataTypes.DOUBLE },

    nota: { type: DataTypes.STRING },

    socio_pedido: { type: DataTypes.STRING }, //required //linked
})

Articulo.hasMany(SocioPedidoItem, { foreignKey: 'articulo', as: 'socio_pedido_items', onDelete: 'RESTRICT' })
SocioPedidoItem.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

SocioPedido.hasMany(SocioPedidoItem, { foreignKey: 'socio_pedido', as: 'socio_pedido_items', onDelete: 'RESTRICT' })
SocioPedidoItem.belongsTo(SocioPedido, { foreignKey: 'socio_pedido', as: 'socio_pedido1' })

Colaborador.hasMany(SocioPedido, {foreignKey:'createdBy', onDelete:'RESTRICT'})
SocioPedido.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(SocioPedido, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
SocioPedido.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})