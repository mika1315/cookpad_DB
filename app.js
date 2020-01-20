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
        SELECT rc.title, u.name, rc.introduction, \
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

app.listen(3000, () => console.log('Example app listening on port 3000!'))
