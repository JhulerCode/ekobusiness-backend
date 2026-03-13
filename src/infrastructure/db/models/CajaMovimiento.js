import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { CajaApertura } from './CajaApertura.js'
import { Colaborador } from './Colaborador.js'
import { arrayMap } from '#store/system.js'
import { formatDate } from '#shared/dayjs.js'

const systemMaps = {
    comprobante_tipos: arrayMap('comprobante_tipos'),
}

export const CajaMovimiento = sequelize.define('caja_movimientos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fecha: { type: DataTypes.DATEONLY }, //required
    fecha1: {
        type: DataTypes.VIRTUAL,
        get() {
            return formatDate(this.getDataValue('fecha'))
        },
    },
    tipo: { type: DataTypes.STRING }, //required
    comprobante_tipo: { type: DataTypes.STRING },
    comprobante_tipo1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.comprobante_tipos[this.getDataValue('comprobante_tipo')]
        },
    },
    comprobante_numero: { type: DataTypes.STRING },
    detalle: { type: DataTypes.STRING }, //required
    monto: { type: DataTypes.DOUBLE }, //required

    caja_apertura: { type: DataTypes.STRING }, //required linked

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

CajaApertura.hasMany(CajaMovimiento, { foreignKey: 'caja_apertura', as: 'caja_movimientos', onDelete: 'RESTRICT' })
CajaMovimiento.belongsTo(CajaApertura, { foreignKey: 'caja_apertura', as: 'caja_apertura1' })

Colaborador.hasMany(CajaMovimiento, {foreignKey:'createdBy', onDelete:'RESTRICT'})
CajaMovimiento.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(CajaMovimiento, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
CajaMovimiento.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})