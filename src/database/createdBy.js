import { Articulo } from './models/Articulo.js'
import { ArticuloCategoria } from './models/ArticuloCategoria.js'
import { CajaApertura } from './models/CajaApertura.js'
import { CajaMovimiento } from './models/CajaMovimiento.js'
import { Colaborador } from './models/Colaborador.js'
import { CuarentenaProducto } from './models/CuarentenaProducto.js'
import { Documento } from './models/Documento.js'
import { FormatoValue } from './models/FormatoValue.js'
import { Inspeccion } from './models/Inspeccion.js'
import { Maquina } from './models/Maquina.js'
import { Moneda } from './models/Moneda.js'
import { PrecioLista } from './models/PrecioLista.js'
import { PrecioListaItem } from './models/PrecioListaItem.js'
import { ProduccionOrden } from './models/ProduccionOrden.js'
import { RecetaInsumo } from './models/RecetaInsumo.js'
import { Socio } from './models/Socio.js'
import { SocioPedido } from './models/SocioPedido.js'
import { TipoCambio } from './models/TipoCambio.js'
import { Transaccion } from './models/Transaccion.js'

Colaborador.hasMany(ArticuloCategoria, {foreignKey:'createdBy', onDelete:'RESTRICT'})
ArticuloCategoria.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(ArticuloCategoria, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
ArticuloCategoria.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(Articulo, {foreignKey:'createdBy', onDelete:'RESTRICT'})
Articulo.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(Articulo, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
Articulo.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(PrecioLista, {foreignKey:'createdBy', onDelete:'RESTRICT'})
PrecioLista.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(PrecioLista, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
PrecioLista.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(PrecioListaItem, {foreignKey:'createdBy', onDelete:'RESTRICT'})
PrecioListaItem.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(PrecioListaItem, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
PrecioListaItem.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(Transaccion, {foreignKey:'createdBy', onDelete:'RESTRICT'})
Transaccion.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(Transaccion, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
Transaccion.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(Socio, {foreignKey:'createdBy', onDelete:'RESTRICT'})
Socio.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(Socio, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
Socio.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(SocioPedido, {foreignKey:'createdBy', onDelete:'RESTRICT'})
SocioPedido.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(SocioPedido, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
SocioPedido.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(ProduccionOrden, {foreignKey:'createdBy', onDelete:'RESTRICT'})
ProduccionOrden.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(ProduccionOrden, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
ProduccionOrden.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(CuarentenaProducto, {foreignKey:'createdBy', onDelete:'RESTRICT'})
CuarentenaProducto.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(CuarentenaProducto, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
CuarentenaProducto.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(CajaApertura, {foreignKey:'createdBy', onDelete:'RESTRICT'})
CajaApertura.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(CajaApertura, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
CajaApertura.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(CajaMovimiento, {foreignKey:'createdBy', onDelete:'RESTRICT'})
CajaMovimiento.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(CajaMovimiento, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
CajaMovimiento.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(Documento, {foreignKey:'createdBy', onDelete:'RESTRICT'})
Documento.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(Documento, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
Documento.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(Inspeccion, {foreignKey:'createdBy', onDelete:'RESTRICT'})
Inspeccion.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(Inspeccion, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
Inspeccion.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(Maquina, {foreignKey:'createdBy', onDelete:'RESTRICT'})
Maquina.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(Maquina, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
Maquina.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(Moneda, {foreignKey:'createdBy', onDelete:'RESTRICT'})
Moneda.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(Moneda, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
Moneda.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(TipoCambio, {foreignKey:'createdBy', onDelete:'RESTRICT'})
TipoCambio.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(TipoCambio, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
TipoCambio.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(RecetaInsumo, {foreignKey:'createdBy', onDelete:'RESTRICT'})
RecetaInsumo.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(RecetaInsumo, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
RecetaInsumo.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})

Colaborador.hasMany(FormatoValue, {foreignKey:'createdBy', onDelete:'RESTRICT'})
FormatoValue.belongsTo(Colaborador, {foreignKey:'createdBy', as:'createdBy1'})
Colaborador.hasMany(FormatoValue, {foreignKey:'updatedBy', onDelete:'RESTRICT'})
FormatoValue.belongsTo(Colaborador, {foreignKey:'updatedBy', as:'updatedBy1'})