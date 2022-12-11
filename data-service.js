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
const Sequelize = require('sequelize');
var sequelize = new Sequelize('qrkewvab', 'qrkewvab', 'gDpeHmVR_7gbgkGDuspn0vmZ1ua-vE_G', {
    host: 'lucky.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    },
    query: { raw: true }
});
//---------------------------------------------------------------------------------------------------------------------------------
sequelize.authenticate()
    .then(() => console.log('Connection success.'))
    .catch((err) => {
        console.log("Unable to connect to DB.");
        console.log(err);
    });
//---------------------------------------------------------------------------------------------------------------------------------
var Employee = sequelize.define("Employee", {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING,
});
//---------------------------------------------------------------------------------------------------------------------------------
var Department = sequelize.define("Department", {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING,
});
//---------------------------------------------------------------------------------------
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {sequelize.sync().then(() => resolve()).catch(() => reject("unable to sync the database"));});
}
//---------------------------------------------------------------------------------------------------------------------------------
module.exports.getAllEmployees = function () {
    return new Promise((resolve, reject) => {Employee.findAll().then((data) => resolve(data)).catch(() => reject("no results returned"))});
}
//---------------------------------------------------------------------------------------------------------------------------------
module.exports.getDepartments = function () {
    return new Promise((resolve, reject) => {Department.findAll().then((data) => resolve(data)).catch(() => reject("no results returned"))});
}
//---------------------------------------------------------------------------------------------------------------------------------
module.exports.getEmployeesByStatus = function (status) {
    return new Promise(function (resolve, reject) {Employee.findAll({
            where: {status: status}
        }).then((data) => {resolve(data);
        }).catch((err) => {reject("no results returned");})
    })
}
//---------------------------------------------------------------------------------------------------------------------------------
module.exports.getEmployeesByDepartment = function (department) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({where: {department: department}
        }).then((data) => {resolve(data);
        }).catch((err) => {reject("no results returned");})
    })
}
//---------------------------------------------------------------------------------------------------------------------------------
module.exports.getEmployeesByManager = function (manager) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({where: {employeeManagerNum: manager}
        }).then((data) => {resolve(data);
        }).catch((err) => {reject("no results returned");})
    })
}
//---------------------------------------------------------------------------------------------------------------------------------
module.exports.getEmployeeByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({where: {employeeNum: num}
        }).then((data) => {resolve(data[0]);
        }).catch((err) => {reject("no results returned");})
    })
}
//---------------------------------------------------------------------------------------------------------------------------------
module.exports.addEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (var i in employeeData) {if (employeeData[i] === "") {employeeData[i] = null;}}
        Employee.create(employeeData).then(() => { console.log(employeeData); resolve(); }).catch(() => { reject("unable to create employee") });
    });
}
//---------------------------------------------------------------------------------------------------------------------------------
module.exports.addDepartment = function (departmentData) {
    return new Promise(function (resolve, reject) {
        for (var i in departmentData) {if (departmentData[i] === "") {departmentData[i] = null;}}
        Department.create(departmentData).then(function () {
                console.log(departmentData)
                resolve();})
            .catch(() => {reject("unable to create department");
            })
    });
}
//---------------------------------------------------------------------------------------------------------------------------------
module.exports.updateEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (var i in employeeData) {if (employeeData[i] == "") { employeeData[i] = null; }}
        Employee.update(employeeData, { where: { employeeNum: employeeData.employeeNum } }).then((data) => { resolve(data) }).catch(() => { reject("unable to update employee"); })
    });
}
//---------------------------------------------------------------------------------------------------------------------------------
module.exports.updateDepartment = function (departmentData) {
    return new Promise(function (resolve, reject) {
        for (var i in departmentData) {if (departmentData[i] == "") { departmentData[i] = null; }}
        Department.update(departmentData, {where: { departmentId: departmentData.departmentId }
        }).then((data) => {
            resolve(data)
        }).catch(() => {reject("unable to update department");})
    });
}
//---------------------------------------------------------------------------------------------------------------------------------
module.exports.getDepartmentById = function (id) {
    return new Promise((resolve, reject) => {
        Department.findAll({where: {departmentId: id}}).then((data) => resolve(data)).catch(() => reject("no results returned"))});
}
//---------------------------------------------------------------------------------------------------------------------------------
module.exports.deleteEmployeeByNum = function (empNum) {
    return new Promise((resolve, reject) => {
        Employee.destroy({ 
            where: {employeeNum: empNum} 
        }).then(() => resolve()).catch(() => reject("unable to delete employee"))
    });
}
//---------------------------------------------------------------------------------------------------------------------------------
