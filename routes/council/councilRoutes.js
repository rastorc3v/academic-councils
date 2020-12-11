const router = require('express').Router();
const pool = require('../../db/init');
const format = require('pg-format');
const errors = require('./errors');
const Validator = require('./CouncilValidator');

let validator = new Validator();

module.exports = (app) => {
    router.route('/councils')
        .get(async(req, res) => {
            let items = await pool.query('Select  cb.council_id, array_agg(branch_id) as branches, c.creation_date, c.expiration_date, o.name, phone from council_branch cb inner join council c on c.council_id = cb.council_id inner join organization o on c.org_id = o.org_id group by cb.council_id, c.creation_date, c.expiration_date, c.phone, o.name');
            await res.json(items.rows);
        })
        .post(async(req, res) => {
            let data = req.query;

            let isValid = await validator.validate(data, 5);

            if (isValid.error) {
                return await res.json(isValid)
            }
            try {
                let query = await format('INSERT INTO council VALUES %L', [Object.values(data)]);
                await pool.query(query);
                await res.json({error: false, details: `Совет с шифром - ${data["council_id"]}, был успешно создан`});
            } catch (err) {
                console.log(err);
                await res.json({error: true, details: errors[err.code]})
            }
        });
    router.route('/councils/:council_id')
        .get(async (req, res) => {
            let data = req.params;

            let isValid = await validator.validate(data, 1);
            if (isValid.error) {
                return await res.json(isValid)
            }

            try {

                let id = Object.values(data),
                    query = await format('SELECT * from council INNER JOIN organization ON council.org_id=organization.org_id WHERE council_id=%L', id),
                    council = await pool.query(query),
                    members;
                query = await format('select surname, name, post, degree from member where council_id=%L', id);
                members = await pool.query(query);
                await res.json(council.rows.concat(members.rows))
            } catch (err) {
                console.log(err);
                await res.json({error: true, details: errors[err.code]})
            }
        })
        .put(async (req, res) => {
            let data = req.query;
            let id = req.params;

            let isValid = await validator.validate(data, 5);
            if (isValid.error) {
                return await res.json(isValid)
            }

            isValid = await validator.validate(id, 1);
            if (isValid.error) {
                return await res.json(isValid)
            }

            try {
                let query = format(`UPDATE council SET (${Object.keys(data).join(", ")}) = (%L) WHERE council_id=%L`, Object.values(data), id.council_id);
                let items = await pool.query(query);
                if (items.rowCount === 0) {
                    return await res.json({error: true, details: errors["00004"]})
                }
                await res.json(`{UPDATE_requested_council: ${req.params.id}, ${Object.keys(items)}, ${items.rowCount}`)
            } catch (err) {
                console.log(err)
                await res.json({error: true, details: errors[err.code]})
            }
        })
        .delete(async (req, res) => {
            let data = req.params;

            let isValid = await validator.validate(data, 1);
            if (isValid.error) {
                return await res.json(isValid)
            }

            try {
                let query = format('DELETE FROM council WHERE council_id=%L', data.council_id);
                await pool.query(query);

                await res.json(`{DELETE_requested_council: ${req.param.id}`)
            } catch (err) {
                console.log(err);
                await res.json({error: true, details: errors[err.code]})
            }
        });


    app.use(
        router
    );
};
