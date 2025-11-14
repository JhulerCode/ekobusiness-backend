import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { ArticuloCategoria } from './ArticuloCategoria.js'
import { ArticuloLinea } from './ArticuloLinea.js'
import { Colaborador } from './Colaborador.js'

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
    mp_tipo: { type: DataTypes.STRING },
    produccion_tipo: { type: DataTypes.STRING },
    filtrantes: { type: DataTypes.INTEGER },
    contenido_neto: { type: DataTypes.DOUBLE },
    
    is_combo: { type: DataTypes.BOOLEAN },
    combo_articulos: { type: DataTypes.JSON },

    is_ecommerce: { type: DataTypes.BOOLEAN, defaultValue: false },
    descripcion: { type: DataTypes.TEXT },
    precio: { type: DataTypes.DOUBLE },
    precio_anterior: { type: DataTypes.DOUBLE },
    fotos: { type: DataTypes.JSON, defaultValue: [] },
    dimenciones: { type: DataTypes.STRING },
    envase_tipo: { type: DataTypes.STRING },
    ingredientes: { type: DataTypes.JSON, defaultValue: [] },
    beneficios: { type: DataTypes.JSON, defaultValue: [] },

    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING }
})

ArticuloCategoria.hasMany(Articulo, { foreignKey: 'categoria', as: 'articulos', onDelete: 'RESTRICT' })
Articulo.belongsTo(ArticuloCategoria, { foreignKey: 'categoria', as: 'categoria1' })

ArticuloLinea.hasMany(Articulo, { foreignKey: 'produccion_tipo', as: 'articulos', onDelete: 'RESTRICT' })
Articulo.belongsTo(ArticuloLinea, { foreignKey: 'produccion_tipo', as: 'produccion_tipo1' })

Colaborador.hasMany(Articulo, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Articulo.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Articulo, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Articulo.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })