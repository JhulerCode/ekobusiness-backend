import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'
import { tzDate } from '@formkit/tempo'
import { arrayMap } from '#store/system.js'
import { formatDateOnly } from '#shared/dayjs.js'
import dayjs from '#shared/dayjs.js'

const systemMaps = {
    documentos_estados: arrayMap('documentos_estados'),
}

export const Documento = sequelize.define('documentos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.STRING }, //required
    nombre: { type: DataTypes.STRING },
    descripcion: { type: DataTypes.STRING },

    denominacion_legal: { type: DataTypes.STRING },
    denominacion_comercial: { type: DataTypes.STRING },
    registro_sanitario: { type: DataTypes.STRING },

    fecha_emision: { type: DataTypes.DATEONLY }, //required
    fecha_emision1: {
        type: DataTypes.VIRTUAL,
        get() {
            return formatDateOnly(this.getDataValue('fecha_emision'))
        },
    },
    fecha_vencimiento: { type: DataTypes.DATEONLY }, //required
    fecha_vencimiento1: {
        type: DataTypes.VIRTUAL,
        get() {
            return formatDateOnly(this.getDataValue('fecha_vencimiento'))
        },
    },
    recordar_dias: { type: DataTypes.INTEGER }, //required

    file: { type: DataTypes.JSON, defaultValue: {} },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },

    estado: {
        type: DataTypes.VIRTUAL,
        get() {
            const fechaVencimiento = this.getDataValue('fecha_vencimiento')
            const recordarDias = this.getDataValue('recordar_dias')

            if (!fechaVencimiento || recordarDias == null) return 'VENCIDO'

            const hoy = dayjs().startOf('day')
            const vencimiento = dayjs(fechaVencimiento).startOf('day')
            const diff = vencimiento.diff(hoy, 'day')

            if (diff < 0) return 'VENCIDO'
            if (diff == 0) return 'VENCE HOY'
            if (diff <= recordarDias) return 'POR VENCER'
            return 'VIGENTE'
        },
    },
    estado1: {
        type: DataTypes.VIRTUAL,
        get() {
            return systemMaps.documentos_estados[this.estado]
        },
    },
})

Colaborador.hasMany(Documento, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Documento.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Documento, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Documento.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
