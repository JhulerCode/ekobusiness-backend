import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Socio } from './Socio.js'
import { Moneda } from './Moneda.js'
import { Articulo } from './Articulo.js'
import { Colaborador } from './Colaborador.js'
import { arrayMap } from '#store/system.js'

const systemMaps = {
    pedido_estados: arrayMap('pedido_estados'),
    estados: arrayMap('estados'),
    entrega_tipos: arrayMap('entrega_tipos'),
    pago_condiciones: arrayMap('pago_condiciones'),
    pago_metodos: arrayMap('pago_metodos'),
    comprobante_tipos: arrayMap('comprobante_tipos'),
}

export const SocioPedido = sequelize.define('socio_pedidos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.SMALLINT }, //required
    origin: { type: DataTypes.STRING }, //required
    fecha: { type: DataTypes.DATEONLY }, //required
    codigo: { type: DataTypes.STRING }, //required
    is_maquila: { type: DataTypes.BOOLEAN }, //required

    socio: { type: DataTypes.STRING }, //required //linked
    socio_datos: { type: DataTypes.JSON },
    contacto: { type: DataTypes.STRING }, //linked
    contacto_datos: { type: DataTypes.JSON },

    moneda: { type: DataTypes.STRING }, //required //linked
    monto: { type: DataTypes.DOUBLE }, //required

    estado: { type: DataTypes.STRING, defaultValue: '1' }, //required
    estado1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.pedido_estados[this.getDataValue('estado')]
        },
    },
    pagado: { type: DataTypes.BOOLEAN, defaultValue: false },
    pagado1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.estados[this.getDataValue('pagado')]
        },
    },
    listo: { type: DataTypes.BOOLEAN, defaultValue: false },
    listo1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.estados[this.getDataValue('listo')]
        },
    },
    entregado: { type: DataTypes.BOOLEAN, defaultValue: false },
    entregado1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.estados[this.getDataValue('entregado')]
        },
    },

    //--- ENTREGA ---//
    entrega_tipo: { type: DataTypes.STRING }, //required
    entrega_tipo1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.entrega_tipos[this.getDataValue('entrega_tipo')]
        },
    },
    fecha_entrega: { type: DataTypes.DATEONLY }, //required
    entrega_ubigeo: { type: DataTypes.STRING }, //required
    direccion_entrega: { type: DataTypes.STRING }, //required
    entrega_direccion_datos: { type: DataTypes.JSON, defaultValue: {} }, //required
    entrega_costo: { type: DataTypes.DOUBLE }, //required

    //--- PAGO ---//
    pago_condicion: { type: DataTypes.STRING }, //required
    pago_condicion1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.pago_condiciones[this.getDataValue('pago_condicion')]
        },
    },
    pago_metodo: { type: DataTypes.STRING }, //required
    pago_metodo1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.pago_metodos[this.getDataValue('pago_metodo')]
        },
    },
    pago_id: { type: DataTypes.STRING },

    comprobante_tipo: { type: DataTypes.STRING }, //required
    comprobante_tipo1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.comprobante_tipos[this.getDataValue('comprobante_tipo')]
        },
    },
    comprobante_ruc: { type: DataTypes.STRING }, //required
    comprobante_razon_social: { type: DataTypes.STRING }, //required

    etapas: { type: DataTypes.JSON, defaultValue: [] },
    observacion: { type: DataTypes.STRING },
    anulado_motivo: { type: DataTypes.STRING },
    empresa_datos: { type: DataTypes.JSON },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Socio.hasMany(SocioPedido, { foreignKey: 'socio', as: 'socio_pedidos', onDelete: 'RESTRICT' })
SocioPedido.belongsTo(Socio, { foreignKey: 'socio', as: 'socio1' })

Moneda.hasMany(SocioPedido, { foreignKey: 'moneda', as: 'socio_pedidos', onDelete: 'RESTRICT' })
SocioPedido.belongsTo(Moneda, { foreignKey: 'moneda', as: 'moneda1' })

export const SocioPedidoItem = sequelize.define('socio_pedido_items', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    orden: { type: DataTypes.INTEGER }, //required
    articulo: { type: DataTypes.STRING }, //required //linked
    nombre: { type: DataTypes.STRING }, //required
    unidad: { type: DataTypes.STRING }, //required
    has_fv: { type: DataTypes.BOOLEAN }, //required

    cantidad: { type: DataTypes.DOUBLE }, //required
    entregado: { type: DataTypes.DOUBLE, defaultValue: 0 },

    pu: { type: DataTypes.DOUBLE }, //required
    igv_afectacion: { type: DataTypes.STRING },
    igv_porcentaje: { type: DataTypes.DOUBLE },

    blend_datos: { type: DataTypes.JSON },
    nota: { type: DataTypes.STRING },

    socio_pedido: { type: DataTypes.STRING }, //required //linked

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Articulo.hasMany(SocioPedidoItem, {
    foreignKey: 'articulo',
    as: 'socio_pedido_items',
    onDelete: 'RESTRICT',
})
SocioPedidoItem.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

SocioPedido.hasMany(SocioPedidoItem, {
    foreignKey: 'socio_pedido',
    as: 'socio_pedido_items',
    onDelete: 'RESTRICT',
})
SocioPedidoItem.belongsTo(SocioPedido, { foreignKey: 'socio_pedido', as: 'socio_pedido1' })

Colaborador.hasMany(SocioPedido, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
SocioPedido.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(SocioPedido, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
SocioPedido.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
