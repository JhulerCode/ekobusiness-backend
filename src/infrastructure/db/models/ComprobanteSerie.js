import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Empresa } from './Empresa.js'
import { Colaborador } from './Colaborador.js'
import { arrayMap } from '#store/system.js'

export const ComprobanteSerie = sequelize.define('comprobante_series', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.STRING },
    serie: { type: DataTypes.STRING },
    correlativo_inicio: { type: DataTypes.INTEGER },
    correlativo: { type: DataTypes.INTEGER },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },

    tipo1: {
        type: DataTypes.VIRTUAL,
        get() {
            const tipo = this.tipo || ''
            const comprobante_tiposMap = arrayMap('comprobante_tipos')
            return comprobante_tiposMap[tipo]
        },
    },
    tipo1_serie: {
        type: DataTypes.VIRTUAL,
        get() {
            const tipo = this.tipo || ''
            const comprobante_tiposMap = arrayMap('comprobante_tipos')
            const serie = this.serie || ''
            return `${comprobante_tiposMap[tipo]?.nombre} (${serie})`.trim()
        },
    },

    nombre: { type: DataTypes.STRING }, //eliminar
    activo: { type: DataTypes.BOOLEAN, defaultValue: false }, //eliminar
    estandar: { type: DataTypes.BOOLEAN, defaultValue: false }, //eliminar
})

Empresa.hasMany(ComprobanteSerie, {
    foreignKey: 'empresa',
    as: 'pago_comprobantes',
    onDelete: 'RESTRICT',
})
ComprobanteSerie.belongsTo(Empresa, { foreignKey: 'empresa', as: 'empresa1' })

Colaborador.hasMany(ComprobanteSerie, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
ComprobanteSerie.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(ComprobanteSerie, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
ComprobanteSerie.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
