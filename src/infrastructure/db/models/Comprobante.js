import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Socio } from './Socio.js'
import { Articulo } from './Articulo.js'
import { ComprobanteSerie } from './ComprobanteSerie.js'
import { Empresa } from './Empresa.js'
import { Colaborador } from './Colaborador.js'

export const Comprobante = sequelize.define('comprobantes', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    es_interno: { type: DataTypes.BOOLEAN, defaultValue: false },
    socio: { type: DataTypes.STRING }, //related
    pago_condicion: { type: DataTypes.STRING },
    estado: { type: DataTypes.STRING },
    anulado_motivo: { type: DataTypes.STRING },

    empresa_datos: { type: DataTypes.JSON },
    socio_datos: { type: DataTypes.JSON },

    comprobante_serie: { type: DataTypes.STRING }, //related
    serie: { type: DataTypes.STRING },
    correlativo: { type: DataTypes.STRING },
    fecha_emision: { type: DataTypes.DATEONLY },
    hora_emision: { type: DataTypes.TIME },
    fecha_vencimiento: { type: DataTypes.STRING },
    moneda: { type: DataTypes.STRING },

    // sub_total_ventas: { type: DataTypes.DECIMAL(10, 2) },
    // anticipos: { type: DataTypes.DECIMAL(10, 2) },
    // descuentos: { type: DataTypes.DECIMAL(10, 2) },
    // valor_venta: { type: DataTypes.DECIMAL(10, 2) },
    // isc: { type: DataTypes.DECIMAL(10, 2) },
    // igv: { type: DataTypes.DECIMAL(10, 2) },
    // icbper: { type: DataTypes.DECIMAL(10, 2) },
    // otros_cargos: { type: DataTypes.DECIMAL(10, 2) },
    // otros_tributos: { type: DataTypes.DECIMAL(10, 2) },

    gravado: { type: DataTypes.DECIMAL(10, 2) },
    exonerado: { type: DataTypes.DECIMAL(10, 2) },
    inafecto: { type: DataTypes.DECIMAL(10, 2) },
    gratuito: { type: DataTypes.DECIMAL(10, 2) },
    descuentos: { type: DataTypes.DECIMAL(10, 2) },
    igv: { type: DataTypes.DECIMAL(10, 2) },
    isc: { type: DataTypes.DECIMAL(10, 2) },
    icbper: { type: DataTypes.DECIMAL(10, 2) },

    monto: { type: DataTypes.DECIMAL(10, 2) },
    nota: { type: DataTypes.STRING },

    sunat_respuesta_codigo: { type: DataTypes.STRING },
    sunat_respuesta_nota: { type: DataTypes.STRING },
    sunat_respuesta_descripcion: { type: DataTypes.STRING },
    hash: { type: DataTypes.STRING },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },

    serie_correlativo: {
        type: DataTypes.VIRTUAL,
        get() {
            return `${this.serie}-${this.numero}`
        },
    },
})

ComprobanteSerie.hasMany(Comprobante, {
    foreignKey: 'comprobante_serie',
    as: 'comprobantes',
    onDelete: 'RESTRICT',
})
Comprobante.belongsTo(ComprobanteSerie, {
    foreignKey: 'comprobante_serie',
    as: 'comprobante_serie1',
})

Socio.hasMany(Comprobante, { foreignKey: 'socio', as: 'comprobantes', onDelete: 'RESTRICT' })
Comprobante.belongsTo(Socio, { foreignKey: 'socio', as: 'socio1' })

// Asociaciones eliminadas de Transaccion.js aquí

Empresa.hasMany(Comprobante, { foreignKey: 'empresa', as: 'comprobantes', onDelete: 'RESTRICT' })
Comprobante.belongsTo(Empresa, { foreignKey: 'empresa', as: 'empresa1' })

Colaborador.hasMany(Comprobante, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Comprobante.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Comprobante, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Comprobante.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })

export const ComprobanteItem = sequelize.define('comprobante_items', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    articulo: { type: DataTypes.STRING }, //related
    descripcion: { type: DataTypes.STRING },
    codigo: { type: DataTypes.STRING },
    codigo_sunat: { type: DataTypes.STRING },
    unidad: { type: DataTypes.STRING },
    cantidad: { type: DataTypes.DOUBLE },

    pu: { type: DataTypes.DOUBLE }, // en caso no haya vu
    vu: { type: DataTypes.DOUBLE }, // en caso no haya pu
    descuento_tipo: { type: DataTypes.STRING },
    descuento_valor: { type: DataTypes.DOUBLE },

    igv_afectacion: { type: DataTypes.STRING },
    igv_porcentaje: { type: DataTypes.DOUBLE },
    isc_porcentaje: { type: DataTypes.DOUBLE },
    isc_monto_fijo_uni: { type: DataTypes.DOUBLE },
    has_bolsa_tax: { type: DataTypes.BOOLEAN },

    comprobante: { type: DataTypes.STRING }, //related
    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Articulo.hasMany(ComprobanteItem, {
    foreignKey: 'articulo',
    as: 'comprobante_items',
    onDelete: 'RESTRICT',
})
ComprobanteItem.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

Comprobante.hasMany(ComprobanteItem, {
    foreignKey: 'comprobante',
    as: 'comprobante_items',
    onDelete: 'RESTRICT',
})
ComprobanteItem.belongsTo(Comprobante, { foreignKey: 'comprobante', as: 'comprobante1' })

Empresa.hasMany(ComprobanteItem, {
    foreignKey: 'empresa',
    as: 'comprobante_items',
    onDelete: 'RESTRICT',
})
ComprobanteItem.belongsTo(Empresa, { foreignKey: 'empresa', as: 'empresa1' })

Colaborador.hasMany(ComprobanteItem, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
ComprobanteItem.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(ComprobanteItem, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
ComprobanteItem.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
