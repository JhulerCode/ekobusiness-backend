import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Socio } from './Socio.js'

export const Inspeccion = sequelize.define('inspecciones', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fecha: { type: DataTypes.DATEONLY }, //required
    socio: { type: DataTypes.STRING }, //required
    puntuacion: { type: DataTypes.STRING },
    puntuacion_maxima: { type: DataTypes.STRING },
    correcciones: { type: DataTypes.JSON }, //required
    documento: { type: DataTypes.STRING },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Socio.hasMany(Inspeccion, { foreignKey: 'socio', as: 'inspecciones', onDelete: 'RESTRICT' })
Inspeccion.belongsTo(Socio, { foreignKey: 'socio', as: 'socio1' })