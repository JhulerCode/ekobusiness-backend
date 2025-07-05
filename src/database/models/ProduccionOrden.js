import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Articulo } from './Articulo.js'
import { Maquina } from './Maquina.js'
import { Colaborador } from './Colaborador.js'

export const ProduccionOrden = sequelize.define('produccion_ordenes', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fecha: { type: DataTypes.DATEONLY },
    tipo: { type: DataTypes.STRING },
    orden: { type: DataTypes.INTEGER },

    maquina: { type: DataTypes.STRING }, //required //linked
    maquina_info: { type: DataTypes.JSON },

    articulo: { type: DataTypes.STRING }, //required //linked
    articulo_info: { type: DataTypes.JSON },
    cantidad: { type: DataTypes.DOUBLE },

    estado: { type: DataTypes.STRING },

    calidad_revisado: { type: DataTypes.STRING },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

Articulo.hasMany(ProduccionOrden, { foreignKey: 'articulo', as: 'produccion_ordenes', onDelete: 'RESTRICT' })
ProduccionOrden.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

Maquina.hasMany(ProduccionOrden, { foreignKey: 'maquina', as: 'produccion_ordenes', onDelete: 'RESTRICT' })
ProduccionOrden.belongsTo(Maquina, { foreignKey: 'maquina', as: 'maquina1' })

Colaborador.hasMany(ProduccionOrden, {foreignKey:'createdBy', onDelete:'RESTRICT'})
ProduccionOrden.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(ProduccionOrden, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
ProduccionOrden.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})