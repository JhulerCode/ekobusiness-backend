import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'
import { arrayMap } from '#store/system.js'
import { formatDate } from '#shared/dayjs.js'

const systemMaps = {
    caja_apertura_estados: arrayMap('caja_apertura_estados'),
}

export const CajaApertura = sequelize.define('cajas_aperturas', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fecha_apertura: { type: DataTypes.DATEONLY }, //required
    fecha_apertura1: {
        type: DataTypes.VIRTUAL,
        get() {
            return formatDate(this.getDataValue('fecha_apertura'))
        },
    },
    fecha_cierre: { type: DataTypes.DATEONLY }, //required
    fecha_cierre1: {
        type: DataTypes.VIRTUAL,
        get() {
            return formatDate(this.getDataValue('fecha_cierre'))
        },
    },
    monto_apertura: { type: DataTypes.DOUBLE }, //required
    monto_cierre: { type: DataTypes.DOUBLE }, //required
    estado: { type: DataTypes.STRING }, //required
    estado1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.caja_apertura_estados[this.getDataValue('estado')]
        },
    },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Colaborador.hasMany(CajaApertura, {foreignKey:'createdBy', onDelete:'RESTRICT'})
CajaApertura.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(CajaApertura, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
CajaApertura.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})