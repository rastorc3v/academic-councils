const errors = require('./errors');

class Validator {
    constructor() {
        this.patternTypes = {
            council_id: /[КД] \d\d.\d\d.\d\d/,
            phone: /\d{3} \d{2} \d{2}/,
            creation_date: /\d{4} \d{2} \d{2}/,
            expiration_date: /\d{4} \d{2} \d{2}/,
            org_id: /\d/
        };
        this.attributesList = ['council_id', 'creation_date', 'expiration_date', 'org_id', 'phone'];
    }

    async isAttributesNormal(data) {
        let keys = Object.keys(data);
        return  keys.every(key => this.attributesList.includes(key));
    }

    async isAttributesLengthRight(data, length) {
        let keys = Object.keys(data);
        let values = Object.values(data);
        if (typeof length === "number") {
            return keys.length === length && values.length === length
        } else {
            return (length[0] < keys.length < length[1]) && (length[0] < values.length < length[1])
        }
    }

    async isValueNormal(data) {
        let keys = Object.keys(data);
        return keys.every(key => this.patternTypes[key].test(data[key]));
    };

   async validate(data, length) {
        if (!await this.isAttributesLengthRight(data, length)) {
            return {error: true, details: errors["00002"]}
        }
        if (!await this.isAttributesNormal(data) || !await this.isValueNormal(data)) {
            return {error: true, details: errors["23503"]}
        }
        return  {error: false}
    };
}

module.exports = Validator;