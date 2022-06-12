// const Pool = require("pg").Pool;
// const env= require('../../env');
// //heroku
// const databaseConfig = { connectionString: env.database_url, ssl: {
//     rejectUnauthorized: false
//   } };
// //local 
// // const databaseConfig = { connectionString: env.database_url };
// const pool = new Pool(databaseConfig);
// console.log(env.database_url);
// module.exports =pool;
// const Pool = require("pg").Pool;

// const pool =new Pool({
//         user: "postgres",
//         password: "vijay",
//         database: "genius",
//         host: "localhost",
//         port: 5432
// });

// module.exports =pool;

const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    // console.log(process.env.DB_URL);
    mongoose.connect(
      process.env.DB_URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },
      () => {
        console.log('DB connected');
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

module.exports = dbConnect;