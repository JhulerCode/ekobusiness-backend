import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Empresa } from './Empresa.js'
import { Colaborador } from './Colaborador.js'
import { Moneda } from './Moneda.js'
import { formatDateOnly } from '#shared/dayjs.js'
import { arrayMap } from '#store/system.js'
import dayjs from '#shared/dayjs.js'

const systemMaps = {
    suscripcion_estados: arrayMap('suscripcion_estados'),
}

export const Suscripcion = sequelize.define('suscripciones', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    plan_nombre: { type: DataTypes.STRING, allowNull: false },
    periodo: { type: DataTypes.STRING, defaultValue: 'mensual' },
    limite_usuarios: { type: DataTypes.INTEGER, defaultValue: 1 },
    precio: { type: DataTypes.DOUBLE, defaultValue: 0 },
    moneda: { type: DataTypes.STRING },
    fecha_inicio: { type: DataTypes.DATEONLY },
    fecha_inicio1: {
        type: DataTypes.VIRTUAL,
        get() {
            return formatDateOnly(this.getDataValue('fecha_inicio'))
        },
    },
    fecha_vencimiento: { type: DataTypes.DATEONLY },
    fecha_vencimiento1: {
        type: DataTypes.VIRTUAL,
        get() {
            return formatDateOnly(this.getDataValue('fecha_vencimiento'))
        },
    },
    // fecha_ultimo_pago: { type: DataTypes.DATEONLY },
    // prox_fecha_pago: { type: DataTypes.DATEONLY },
    // prox_fecha_pago1: {
    //     type: DataTypes.VIRTUAL,
    //     get() {
    //         return formatDateOnly(this.getDataValue('prox_fecha_pago'))
    //     },
    // },
    estado: {
        type: DataTypes.VIRTUAL,
        get() {
            const fechaVencimiento = this.getDataValue('fecha_vencimiento')
            if (!fechaVencimiento) return 'VENCIDO'

            const hoy = dayjs().startOf('day')
            const vencimiento = dayjs(fechaVencimiento).startOf('day')
            const diff = vencimiento.diff(hoy, 'day')

            if (diff < 0) return 'VENCIDO'
            if (diff <= 10) return 'POR VENCER'
            return 'ACTIVO'
        },
    },
    estado1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.suscripcion_estados[this.estado]
        },
    },
    observaciones: { type: DataTypes.TEXT },
    // autorenovar: { type: DataTypes.BOOLEAN, defaultValue: true },
    // metadata: { type: DataTypes.JSON, defaultValue: {} },

    empresa: { type: DataTypes.STRING, allowNull: false },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Moneda.hasMany(Suscripcion, { foreignKey: 'moneda', as: 'suscripciones', onDelete: 'RESTRICT' })
Suscripcion.belongsTo(Moneda, { foreignKey: 'moneda', as: 'moneda1' })

Empresa.hasMany(Suscripcion, { foreignKey: 'empresa', as: 'suscripciones', onDelete: 'RESTRICT' })
Suscripcion.belongsTo(Empresa, { foreignKey: 'empresa', as: 'empresa1' })

Colaborador.hasMany(Suscripcion, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Suscripcion.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })

Colaborador.hasMany(Suscripcion, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Suscripcion.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
