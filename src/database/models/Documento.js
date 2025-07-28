import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Colaborador } from './Colaborador.js'
import { tzDate } from '@formkit/tempo'

export const Documento = sequelize.define('documentos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.STRING }, //required
    nombre: { type: DataTypes.STRING },
    descripcion: { type: DataTypes.STRING },

    denominacion_legal: { type: DataTypes.STRING },
    denominacion_comercial: { type: DataTypes.STRING },
    registro_sanitario: { type: DataTypes.STRING },

    fecha_emision: { type: DataTypes.DATEONLY }, //required
    fecha_vencimiento: { type: DataTypes.DATEONLY }, //required
    recordar_dias: { type: DataTypes.INTEGER }, //required

    file_name: { type: DataTypes.STRING },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },

    estado: {
        type: DataTypes.VIRTUAL,
        get() {
            const fechaVencimiento = this.getDataValue('fecha_vencimiento')
            const recordarDias = this.getDataValue('recordar_dias')

            if (!fechaVencimiento || recordarDias == null) return null

            const hoy = tzDate(new Date(), 'America/Lima')
            hoy.setHours(10, 0, 0, 0)

            const vencimiento = new Date(`${fechaVencimiento} 10:00:00`)
            const fechaRecordatorio = new Date(vencimiento)
            fechaRecordatorio.setDate(vencimiento.getDate() - recordarDias)

            if (hoy > vencimiento) {
                return 0
            } else if (
                hoy.getFullYear() === vencimiento.getFullYear() &&
                hoy.getMonth() === vencimiento.getMonth() &&
                hoy.getDate() === vencimiento.getDate()
            ) {
                return 0.1
            } else if (hoy >= fechaRecordatorio) {
                return 1
            } else {
                return 2
            }
        }
    }
})

Colaborador.hasMany(Documento, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Documento.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Documento, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Documento.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })