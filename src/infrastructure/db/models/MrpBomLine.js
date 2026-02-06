import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { Articulo } from './Articulo.js'
import { MrpBom } from './MrpBom.js'
import { Colaborador } from './Colaborador.js'

export const MrpBomLine = sequelize.define('mrp_bom_lines', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    articulo: { type: DataTypes.STRING }, //required //linked
    cantidad: { type: DataTypes.DOUBLE }, //required
    orden: { type: DataTypes.INTEGER }, //required

    mrp_bom: { type: DataTypes.STRING }, //required //linked
    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

Articulo.hasMany(MrpBomLine, { foreignKey: 'articulo', as: 'mrp_bom_lines', onDelete: 'RESTRICT' })
MrpBomLine.belongsTo(Articulo, { foreignKey: 'articulo', as: 'articulo1' })

MrpBom.hasMany(MrpBomLine, { foreignKey: 'mrp_bom', as: 'mrp_bom_lines', onDelete: 'RESTRICT' })
MrpBomLine.belongsTo(MrpBom, { foreignKey: 'mrp_bom', as: 'mrp_bom1' })

Colaborador.hasMany(MrpBomLine, {foreignKey:'createdBy', onDelete:'RESTRICT'})
MrpBomLine.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(MrpBomLine, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
MrpBomLine.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})