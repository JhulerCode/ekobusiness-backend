import { Op } from 'sequelize'

async function existe(model, where, res, ms) {
    if (where.id) {
        where.id = { [Op.not]: where.id }
    }

    const result = await model.findAll({ where })

    if (result.length > 0) {
        res.json({ code: 1, msg: ms ? ms : 'El nombre ya existe' })
        return true
    }
}

function applyFilters(filters = {}) {
    const whereClause = {};

    // procesar todo lo que no sea "or"
    Object.keys(filters).forEach((key) => {
        if (key !== "or") {
            const { op, val, val1 } = filters[key];
            whereClause[key] = buildCondition({ op, val, val1 });
        }
    });

    // procesar OR si existe
    if (filters.or && typeof filters.or === "object") {
        const orConditions = Object.entries(filters.or).map(([field, cond]) => {
            return { [field]: buildCondition(cond) };
        });

        if (orConditions.length > 0) {
            whereClause[Op.or] = orConditions;
        }
    }

    return whereClause;
}

function buildCondition({ op, val, val1 }) {
    switch (op) {
        case "Es": return val;
        case "No es": return { [Op.ne]: val };
        case "Contiene": return { [Op.like]: `%${val}%` };
        case "No contiene": return { [Op.notLike]: `%${val}%` };
        case "Empieza con": return { [Op.like]: `${val}%` };
        case "Termina con": return { [Op.like]: `%${val}` };
        case "Está vacío": return { [Op.is]: null };
        case "No está vacío": return { [Op.not]: null };
        case "Es anterior a": return { [Op.lt]: val };
        case "Es posterior a": return { [Op.gt]: val };
        case "Es igual o anterior a": return { [Op.lte]: val };
        case "Es igual o posterior a": return { [Op.gte]: val };
        case "Está dentro de": return { [Op.between]: [val, val1] };
        case "=": return val;
        case "!=": return { [Op.ne]: val };
        case "<": return { [Op.lt]: val };
        case ">": return { [Op.gt]: val };
        case "<=": return { [Op.lte]: val };
        case ">=": return { [Op.gte]: val };
        default: return val;
    }
}

// function applyFilters(filters) {
//     const whereClause = {}

//     Object.keys(filters).forEach((key) => {
//         const { op, val, val1 } = filters[key]

//         switch (op) {
//             case 'Es':
//                 whereClause[key] = val;
//                 break;
//             case 'No es':
//                 whereClause[key] = { [Op.ne]: val };
//                 break;
//             case 'Contiene':
//                 whereClause[key] = { [Op.like]: `%${val}%` };
//                 break;
//             case 'No contiene':
//                 whereClause[key] = { [Op.notLike]: `%${val}%` };
//                 break;
//             case 'Empieza con':
//                 whereClause[key] = { [Op.like]: `${val}%` };
//                 break;
//             case 'Termina con':
//                 whereClause[key] = { [Op.like]: `%${val}` };
//                 break;
//             case 'Está vacío':
//                 whereClause[key] = { [Op.is]: null };
//                 break;
//             case 'No está vacío':
//                 whereClause[key] = { [Op.not]: null };
//                 break;
//             case 'Es anterior a':
//                 whereClause[key] = { [Op.lt]: val };
//                 break;
//             case 'Es posterior a':
//                 whereClause[key] = { [Op.gt]: val };
//                 break;
//             case 'Es igual o anterior a':
//                 whereClause[key] = { [Op.lte]: val };
//                 break;
//             case 'Es igual o posterior a':
//                 whereClause[key] = { [Op.gte]: val };
//                 break;
//             case 'Está dentro de':
//                 whereClause[key] = { [Op.between]: [val, val1] };
//                 break;
//             case '=':
//                 whereClause[key] = val;
//                 break;
//             case '!=':
//                 whereClause[key] = { [Op.ne]: val };
//                 break;
//             case '<':
//                 whereClause[key] = { [Op.lt]: val };
//                 break;
//             case '>':
//                 whereClause[key] = { [Op.gt]: val };
//                 break;
//             case '<=':
//                 whereClause[key] = { [Op.lte]: val };
//                 break;
//             case '>=':
//                 whereClause[key] = { [Op.gte]: val };
//                 break;
//             default:
//                 break;
//         }
//     });

//     return whereClause
// }

function cleanFloat(num) {
    return Math.round((num + Number.EPSILON) * 1e12) / 1e12;
}

function generarCodigo6() {
    const codigo = Math.floor(100000 + Math.random() * 900000);

    return codigo.toString()
}

function genId() {
    return `${Date.now()}${Math.floor(Math.random() * 900) + 100}`
}

function redondear(num, dec = 2) {
    if (num === null || num === undefined) return num

    return num.toLocaleString('en-US', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec
    })
}

export {
    existe,
    applyFilters,
    cleanFloat,
    generarCodigo6,
    genId,
    redondear,
}