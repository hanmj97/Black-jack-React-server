const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql");
const PORT = process.env.port || 8000;

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "7891",
    database: "blackjack",
});

app.use(cors({
    origin: "*",                // 출처 허용 옵션
    credentials: true,          // 응답 헤더에 Access-Control-Allow-Credentials 추가
    optionsSuccessStatus: 200,  // 응답 상태 200으로 설정
}))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());              //얘땜에 시간 4시간버림..

app.post("/signup", (req, res) => {
    console.log('/signup', req.body);
    console.log(req.body.id);
    var id = req.body.id;
    var pw = req.body.pw;
    var name = req.body.name;
    const idcheck = new Object();

    const ischeckQuery = "SELECT userid FROM blackjack.user WHERE userid = ?";
    db.query(ischeckQuery, [id], (err, rows) => {
        idcheck.check = false;

        if(rows[0] === undefined){
            const sqlQuery = "INSERT INTO blackjack.user (userid, userpw, username, usermoney, userban) VALUES (?, ?, ?, 300, 'N')";
            db.query(sqlQuery, [id, pw, name], (err, result) => {
                res.send(result);
            });
        }else {
            idcheck.check = false;
            idcheck.affectedRows = 0;
            res.send(idcheck);
        }
    });
});


app.post("/signin", (req, res) => {
    console.log(req.body.id);
    var id = req.body.id;
    var pw = req.body.pw;
    const logincheck = new Object();

    const ischeckQuery = "SELECT userid, username, usermoney FROM blackjack.user WHERE userid = ? AND userpw = ?";
    db.query(ischeckQuery, [id, pw], (err, rows) => {
        logincheck.check = false;

        if(rows[0] === undefined){
            logincheck.check = false;
            logincheck.affectedRows = 0;
            logincheck.userid = "";
            logincheck.username = "";
            logincheck.usermoney = 0;
            res.send(logincheck);
        }else {
            logincheck.check = true;
            logincheck.affectedRows = 1;
            logincheck.userid = rows[0].userid;
            logincheck.username = rows[0].username;
            logincheck.usermoney = rows[0].usermoney;
            res.send(logincheck);
        }
    });
});

app.post("/userinfo", (req, res) => {
    console.log(req.body.id);
    var id = req.body.id;

    if(id != null) {
        const logincheck = new Object();

        const ischeckQuery = "SELECT usermoney FROM blackjack.user WHERE userid = ?";
        db.query(ischeckQuery, [id], (err, rows) => {

            console.log(rows[0].usermoney)

            logincheck.usermoney = rows[0].usermoney;
            res.send(logincheck);
        });
    }
});


app.post("/betting", (req, res) => {
    console.log("userid : " + req.body.id +", batsmoney : " + req.body.betsmoney);
    var id = req.body.id;
    var betsmoney = req.body.betsmoney;

    if(betsmoney >= 10){
        const bettingcheck = new Object();

        const ischeckQuery = "update blackjack.user set usermoney = (usermoney - ?) where userid = ?";
        db.query(ischeckQuery, [betsmoney, id], (err, rows) => {
            bettingcheck.betting = "finish";

            res.send(bettingcheck);
        });
    }else {
        const bettingcheck = new Object();

        const ischeckQuery = "update blackjack.user set usermoney = usermoney where userid = ?";
        db.query(ischeckQuery, [id], (err, rows) => {
            bettingcheck.betting = "finish";

            res.send(bettingcheck);
        });
    }
});


app.post("/randomcard", (req, res) => {
    console.log(req.body);
    var id = req.body.userid;
    var perfectbetsmoney = req.body.perfectbetsmoney;
    var betsmoney = req.body.betsmoney;

    const ischeckQuery = "SELECT id, cardpattern, cardnum, packnum, usestate, cardimg from blackjack.card Order by rand() Limit 4";
    db.query(ischeckQuery, [], (err, rows) => {
        res.send(rows);
    });
});





app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});