import { DataTypes } from 'sequelize'
import sequelize from '../sequelize.js'
import { ArticuloLinea } from './ArticuloLinea.js'
import { ArticuloCategoria } from './ArticuloCategoria.js'
import { Colaborador } from './Colaborador.js'

export const Articulo = sequelize.define('articulos', {
    //--- IDENTIFICACIÓN ---//
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.STRING }, //required
    code: { type: DataTypes.STRING },
    codigo_barra: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING }, //required
    purchase_ok: { type: DataTypes.BOOLEAN }, //required
    sale_ok: { type: DataTypes.BOOLEAN }, //required
    produce_ok: { type: DataTypes.BOOLEAN }, //required
    activo: { type: DataTypes.BOOLEAN, defaultValue: true }, //required

    //--- CARACTERISTICAS ---//
    unidad: { type: DataTypes.STRING }, //required
    categoria: { type: DataTypes.STRING }, //required //linked
    marca: { type: DataTypes.STRING },

    //--- INVENTARIO ---//
    tracking: { type: DataTypes.STRING }, //(none / lot / serial)

    //--- COMPRA ---//
    // product_supplierinfo (partner_id, min_qty, moneda, currency, lead_time)
    // product_supplier_taxes

    //--- VENTA ---//
    list_price: { type: DataTypes.DOUBLE },
    // product_supplier_taxes

    //--- ECOMMERCE ---//
    is_ecommerce: { type: DataTypes.BOOLEAN, defaultValue: false },
    descripcion: { type: DataTypes.TEXT },
    precio: { type: DataTypes.DOUBLE },
    precio_anterior: { type: DataTypes.DOUBLE },
    contenido_neto: { type: DataTypes.DOUBLE },
    dimenciones: { type: DataTypes.STRING },
    envase_tipo: { type: DataTypes.STRING },
    is_destacado: { type: DataTypes.BOOLEAN, defaultValue: false },
    fotos: { type: DataTypes.JSON, defaultValue: [] },
    ingredientes: { type: DataTypes.JSON, defaultValue: [] },
    beneficios: { type: DataTypes.JSON, defaultValue: [] },

    //--- PRODUCCIÓN ---//
    linea: { type: DataTypes.STRING },
    filtrantes: { type: DataTypes.INTEGER },

    //--- ELIMINAR ---//
    combo_articulos: { type: DataTypes.JSON, defaultValue: [] },
    tipo: { type: DataTypes.STRING },
    mp_tipo: { type: DataTypes.STRING },
    has_fv: { type: DataTypes.BOOLEAN },
    igv_afectacion: { type: DataTypes.STRING },

    empresa: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.STRING },
    updatedBy: { type: DataTypes.STRING },
})

ArticuloCategoria.hasMany(Articulo, {
    foreignKey: 'categoria',
    as: 'articulos',
    onDelete: 'RESTRICT',
})
Articulo.belongsTo(ArticuloCategoria, { foreignKey: 'categoria', as: 'categoria1' })

ArticuloLinea.hasMany(Articulo, { foreignKey: 'linea', as: 'articulos', onDelete: 'RESTRICT' })
Articulo.belongsTo(ArticuloLinea, { foreignKey: 'linea', as: 'linea1' })

Colaborador.hasMany(Articulo, { foreignKey: 'createdBy', onDelete: 'RESTRICT' })
Articulo.belongsTo(Colaborador, { foreignKey: 'createdBy', as: 'createdBy1' })
Colaborador.hasMany(Articulo, { foreignKey: 'updatedBy', onDelete: 'RESTRICT' })
Articulo.belongsTo(Colaborador, { foreignKey: 'updatedBy', as: 'updatedBy1' })
