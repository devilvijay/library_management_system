////////////////////////////------------------------IMPORT ALL REQUIRED PACKAGES-----------------------//////////////////////////////////////////////


const express = require("express");
const cors = require('cors');
const env = require('./env');
const app = express();
const auth = require('./app/middlewares/verifyAuth');
require('./app/db/dbConnect')();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


const path = require('path')
// Static Middleware
app.use(express.static(path.join(__dirname, 'public')))
  
app.get('/', function(req, res){
    res.render('index')
})


//////////////////////////------------------------IMPORTING HELPERS-----------------------------------//////////////////////////////////////////////

const {
    hashPassword,
    comparePassword,
    isValidEmail,
    validatePassword,
    isEmpty,
    generateUserToken,
} = require('./app/helpers/validations');

const {
    errorMessage, successMessage, status,
} = require('./app/helpers/status');




///////////////////////////////////////////--------------------IMPORT MODELS-------------------------------////////////////////////////////////


const User = require("./app/models/user");
const user = require("./app/models/user");
const book = require("./app/models/book");
const issue = require("./app/models/issue")
const activity = require("./app/models/activity")


//////////////////////////////////////////////-----------------------------USER AND TEACHER REGISTER API------------------------------////////////////////////////////////////// 


/**
   * Create A User
   * @param {object} req
   * @param {object} res
   * @returns {object} reflection object
   */
app.post('/auth/signup', async (req, res) => {

    const {
        name, email, reg_no, phone_no, password, gender, type
    } = req.body;

    // Validation Checks
    if (isEmpty(email) || isEmpty(name) || isEmpty(reg_no) || isEmpty(phone_no) || isEmpty(password) || isEmpty(gender)) {
        errorMessage.error = 'Email, Phone_no, Registration_no ,Password, Name and Gender field cannot be empty';
        return res.status(status.bad).send(errorMessage);
    }

    if (!isValidEmail(email)) {
        errorMessage.error = 'Please enter a valid Email';
        return res.status(status.bad).send(errorMessage);
    }

    if (!validatePassword(password)) {
        errorMessage.error = 'Password must be more than five(5) characters';
        return res.status(status.bad).send(errorMessage);
    }
    console.log("done Validation")

    //Password Hashing 
    const hashedPassword = hashPassword(password);

    //Checking if user already exists
    const userExist = await User.findOne({ email: email });

    if (userExist) {
        return res.status(status.error).send('User Already Exists');
    }

    let user;
    if (type == "teacher") {
        const is_admin = true;
        user = await User({ name: name, email: email, reg_no: reg_no, phone_no: phone_no, password: hashedPassword, gender: gender, is_admin: is_admin });
        await user.save()
    }
    else {
        const is_admin = false;
        user = await User({ name: name, email: email, reg_no: reg_no, phone_no: phone_no, password: hashedPassword, gender: gender, is_admin: is_admin });
        await user.save()
    }

    try {
        const token = generateUserToken(user.email, user.phone_no, user._id, user.is_admin, user.name);
        successMessage.data = {
            name: user.name,
            email: user.email,
            phone_no: user.phone_no
        };
        successMessage.data.token = token;
        return res.status(status.created).send(successMessage);
    } catch (error) {
        console.log(error)
        if (error.routine === '_bt_check_unique') {
            errorMessage.error = 'User with that EMAIL or Phone_no already exist';
            return res.status(status.conflict).send(errorMessage);
        }
        errorMessage.error = 'Operation was not successful';
        return res.status(status.error).send(errorMessage);
    }
});



////////////////////////////-----------------------------TEACHER AND STUDENT LOGIN API----------------------------------///////////////////////////////////////////////


/**
   * Signin
   * @param {object} req
   * @param {object} res
   * @returns {object} user object
   */
app.post('/auth/signin', async (req, res) => {
    const { email, password } = req.body;
    if (isEmpty(email) || isEmpty(password)) {
        errorMessage.error = 'Email or Password detail is missing';
        return res.status(status.bad).send(errorMessage);
    }
    if (!validatePassword(password)) {
        errorMessage.error = 'Please enter a valid Password';
        return res.status(status.bad).send(errorMessage);
    }

    const user = await User.findOne({ email: email }).lean();

    if (user == null) {
        return res.status(status.error).send('User Not Exists Please Register First');
    }

    try {
        if (!comparePassword(user.password, password)) {
            errorMessage.error = 'The password you provided is incorrect';
            return res.status(status.bad).send(errorMessage);
        }
        const token = generateUserToken(user.email, user.phone_no, user._id, user.is_admin, user.name);
        delete user.password;
        successMessage.data = user;
        successMessage.data.token = token;
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'Operation was not successful';
        return res.status(status.error).send(errorMessage);
    }
});



/////////////////////////////////////////----------------------------SEARCH STUDENT BY NAME API-------------------------------/////////////////////////////////////



app.get('/findstudent', auth, async (req, res) => {
    const { search } = req.body
    var regex = new RegExp(search, 'i');
    const user = await User.find({ $and: [{ name: regex }, { is_admin: false }] }).lean();

    if (user == null) {
        return res.status(status.success).send('No Student found');
    }
    else {
        for (let i = 0; i < user.length; i++) {
            delete user[i].password;
            delete user[i].is_admin;
            delete user[i].__v;
        }
        successMessage.data = user;
        return res.status(status.success).send(successMessage);
    }
});



/////////////////////////////////////////----------------------------LIST ALL STUDENTS API-------------------------------/////////////////////////////////////



app.get('/AllStudents', auth, async (req, res) => {
    const user = await User.find({ is_admin: false }).lean();
    if (user == null) {
        return res.status(status.success).send('No Students found');
    }
    else {
        for (let i = 0; i < user.length; i++) {
            delete user[i].password;
            delete user[i].is_admin;
            delete user[i].__v;
        }
        successMessage.data = user;
        return res.status(status.success).send(successMessage);
    }
});





/////////////////////////////////////////----------------------------CRUD OPERATIONS ON BOOKS-------------------------------/////////////////////////////////////


/////////////////////////////////////////----------------------------ADD BOOK API BY TEACHER ONLY-------------------------------/////////////////////////////////////


app.post('/addBook', auth, async (req, res) => {
    if (req.user.is_admin) {
        try {
            const book_info = req.body;
            // book_info.description = req.sanitize(book_info.description);

            const isDuplicate = await book.find(book_info);
            if (isDuplicate.length > 0) {
                return res.status(status.notfound).send(("error", "This book is already registered in inventory").toString());
            }
            else {

                const new_book = new book(book_info);
                await new_book.save();
                return res.status(status.success).send(("success", `A new book named ${new_book.title} is added to the inventory`).toString());
            }
        }
        catch (err) {
            console.log(err);
            errorMessage.error = 'Operation was not successful';
            return res.status(status.error).send(errorMessage);
        }
    }
    else {
        return res.status(status.bad).send("User Dont have permissions for updating this");
    }
});



/////////////////////////////////////////----------------------------UPDATE BOOK BY TEACHER ONLY API-------------------------------/////////////////////////////////////

app.post('/updateBook', auth, async (req, res) => {
    if (req.user.is_admin) {
        const book_info = req.body;
        // console.log(book_info.ISBN);
        const isDuplicate = await book.find({ ISBN: book_info.ISBN });
        if (isDuplicate.length == 0) {
            return res.status(status.notfound).send(("error", "There is no Book with this deatails registered!").toString());
        }
        const book_id = isDuplicate[0]._id;
        console.log(book_id);
        const ans = await book.findByIdAndUpdate(book_id, book_info);
        console.log(ans);
    }
    else {
        return res.status(status.bad).send("User Dont have permissions for updating this");
    }
});


/////////////////////////////////////////----------------------------DELETE ONLY BY TEACHER ONLY API-------------------------------/////////////////////////////////////

app.get('/deleteBook', auth, async (req, res) => {
    if (req.user.is_admin) {

        try {
            const book_info = req.body;
            // console.log(book_info.ISBN);
            const isDuplicate = await book.find({ ISBN: book_info.ISBN });
            if (isDuplicate.length == 0) {
                return res.status(status.notfound).send(("error", "There is no Book with this deatails registered!").toString());
            }
            const book_id = isDuplicate[0]._id;
            console.log(book_id);
            const bk = await book.findById(book_id);
            await bk.remove();
            return res.status(status.success).send(("success", `A book named ${isDuplicate[0].title} is just deleted!`).toString());
        }
        catch (err) {
            console.log(err);
            errorMessage.error = 'Operation was not successful';
            return res.status(status.bad).send(errorMessage)
        }

    }
    else {
        return res.status(status.bad).send("User Dont have permissions for updating this");
    }
})

/////////////////////////////////////////----------------------------GET ALL BOOKS API-------------------------------/////////////////////////////////////

app.get('/getAllbooks', auth, async (req, res) => {
    try {
        const Allbooks = await book.find().lean();
        if (Allbooks.length == 0) {
            return res.status(status.notfound).send(("error", "There are no Books found").toString());
        }
        successMessage.data = Allbooks;
        return res.status(status.success).send(successMessage);
    }
    catch (err) {
        console.log(err);
        errorMessage.error = 'Operation was not successful';
        return res.status(status.bad).send(errorMessage);
    }
})



/////////////////////////////////////////---------------------------STUDENT ISSUE A BOOK API-------------------------------/////////////////////////////////////

app.post('/issueBook', auth, async (req, res) => {
    try {
        let Book = await book.find({ISBN : req.body.ISBN});
        const User = await user.findById(req.user.user_id);
        Book=Book[0];
        //registering issue
        book.stock -= 1;
        const Issue = new issue({
            book_info: {
                id: Book._id,
                title: Book.title,
                author: Book.author,
                ISBN: Book.ISBN,
                category: Book.category,
                stock: Book.stock,
            },
            user_id: {
                id: User._id,
                reg_no: User.reg_no,
            }
        });

        // putting issue record on individual user document
        User.bookIssueInfo.push(Book._id);


        // logging the activity
        const Activity = new activity({
            info: {
                id: Book._id,
                title: Book.title,
            },
            category: "issue",
            time: {
                id: Issue._id,
                issueDate: Issue.book_info.issueDate,
                returnDate: Issue.book_info.returnDate,
            },
            user_id: {
                id: User._id,
                reg_no: User.reg_no,
            }
        });

        // await ensure to synchronously save all database alteration
        await Issue.save();
        await User.save();
        await Book.save();
        await Activity.save();
        return res.status(status.success).send(successMessage);
    }
    catch (err) {
        console.log(err);
        errorMessage.error = 'Operation was not successful';
        return res.status(status.bad).send(errorMessage);
    }
});



/////////////////////////////////////////----------------------------RENEW A BOOK API-------------------------------/////////////////////////////////////

app.post('/renewBook', auth, async (req, res) => {
    try {
        const searchObj = {
            "user_id.id": req.user.user_id,
            "book_info.ISBN": req.body.ISBN,
        }

        const Issue = await issue.findOne(searchObj);

        //adding 7 days extra to return date

        let time = Issue.book_info.returnDate.getTime();
        Issue.book_info.returnDate = time + 7 * 24 * 60 * 60 * 1000;
        Issue.book_info.isRenewed = true;

        // logging the activity
        const Activity = new activity({
            info: {
                id: Issue._id,
                title: Issue.book_info.title,
            },
            category: "Renew",
            time: {
                id: Issue._id,
                issueDate: Issue.book_info.issueDate,
                returnDate: Issue.book_info.returnDate,
            },
            user_id: {
                id: req.user.user_id,
                reg_no: req.user.reg_no,
            }
        });

        await Activity.save();
        await Issue.save();
        return res.status(status.success).send(successMessage);
    }
    catch (err) {
        console.log(err);
        errorMessage.error = 'Operation was not successful';
        return res.status(status.bad).send(errorMessage);
    }
});

/////////////////////////////////////////----------------------------FINE AFTER 7 DAYS API-------------------------------/////////////////////////////////////

app.post('/fine', auth, async (req, res) => {
    try {
        const searchObj = {
            "user_id.id": req.user.user_id
        }

        const Issue = await issue.findOne(searchObj);
        let time = Issue.book_info.returnDate.getTime();
        let currtime = Date.now();
        let Data;
        const Student = await user.findOne({ _id: req.user.user_id }).lean();
        if (currtime > time) {
            Student.fines = Student.fines + 50;
            await Student.save();
        }
        delete Student.password;
        Data = Student
        successMessage.data = Data;
        // delete successMessage.data.password;
        return res.status(status.success).send(successMessage);

    } catch (err) {
        console.log(err);
        errorMessage.error = 'Operation was not successful';
        return res.status(status.bad).send(errorMessage);
    }
});


/////////////////////////////////////////----------------------------SERVER FOR NODE JS-------------------------------/////////////////////////////////////


app.listen(env.port).on('listening', () => {
    console.log(`🚀 are live on ${env.port}`);
});
