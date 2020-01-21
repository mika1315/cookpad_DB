var sqlite3 = require('sqlite3').verbose()
var bodyParser = require('body-parser')
const express = require('express')
const app = express()
app.use(express.static('public'));
app.set('view engine', 'pug')
// var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

var db = new sqlite3.Database('cookpad.db')

function sample(query, content, callback) {
    db.all(query, content, function (err, rows) {
        if (err) {
            console.log("ERROR: " + err.message);
        }
        console.log("inside fuction: " + rows.length);
        callback(rows);
    }
          )
}

app.get('/', function (req, res, next) {
    var query = "\
        SELECT u.account, u.name, u.bio, \
        rc.title, rc.introduction, \
        count(rc.title) as title_count, \
            (SELECT count(*) \
            FROM follow f \
            WHERE u.name = 'うさぎ' \
            and u.account= f.follower_account) as follower_count, \
            (SELECT count(*) \
            FROM follow f \
            WHERE u.name = 'うさぎ' \
            and u.account = f.followee_account) as followee_count, \
            (SELECT rc.title \
            FROM report rp , recipe rc \
            WHERE u.name = 'うさぎ' \
            and u.account = rp.account \
            and rp.recipe_id = rc.id) as report_title, \
            (SELECT rc.photo \
            FROM recipe rc \
            WHERE u.name = 'うさぎ' \
            and u.account = rc.account) as recipe_photo, \
            (SELECT rp.photo \
            FROM report rp , recipe rc \
            WHERE u.name = 'うさぎ' \
            and u.account = rp.account) as report_photo, \
            (SELECT count(rc.title) \
            FROM report rp , recipe rc \
            WHERE u.name = 'うさぎ' \
            and u.account = rp.account \
            and rp.recipe_id = rc.id) as report_title_count, \
            (SELECT u.name \
            FROM user u \
            WHERE u.account = \
            (SELECT rc.account \
            FROM report rp , recipe rc, user u \
            WHERE u.name = 'うさぎ' \
            and u.account = rp.account \
            and rp.recipe_id = rc.id)) as recipe_user, \
            (SELECT rp.contents \
            FROM report rp , recipe rc \
            WHERE u.name = 'うさぎ' \
            and u.account = rp.account \
            and rp.recipe_id = rc.id) as report_content \
        FROM recipe rc, user u \
        WHERE u.name = 'うさぎ' \
        and u.account = rc.account; \
        ";
        console.log("DBG_INDEX:" + query);
    db.all(query, {}, function (err, rows) {
        if (err) {
            console.log("ERROR: " + err.message);
        }
        res.render('index', {
            results: rows
        })
    })
});

app.get('/search', function (req, res, next) {
   res.render('search')
});

app.post('/insearch', function (req, res) {

    content = req.body['ingredient'];
    console.log("Post:" + content);
    var query = "\
        SELECT rc.title, u.name, rc.introduction, rc.photo, \
            (SELECT count(*) \
            FROM search s \
            WHERE rc.id = s.recipe_id) as search_count \
        FROM user u, recipe rc, ingredient i \
        WHERE i.name = ? \
        and rc.id = i.recipe_id \
        and u.account = rc.account \
        ORDER BY search_count DESC; \
        ";
    console.log("DBG_SEARCH:" + query);
    // var statement = db.prepare(query);

    db.all(query,content, function (err, rows) {
        if (err) {
            console.log("ERROR_SEARCH: " + err.message);
        }
        res.render('insearch', {
            ingredients: content,
            results: rows
        })
    })
    // statement.finalize();
});

app.post('/recipe', function (req, res) {

    content = req.body['title'];
    console.log("Post:" + content);

    var query1 = "\
        SELECT m.contents , m.photo \
        FROM recipe rc, method m \
        WHERE rc.title = ? \
        and rc.id = m.recipe_id; \
        ";

    var query2 = "\
        SELECT i.name, i.quantity \
        FROM recipe rc, ingredient i \
        WHERE rc.title = ? \
        and rc.id = i.recipe_id; \
        ";

    var query3 = "\
        SELECT rc.title, rc.photo, rc.introduction, rc.background, rc.point ,u.name, u.account\
        FROM recipe rc , user u\
        WHERE rc.title = ? \
        and u.account = rc.account; \
        ";

    console.log("DBG_INDEX:" + query1);
    console.log("DBG_INDEX:" + query2);
    console.log("DBG_INDEX:" + query3);
    
    // コールバック処理を入れ子で実現
    sample(query1, content, function(rows1) {
        console.log("query1 : " + rows1.length);

        sample(query2, content, function(rows2) {
            console.log("query2 : " + rows2.length);

            sample(query3,content, function(rows3) {
                console.log("query3 : " + rows3.length);

                res.render('recipe', {
                    methods: rows1,
                    ingredients: rows2,
                    informations: rows3

                  });
              });
          });
       });
    });

app.listen(3000, () => console.log('Example app listening on port 3000!'))
