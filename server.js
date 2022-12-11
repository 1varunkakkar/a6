/*************************************************************************
* BTI325– Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Varun Kakkar Student ID: 124524216 Date: 11-12-2022
*
* Your app’s URL (from Cyclic) : https://comfortable-yak-earrings.cyclic.app
*
*************************************************************************/
const express = require("express");

const app = express();

const multer = require("multer");

const fs = require('fs');

const { engine } = require("express-handlebars");

var clientSessions = require("client-sessions");

var data = require("./data-service.js")

var dataService = require('./data-service-auth.js');

var path = require("path");

var HTTP_PORT = process.env.PORT || 8080

app.engine(".hbs", engine({
    extname: ".hbs",
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
        },

        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {return options.inverse(this);}
            else {return options.fn(this);}
        }

    }
}));
//-----------------------------------------------------------------------------------------------------------------------------
app.use(express.static('./public/'));
//-----------------------------------------------------------------------------------------------------------------------------
app.set("view engine", ".hbs");
//-----------------------------------------------------------------------------------------------------------------------------
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
//-----------------------------------------------------------------------------------------------------------------------------
app.use(express.json());
//-----------------------------------------------------------------------------------------------------------------------------
app.use(express.urlencoded({ extended: true }));
//-----------------------------------------------------------------------------------------------------------------------------
app.use(function (req, res, next) {let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();});
//-----------------------------------------------------------------------------------------------------------------------------
app.use(clientSessions({cookieName: "session", secret: "vkakkar_2829", duration: 2 * 60 * 1000, activeDuration: 1000 * 60 }));
//-----------------------------------------------------------------------------------------------------------------------------
app.use(function (req, res, next) {res.locals.session = req.session;
    next();});
//-----------------------------------------------------------------------------------------------------------------------------
function ensureLogin(req, res, next) {if (!req.session.user) {res.redirect("/login");}
    else {next();}}
//-----------------------------------------------------------------------------------------------------------------------------
app.post("/images/add", upload.single("imageFile"), ensureLogin, (req, res) => {res.redirect("/images");})
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/images/add", ensureLogin, (req, res) => {res.render("addImage");})
//-----------------------------------------------------------------------------------------------------------------------------
app.get('/', function (req, res) {res.render("home", { layout: "main" })});
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/about", (req, res) => {res.render("about", { layout: "main" })});
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/employees", ensureLogin, (req, res) => {

    if (req.query.status) {data.getEmployeesByStatus(req.query.status).then(data => {if (data.length > 0) { res.render("employees", { employee: data })}
            else { res.render("employees", { message: "No results" })}}).catch(err => {res.render({ message: "No results" });})
    }

    else if (req.query.department) {data.getEmployeesByDepartment(req.query.department).then(data => {if (data.length > 0) { res.render("employees", { employee: data })}
            else { res.render("employees", { message: "No results" })}}).catch(err => {res.render({ message: "no results" });})
    }

    else if (req.query.manager) {data.getEmployeesByManager(req.query.manager).then(data =>{if (data.length > 0) { res.render("employees", { employee: data })}
            else { res.render("employees", { message: "No results" }) }}).catch(err => {res.render({ message: "no results" });})
    }

    else {data.getAllEmployees().then((data) => {if (data.length > 0) { res.render("employees", { employee: data }); }
                else {res.render("employees", { message: "No results" })}}).catch(() => res.render({ message: "no results" }))
    }

});
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/employee/:empNum", ensureLogin, (req, res) => { 
    let viewData = {};
    data.getEmployeeByNum(req.params.empNum).then((data) => {if (data) {viewData.employee = data;} 
        else {viewData.employee = null;}}).catch(() => {viewData.employee = null; }).then(data.getDepartments).then((data) => {viewData.departments = data; 
            for (let i = 0; i < viewData.departments.length; i++) {if (viewData.departments[i].departmentId == viewData.employee.department) {viewData.departments[i].selected = true;}
            }
        }).catch(() => {viewData.departments = []; 
        }).then(() => {
            if (viewData.employee == null) { res.status(404).send("Employee Not Found");} 
            else {res.render("employee", { viewData: viewData });}
        });
});
//-----------------------------------------------------------------------------------------------------------------------------
app.post("/employee/update", ensureLogin, (req, res) => { data.updateEmployee(req.body).then(() => { res.redirect("/employees"); })});
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/departments", ensureLogin, function (req, res) { 
    data.getDepartments().
        then((data) => {
            if (data.length > 0) res.render("departments", { departments: data });
            else res.render("departments", { message: "No results" })}).catch(() => {res.render({ message: "No results" });})
})
//-----------------------------------------------------------------------------------------------------------------------------
app.post("/employees/add", ensureLogin, (req, res) => {data.addEmployee(req.body).then(() => res.redirect("/employees")).catch((err) => res.json({ "message": err }))});
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/employees/add", ensureLogin, (req, res) => { data.getDepartments().then(function (data) { res.render("addEmployee", { departments: data }) }).catch(() => res.render("addEmployee", { departments: [] }))})
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/departments/add", ensureLogin, (req, res) => { res.render("addDepartment");})
//-----------------------------------------------------------------------------------------------------------------------------
app.post("/departments/add", ensureLogin, (req, res) => {data.addDepartment(req.body).then(() => res.redirect('/departments')).catch((err) => res.json({ "message": err }))});
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/images", ensureLogin, (req, res) => {fs.readdir("./public/images/uploaded", (err, items) => {res.render("image", { data: items });})})
//-----------------------------------------------------------------------------------------------------------------------------
app.post("/departments/update", ensureLogin, (req, res) => {data.updateDepartment(req.body).then(res.redirect("/departments")).catch((err) => res.json({ "message": err }))});
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/department/:departmentId", ensureLogin, (req, res) => {data.getDepartmentById(req.params.departmentId).then(data => {if (data.length > 0) res.render("department", { department: data })
        else { res.status(404).send("Department Not Found"); }}).catch(() => {res.status(404).send("Department Not Found");})})
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/employees/delete/:empNum", ensureLogin, (req, res) => { 
    data.deleteEmployeeByNum(req.params.empNum).then(() => res.redirect("/employees")).catch(() => res.status(500).send("Unable to Remove Employee / Employee not found"))})
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/login", (req, res) => {res.render("login");})
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/register", (req, res) => {res.render("register");})
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/logout", (req, res) => {req.session.reset();
    res.redirect("/");})
//-----------------------------------------------------------------------------------------------------------------------------
app.get("/userHistory", ensureLogin, (req, res) => {res.render("userHistory");})
//-----------------------------------------------------------------------------------------------------------------------------
app.post("/register", (req, res) => {dataService.registerUser(req.body).then(() => {res.render("register", { successMessage: "User created" });}).catch((err) => {res.render("register", { errorMessage: err, userName: req.body.userName });})})
//-----------------------------------------------------------------------------------------------------------------------------
app.post("/login", (req, res) => {req.body.userAgent = req.get('User-Agent');
    dataService.checkUser(req.body).then((user) => {req.session.user = {userName: user.userName, email: user.email, loginHistory: user.loginHistory }
            res.redirect('/employees');}).catch((err) => {res.render("login", { errorMessage: err, userName: req.body.userName });})})
//-----------------------------------------------------------------------------------------------------------------------------
app.use(function (req, res) {res.status(404).send("Page not found");})
//-----------------------------------------------------------------------------------------------------------------------------
dataService.initialize().then(dataService.initialize).then(function () {app.listen(HTTP_PORT, function () {console.log("app listening on: " + HTTP_PORT)});}).catch(function (err) {console.log("unable to start server: " + err);});
//-----------------------------------------------------------------------------------------------------------------------------


