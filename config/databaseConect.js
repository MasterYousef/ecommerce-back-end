const mongoose = require('mongoose')

function databaseConect() {
    mongoose.connect(process.env.DB_URI).then(()=>console.log('coneect to database sucssefly'))
}

module.exports = databaseConect
