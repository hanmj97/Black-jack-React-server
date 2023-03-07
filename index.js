const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql");
const PORT = process.env.port || 8000;

const db = mysql.createPool({
    host: "https://port-0-black-jack-react-server-p8xrq2mleyd78ib.sel3.cloudtype.app/",
    user: "hanmj97",
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
    var id = req.body.id;
    var pw = req.body.pw;
    var name = req.body.name;
    const idcheck = new Object();

    const ischeckQuery = "SELECT userid FROM blackjack.user WHERE userid = ?";
    db.query(ischeckQuery, [id], (err, rows) => {
        idcheck.check = false;

        if(rows && rows.length > 0){
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
        }else {
            const sqlQuery = "INSERT INTO blackjack.user (userid, userpw, username, usermoney, userban) VALUES (?, ?, ?, 300, 'N')";
            db.query(sqlQuery, [id, pw, name], (err, result) => {
                res.send(result);
            });
        }
    });
});


app.post("/signin", (req, res) => {
    var id = req.body.id;
    var pw = req.body.pw;
    const logincheck = new Object();

    /* const ischeckQuery = "SELECT userid, username, usermoney FROM blackjack.user";
    db.query(ischeckQuery, [id, pw], (err, rows) => {
        console.log("SELECT userid, username, usermoney FROM blackjack.user => " + rows);

    }); */

    const ischeckQuery = "SELECT userid, username, usermoney FROM blackjack.user WHERE userid = ? AND userpw = ?";
    db.query(ischeckQuery, [id, pw], (err, rows) => {
        logincheck.check = false;

        if(rows && rows.length > 0){
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
        }else {
            logincheck.check = false;
            logincheck.affectedRows = 0;
            logincheck.userid = "";
            logincheck.username = "";
            logincheck.usermoney = 0;
            res.send(logincheck);
        }
    });
});

app.post("/userinfo", (req, res) => {
    var id = req.body.id;

    if(id != null) {
        const logincheck = new Object();

        const ischeckQuery = "SELECT usermoney FROM blackjack.user WHERE userid = ?";
        db.query(ischeckQuery, [id], (err, rows) => {

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
    var id = req.body.userid;
    var perfectbetsmoney = req.body.perfectbetsmoney;
    var betsmoney = req.body.betsmoney;

    const cardcheckQuery = "SELECT id, cardpattern, cardnum, packnum, usestate, cardimg from blackjack.card WHERE usestate = 'N'";
    db.query(cardcheckQuery, [], (err, cardrows) => {

        if(cardrows.length < 30) {
            const recardstackQuery = "UPDATE blackjack.card SET usestate = 'N' WHERE 1 = 1";
            db.query(recardstackQuery, [], (err, result) => {
                console.log("card stack restart!");

                const ischeckQuery = "SELECT id, cardpattern, cardnum, packnum, usestate, cardimg from blackjack.card WHERE usestate = 'N' Order by rand() Limit 4";
                db.query(ischeckQuery, [], (err, rows) => {

                    for(var i = 0; i < rows.length; i++){
                        var cardid = rows[i].id;
                        var cardnum1 = rows[0].cardnum;
                        var cardnum2 = rows[2].cardnum;

                        if(cardnum1 == 1 && cardnum2 == 1){
                            const ischeckQuery2 = "SELECT id, cardpattern, cardnum, packnum, usestate, cardimg from blackjack.card WHERE usestate = 'N' Order by rand() Limit 4";
                            db.query(ischeckQuery2, [], (err, rows) => {

                                for(var i = 0; i < rows.length; i++){
                                    var cardid = rows[i].id;
                                
                                    const sqlQuery = "UPDATE blackjack.card SET usestate = 'Y' WHERE id = ?";
                                    db.query(sqlQuery, [cardid], (err, result) => {
                                        console.log("card state update complete!");
                                    });
                                }

                                if(rows[3].cardnum == 1){
                                    const mapArray = rows.map(obj => {
                                        return(
                                            {...obj, insurance: "insurance"}
                                        );
                                    })

                                    res.send(mapArray);
                                }else {
                                    res.send(rows);
                                }
                            });
                        }else {
                            const sqlQuery = "UPDATE blackjack.card SET usestate = 'Y' WHERE id = ?";
                            db.query(sqlQuery, [cardid], (err, result) => {
                                console.log("card state update complete!");
                            });
                        }
                    }

                    if(rows[3].cardnum == 1){
                        const mapArray = rows.map(obj => {
                            return(
                                {...obj, insurance: "insurance"}
                            );
                        })

                        res.send(mapArray);
                    }else {
                        res.send(rows);
                    }
                });
            });
        }else {
            const ischeckQuery = "SELECT id, cardpattern, cardnum, packnum, usestate, cardimg, '' as insurance from blackjack.card WHERE usestate = 'N' Order by rand() Limit 4";
            db.query(ischeckQuery, [], (err, rows) => {

                for(var i = 0; i < rows.length; i++){
                    var cardid = rows[i].id;

                    const sqlQuery = "UPDATE blackjack.card SET usestate = 'Y' WHERE id = ?";
                    db.query(sqlQuery, [cardid], (err, result) => {
                        console.log("card state update complete!");
                    });
                }

                if(rows[3].cardnum == 1){
                    const mapArray = rows.map(obj => {
                        return(
                            {...obj, insurance: "insurance"}
                        );
                    })

                    res.send(mapArray);
                }else {
                    res.send(rows);
                }
            });
        }
    });
});


app.post("/hit", (req, res) => {
    var id = req.body.userid;
    var perfectbetsmoney = req.body.perfectbetsmoney;
    var betsmoney = req.body.betsmoney;

    const ischeckQuery = "SELECT id, cardpattern, cardnum, packnum, usestate, cardimg from blackjack.card WHERE usestate = 'N' Order by rand() Limit 1";
    db.query(ischeckQuery, [], (err, rows) => {
        var hitcardid = rows[0].id;

        const sqlQuery = "UPDATE blackjack.card SET usestate = 'Y' WHERE id = ?";
        db.query(sqlQuery, [hitcardid], (err, result) => {
            console.log("hit card state update complete");
        });

        res.send(rows);
    });
});


app.post("/stand", (req, res) => {
    var id = req.body.userid;
    var perfectbetsmoney = req.body.perfectbetsmoney;
    var betsmoney = req.body.betsmoney;

    const ischeckQuery = "SELECT id, cardpattern, cardnum, packnum, usestate, cardimg from blackjack.card WHERE usestate = 'N' Order by rand() Limit 1";
    db.query(ischeckQuery, [], (err, rows) => {
        var standcardid = rows[0].id;

        const sqlQuery = "UPDATE blackjack.card SET usestate = 'Y' WHERE id = ?";
        db.query(sqlQuery, [standcardid], (err, result) => {
            console.log("Dealer hit card state update complete");
        });

        res.send(rows);
    });
});


app.post("/doubledown", (req, res) => {
    var id = req.body.userid;
    var perfectbetsmoney = req.body.perfectbetsmoney;
    var betsmoney = req.body.betsmoney;

    const ischeckQuery = "SELECT id, cardpattern, cardnum, packnum, usestate, cardimg from blackjack.card WHERE usestate = 'N' Order by rand() Limit 1";
    db.query(ischeckQuery, [], (err, rows) => {
        var doubledowncardid = rows[0].id;

        const sqlQuery = "UPDATE blackjack.card SET usestate = 'Y' WHERE id = ?";
        db.query(sqlQuery, [doubledowncardid], (err, result) => {
            console.log("doubledown card state update complete");
        });

        res.send(rows);
    });
});


app.post("/userwin", (req, res) => {
    var id = req.body.userid;
    var betsmoney = req.body.betsmoney;

    const calculatecheck = new Object();

    const ischeckQuery = "update blackjack.user set usermoney = usermoney + (? * 2) where userid = ?";
    db.query(ischeckQuery, [betsmoney, id], (err, rows) => {
        calculatecheck.calculate = "calculate finish";

        res.send(calculatecheck);
    });
});


app.post("/userdraw", (req, res) => {
    var id = req.body.userid;
    var betsmoney = req.body.betsmoney;

    const calculatecheck = new Object();

    const ischeckQuery = "update blackjack.user set usermoney = usermoney + ? where userid = ?";
    db.query(ischeckQuery, [betsmoney, id], (err, rows) => {
        calculatecheck.calculate = "calculate finish";

        res.send(calculatecheck);
    });
});

app.post("/userdoublewin", (req, res) => {
    var id = req.body.userid;
    var betsmoney = req.body.betsmoney;

    const calculatecheck = new Object();

    const ischeckQuery = "update blackjack.user set usermoney = usermoney + ? + (? * 2) where userid = ?";
    db.query(ischeckQuery, [betsmoney, betsmoney, id], (err, rows) => {
        calculatecheck.calculate = "calculate finish";

        res.send(calculatecheck);
    });
});


app.post("/userdoublelose", (req, res) => {
    var id = req.body.userid;
    var betsmoney = req.body.betsmoney;

    const calculatecheck = new Object();

    const ischeckQuery = "update blackjack.user set usermoney = usermoney - ? where userid = ?";
    db.query(ischeckQuery, [betsmoney, id], (err, rows) => {
        calculatecheck.calculate = "calculate finish";

        res.send(calculatecheck);
    });
});


app.post("/userperfectbet", (req, res) => {
    var id = req.body.userid;
    var perfectbetsmoney = req.body.perfectbetsmoney;

    const calculatecheck = new Object();

    const ischeckQuery = "update blackjack.user set usermoney = usermoney + (? * 30) where userid = ?";
    db.query(ischeckQuery, [perfectbetsmoney, id], (err, rows) => {
        calculatecheck.calculate = "calculate finish";

        res.send(calculatecheck);
    });
});


app.post("/userblackjack", (req, res) => {
    var id = req.body.userid;
    var betsmoney = req.body.betsmoney;

    const calculatecheck = new Object();

    const ischeckQuery = "update blackjack.user set usermoney = usermoney + ? + (? * 1.4) where userid = ?";
    db.query(ischeckQuery, [betsmoney, betsmoney, id], (err, rows) => {
        calculatecheck.calculate = "calculate finish";

        res.send(calculatecheck);
    });
});


app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});