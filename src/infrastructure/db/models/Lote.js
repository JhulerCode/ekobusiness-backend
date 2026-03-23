import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Articulo } from './Articulo.js'
import { Colaborador } from './Colaborador.js'

export const Lote = sequelize.define('lotes', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    articulo: { type: DataTypes.STRING }, // FK
    numero: { type: DataTypes.STRING }, // Código del lote (ej: LOT-001)
    fv: { type: DataTypes.DATEONLY }, // Fecha de vencimiento
    pu_compra: { type: DataTypes.DOUBLE }, // Precio unitario de compra (valorización)
    stock: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, // Stock actual del lote
    
    // Para multialmacén (esto se puede expandir luego a una tabla de Ubicaciones/Almacenes)
    almacen: { type: DataTypes.STRING }, 

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Articulo.hasMany(Lote, { foreignKey: 'articulo', as: 'lotes', onDelete: 'RESTRICT' })
Lote.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

Colaborador.hasMany(Lote, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Lote.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Lote, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Lote.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
