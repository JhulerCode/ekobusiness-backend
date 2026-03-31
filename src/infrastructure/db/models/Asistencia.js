import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'
import { formatDateOnly } from '#shared/dayjs.js'

export const Asistencia = sequelize.define('asistencias', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    colaborador: { type: DataTypes.STRING }, //required
    fecha_entrada: { type: DataTypes.DATEONLY }, //required
    fecha_entrada1: {
        type: DataTypes.VIRTUAL,
        get() {
            return formatDateOnly(this.getDataValue('fecha_entrada'))
        },
    },
    fecha_salida: { type: DataTypes.DATEONLY }, //required
    fecha_salida1: {
        type: DataTypes.VIRTUAL,
        get() {
            return formatDateOnly(this.getDataValue('fecha_salida'))
        },
    },
    hora_entrada: { type: DataTypes.STRING }, //required
    hora_salida: { type: DataTypes.STRING }, //required

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Colaborador.hasMany(Asistencia, { foreignKey: 'colaborador', onDelete: 'RESTRICT' })
Asistencia.belongsTo(Colaborador, { foreignKey: 'colaborador', as: 'colaborador1' })
