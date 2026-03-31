import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'
import { Articulo } from './Articulo.js'
import { Transaccion, TransaccionItem } from './Transaccion.js'
import { ProduccionOrden } from './ProduccionOrden.js'
import { Maquina } from './Maquina.js'
import { Moneda } from './Moneda.js'
import { Lote } from './Lote.js'
import { Ubicacion } from './Ubicacion.js'
import { formatDateOnly } from '#shared/dayjs.js'
import { arrayMap } from '#store/system.js'

const systemMaps = {
    kardex_operaciones: arrayMap('kardex_operaciones'),
    pt_cuarentena_estados: arrayMap('pt_cuarentena_estados'),
}

export const Kardex = sequelize.define('kardexes', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.STRING },
    tipo1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.kardex_operaciones[this.getDataValue('tipo')]
        },
    },
    fecha: { type: DataTypes.DATEONLY },
    fecha1: {
        type: DataTypes.VIRTUAL,
        get() {
            return formatDateOnly(this.getDataValue('fecha'))
        },
    },
    articulo: { type: DataTypes.STRING },
    cantidad: { type: DataTypes.DECIMAL(10, 2) },
    cantidad1: {
        type: DataTypes.VIRTUAL,
        get() {
            const tipoInfo = systemMaps.kardex_operaciones[this.getDataValue('tipo')]
            return this.getDataValue('cantidad') * tipoInfo?.operacion
        },
    },

    lote_id: { type: DataTypes.STRING },
    origen: { type: DataTypes.STRING },
    destino: { type: DataTypes.STRING },

    observacion: { type: DataTypes.TEXT },
    transaccion: { type: DataTypes.STRING }, //linked
    transaccion_item: { type: DataTypes.STRING }, //linked

    produccion_orden: { type: DataTypes.STRING }, //linked
    maquina: { type: DataTypes.STRING }, // linked
    pt_cuarentena: { type: DataTypes.BOOLEAN },
    pt_cuarentena1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.pt_cuarentena_estados[this.getDataValue('pt_cuarentena')]
        },
    },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },

    /* --- DEPRECADO: MANTENIENDO PARA MIGRACIÓN --- */
    pu: { type: DataTypes.DOUBLE }, //required
    igv_afectacion: { type: DataTypes.STRING }, //required
    igv_porcentaje: { type: DataTypes.DOUBLE }, //required
    moneda: { type: DataTypes.STRING }, //required //linked
    tipo_cambio: { type: DataTypes.DOUBLE }, //required
    lote: { type: DataTypes.STRING },
    fv: { type: DataTypes.DATEONLY },
    fv1: {
        type: DataTypes.VIRTUAL,
        get() {
            return formatDateOnly(this.getDataValue('fv'))
        },
    },
    is_lote_padre: { type: DataTypes.BOOLEAN }, //required //linked
    stock: { type: DataTypes.DECIMAL(10, 2) }, //required
    lote_padre: { type: DataTypes.STRING }, //required //linked

    lote_fv_stock: {
        type: DataTypes.VIRTUAL,
        get() {
            const lote = this.lote
            const fv = this.fv
            const stock = this.stock

            if (fv) {
                const [año, mes, dia] = fv.split('-')
                const fecha_vencimiento = `${dia}-${mes}-${año}`
                return `${lote} | ${fecha_vencimiento} | ${stock}`
            } else {
                return `${lote} | ${stock}`
            }
        },
    },
    /* --- DEPRECADO: MANTENIENDO PARA MIGRACIÓN --- */
})

Articulo.hasMany(Kardex, { foreignKey: 'articulo', as: 'kardexes', onDelete: 'RESTRICT' })
Kardex.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

Moneda.hasMany(Kardex, { foreignKey: 'moneda', as: 'kardexes', onDelete: 'RESTRICT' })
Kardex.belongsTo(Moneda, { foreignKey: 'moneda', as: 'moneda1' })

Kardex.hasMany(Kardex, { foreignKey: 'lote_padre', as: 'lote_padre_items', onDelete: 'RESTRICT' })
Kardex.belongsTo(Kardex, { foreignKey: 'lote_padre', as: 'lote_padre1' })

Transaccion.hasMany(Kardex, { foreignKey: 'transaccion', as: 'kardexes', onDelete: 'RESTRICT' })
Kardex.belongsTo(Transaccion, { foreignKey: 'transaccion', as: 'transaccion1' })

TransaccionItem.hasMany(Kardex, {
    foreignKey: 'transaccion_item',
    as: 'kardexes',
    onDelete: 'RESTRICT',
})
Kardex.belongsTo(TransaccionItem, { foreignKey: 'transaccion_item', as: 'transaccion_item1' })

ProduccionOrden.hasMany(Kardex, {
    foreignKey: 'produccion_orden',
    as: 'kardexes',
    onDelete: 'RESTRICT',
})
Kardex.belongsTo(ProduccionOrden, { foreignKey: 'produccion_orden', as: 'produccion_orden1' })

Maquina.hasMany(Kardex, { foreignKey: 'maquina', as: 'kardexes', onDelete: 'RESTRICT' })
Kardex.belongsTo(Maquina, { foreignKey: 'maquina', as: 'maquina1' })

Colaborador.hasMany(Kardex, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Kardex.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Kardex, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Kardex.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })

Lote.hasMany(Kardex, { foreignKey: 'lote_id', as: 'kardexes', onDelete: 'RESTRICT' })
Kardex.belongsTo(Lote, { foreignKey: 'lote_id', as: 'lote1' })

Ubicacion.hasMany(Kardex, { foreignKey: 'origen', as: 'kardex_salidas', onDelete: 'RESTRICT' })
Kardex.belongsTo(Ubicacion, { foreignKey: 'origen', as: 'origen1' })

Ubicacion.hasMany(Kardex, { foreignKey: 'destino', as: 'kardex_entradas', onDelete: 'RESTRICT' })
Kardex.belongsTo(Ubicacion, { foreignKey: 'destino', as: 'destino1' })
