const express = require("express");
const axios = require('axios')
const cors = require("cors");
const req = require('request');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth')

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(basicAuth({
    users: { 'admin': 'dP7yEO' }
}))

const token = "Администратор:123";

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

let encodedAuth = b64EncodeUnicode(token);

const myAxios = axios.create({
    baseURL: 'http://localhost/vkr/hs/Ulstu_Vedomosti/v1',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${encodedAuth}`,
        'Access-Control-Allow-Origin': '*',
    },
});

app.get("/api/getYears", function (request, response) {
    myAxios.get('/GetYears')
        .then((resp) => {
            const years = [];
            var date = new Date;
            resp.data.yearsList.map(item => {
                let arr = item.name.split(' - ');
                if ((parseInt(arr[1]) - parseInt(arr[0])) === 1 && (parseInt(arr[1]) <= date.getFullYear())) {
                    years.push(item);
                }
            })
            response.send(years);
        })
        .catch(function () {
                response.status(500);
                response.send({'error': 'An error has occurred'});
            }
        )
});

app.get("/api/getDisciplines/:teacherId&:yearId", function (request, response) {
    myAxios.get(`/GetDisciplines?teacherId=${request.params.teacherId}&yearId=${request.params.yearId}`)
        .then((resp) => {
            response.send(resp.data.disciplinesList);
        })
        .catch(function () {
                response.status(500);
                response.send({'error': 'Ошибка'});
            }
        )
});

app.get("/api/getVedomosti/:teacherId&:yearId&:disciplineId", function (request, response) {
    myAxios.get(`/GetVedomosti?teacherId=${request.params.teacherId}&yearId=${request.params.yearId}&disciplineId=${request.params.disciplineId}`)
        .then((resp) => {
            response.send(resp.data.vedomostList);
        })
        .catch(function () {
                response.status(500);
                response.send({'error': 'Ошибка'});
            }
        )
});

app.get("/api/getVedomost/:vedomostId", function (request, response) {
    myAxios.get(`/GetVedomost?vedomostId=${request.params.vedomostId}`)
        .then((resp) => {
            response.send(resp.data.vedomost[0]);
        })
        .catch(function () {
                response.status(500);
                response.send({'error': 'Ошибка'});
            }
        )
});

app.get("/api/getGrades/:gradesSystemId", function (request, response) {
    myAxios.get(`/GetGrades?gradesSystemId=${request.params.gradesSystemId}`)
        .then((resp) => {
            response.send(resp.data.gradesList);
        })
        .catch(function () {
                response.status(500);
                response.send({'error': 'Ошибка'});
            }
        )
});

app.get("/api/vedomostToPdf/:vedomostId", function (request, response) {
    const options = {
        url: `http://localhost/vkr/hs/Ulstu_Vedomosti/v1/VedomostToPdf?vedomostId=${request.params.vedomostId}`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'Authorization': `Basic ${encodedAuth}`
        }
    };
    try {
        req(options).pipe(response);
    } catch (error) {
        response.status(500);
        response.send({'error': 'Ошибка'});
    }
});

app.post("/api/postVedomost/:vedomostId", function (request, response) {
    myAxios.post(`/PostVedomost?vedomostId=${request.params.vedomostId}`, request.body).then(() => {
        response.send(true);
    })
        .catch(function () {
                response.status(500);
                response.send({'error': 'Ошибка'});
            }
        )

});

app.listen(5000);