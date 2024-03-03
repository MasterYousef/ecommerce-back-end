const { check } = require("express-validator");
const ValidationMidleware = require("../../middlewares/ValidationMidleware");

const idValidator = (name)=>[
        check("id").isMongoId().withMessage(`${name} id is not valid`),
        ValidationMidleware,
    ]

module.exports = idValidator