import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'

export const Maquina = sequelize.define('maquinas', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.STRING }, //required
    codigo: { type: DataTypes.STRING }, //required
    nombre: { type: DataTypes.STRING }, //required
    
    produccion_tipo: { type: DataTypes.STRING }, //required
    velocidad: { type: DataTypes.DOUBLE },
    limpieza_tiempo: { type: DataTypes.DOUBLE },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})