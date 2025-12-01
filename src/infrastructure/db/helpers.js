import { Op } from 'sequelize'

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

async function jdFindAll({ model, id, qry, include1, sqls1, tojson }) {
    const columns = Object.keys(model.getAttributes());

    const findProps = {
        include: [],
        attributes: ['id'],
        where: {},
        order: [['createdAt', 'DESC']],
    }

    if (qry?.incl) {
        for (const a of qry.incl) {
            if (qry.incl.includes(a)) findProps.include.push(include1[a])
        }
    }

    if (qry?.cols) {
        const cols1 = qry.cols.filter(a => columns.includes(a))
        findProps.attributes = findProps.attributes.concat(cols1)
    }

    if (qry?.sqls) {
        for (const a of qry.sqls) {
            if (qry.sqls.includes(a)) findProps.attributes.push(sqls1[a])
        }
    }

    if (qry?.fltr) {
        const fltr1 = Object.fromEntries(
            Object.entries(qry.fltr).filter(([key]) => columns.includes(key))
        )
        Object.assign(findProps.where, applyFilters(fltr1))

        // Filtros de relaciones
        Object.entries(qry.fltr)
            .filter(([k]) => Object.keys(include1).some(pref => k.startsWith(pref)))
            .forEach(([k, v]) =>
                Object.assign(findProps.where, applyFilters({ [`$${k}$`]: v }))
            )
    }

    if (qry?.ordr) {
        findProps.order = qry.ordr
    }

    if (id) {
        delete findProps.attributes
        const data = await model.findByPk(id, findProps)

        if (tojson) {
            return data.toJSON()
        }
        else {
            return data
        }
    }
    else {
        const data = await model.findAll(findProps)

        if (tojson) {
            return data.map(a => a.toJSON())
        }
        else {
            return data
        }
    }
}

export {
    applyFilters,
    // buildCondition,
    jdFindAll,
}