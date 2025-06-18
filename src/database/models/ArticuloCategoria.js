import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'

export const ArticuloCategoria = sequelize.define('articulo_categorias', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tipo: { type: DataTypes.STRING },
    nombre: { type: DataTypes.STRING }, //required
    descripcion: { type: DataTypes.STRING },
    activo: { type: DataTypes.BOOLEAN }, //required

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})