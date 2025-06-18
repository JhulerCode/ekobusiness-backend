import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { ArticuloCategoria } from './ArticuloCategoria.js'

export const Articulo = sequelize.define('articulos', {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    codigo_barra: { type: DataTypes.STRING },
    nombre: { type: DataTypes.STRING }, //required
    unidad: { type: DataTypes.STRING }, //required
    marca: { type: DataTypes.STRING },

    vende: { type: DataTypes.BOOLEAN }, //required
    has_fv: { type: DataTypes.BOOLEAN }, //required
    activo: { type: DataTypes.BOOLEAN }, //required

    igv_afectacion: { type: DataTypes.STRING }, //required

    tipo: { type: DataTypes.STRING }, //required
    categoria: { type: DataTypes.STRING }, //required //linked
    produccion_tipo: { type: DataTypes.STRING },
    filtrantes: { type: DataTypes.INTEGER },
    is_combo: { type: DataTypes.BOOLEAN },
    combo_articulos: { type: DataTypes.JSON },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

ArticuloCategoria.hasMany(Articulo, { foreignKey: 'categoria', as: 'articulos', onDelete: 'RESTRICT' })
Articulo.belongsTo(ArticuloCategoria, { foreignKey: 'categoria', as: 'categoria1' })