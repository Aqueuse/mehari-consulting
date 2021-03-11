var express = require('express');
var app = express();

var ejs = require('ejs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(express.json({limit: '1mb'}));
app.use(cookieParser());

// we will execute shell commands
const {exec} = require("child_process");

var urlencodedParser = bodyParser.urlencoded({extended: false});
var port = 3001;
var baseURL = "http://mehari-consulting.com/";

// we will create archive to securise developpment and long term management
var path = require('path');
var fs = require('fs-extra');
var tar = require('tar');

// we offer the possibility to upload files client side
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, './client/static/public/img');
    },
    filename: function (request, file, callback) {
        let newName = convertFilenameToDate(file.originalname);
        callback(null, newName);
        createThumbail(newName);
    }
});

var upload = multer({storage: storage});


// settings the working directories to keep a clean organization client/server
app.use(express.static('client/static'));
app.set('views', './client/views');

var serveIndex = require('serve-index');
app.use('/public', express.static('./client/static/public'), serveIndex('./client/static/public', {'icons': true}))

// some global variables to share with the views ejs
var articles;
var users;
var secret = "";
var imgFiles = [];

// working with mongoDB
const uri = "mongodb://localhost:27017/details";
const {MongoClient} = require("mongodb");

const client = new MongoClient(uri, {useUnifiedTopology: true});

async function run() {
    try {
        await client.connect();
        const database = client.db('details');

        articles = database.collection('articles');
        users = database.collection('users');

        // Establish and verify connection
        await client.db("articles").command({ping: 1});
        console.log("mongoDB is connected successfully to the server");

    } catch (error) {
        console.log("hello catch : " + error);
    }
}

run().catch(console.dir);

///////////// the middlewares ///////////////
function validateCookie(request, response, next) {
    if (request.cookies != null) {
        if (request.cookies.session_id === secret) {
            next();
        } else {
            response.redirect(baseURL + "login");
        }
    } else {
        response.redirect(baseURL + "login");
    }
}

async function createArchive() {
    articles.find().forEach(result => { // create HTML files for each element in the articles collection
        fs.writeFile("./archive/" + result.id + ".html",
            result.id + "\n" +
            result.date + "\n" +
            result.title + "\n" +
            result.typeIsArticle + "\n" +
            result.categorie + "\n" +
            result.content,
            error => {
                if (error) console.log(error);
            }
        );
    });

    tar.create({gzip: true}, ['./archive', './client/static/public/img']).pipe(fs.createWriteStream('./client/static/public/archive.tgz'));
}

function listImgFolder(request, response, next) {
    imgFiles = fs.readdirSync(__dirname + "/client/static/public/img");
    imgFiles.sort();
    imgFiles = imgFiles.slice(0, 30);
    next();
}

function convertFilenameToDate(originalName) {
    let current = new Date();
    let currentFullDate =
        current.getSeconds().toString() +
        current.getMinutes().toString() +
        current.getHours().toString() +
        current.getDate().toString() +
        current.getMonth().toString() +
        current.getYear().toString();

    return currentFullDate + ".jpg";
}

function createThumbail(filename) {
    exec("convert " +
        __dirname + "/client/static/public/img/" +
        filename + " -resize 200 " +
        __dirname + "/client/static/public/img/thumbails/" +
        filename,
        function (error, stdout, stdin) {
            if (error) {
                console.log(error);
            }
        }
    );
}

////////// the routes /////////////

//// the global routes /////
app.get('/*', function (request, response, next) {
    if (request.url == "/create" ||
        request.url == "/admin" ||
        request.url == "/delete" ||
        request.url == "/upload" ||
        request.url.match("w*=edit") ||
        request.url == "/backup") {
        next();
    }

    if (request.url === "/") {
        response.redirect("http://mehari-consulting.com/infos");
    }

    if (request.url == "/infos") {
        var sliceArticlesIndex = 0;
        var articleLimit = 6;

        var indexArticlesPrecedents = sliceArticlesIndex - articleLimit;
        var indexArticlesSuivants = sliceArticlesIndex + articleLimit;

        articles.countDocuments({typeIsArticle: true})
             .then(function (countArticles) {
                 articles.find({typeIsArticle:true})
                     .sort({date:-1})
                        .skip(sliceArticlesIndex)
                        .limit(6)
                        .toArray(function (err, result) {
                            if (err) throw err;
                            response.render('index.ejs', {
                                currentArticleURL: request.url,
                                listArticles: result,
                                baseURL: baseURL,
                                indexArticlesPrecedents : indexArticlesPrecedents,
                                indexArticlesSuivants : indexArticlesSuivants,
                                countArticles: countArticles
                            });
                        });
                })
            .catch(function (error) {
                if (error) console.log(error);
            });
    }

    if (request.url == "/login") {
        response.render('index.ejs', {currentArticleURL: request.url, baseURL: baseURL});
    }

    if (request.url.match(/&*/) && request.url.match(/=*/)) {
        // cut the request in tranch with & separators
        var pageType = request.url.substr(1).split("&");

        // if first tranche is article
        if (pageType[0] == "type=article" && pageType.length == 2) {
            // search the article id in the mongoDB
            articles.find({id: pageType[1].split("=")[1]}).forEach(
                function (doc, err) {
                    var result = doc;
                    response.render('index.ejs', {currentArticleURL: request.url, result: result, baseURL: baseURL});
                    next();
                }
            );
        }

        // if first tranche is rubrique
        if (pageType[0] == "type=rubrique" && pageType.length == 3) {
            var rubriqueName = pageType[1].split("=")[1];
            var sliceArticlesIndex = Math.abs(parseInt(pageType[2].split("=")[1], 10));
            var articleLimit = 6;

            var indexArticlesPrecedents = sliceArticlesIndex - articleLimit;
            var indexArticlesSuivants = sliceArticlesIndex + articleLimit;

            articles.countDocuments({categorie: rubriqueName})
                .then(function (countArticles) {
                    articles.find({categorie: rubriqueName})
                        .sort({date: -1})
                        .skip(sliceArticlesIndex)
                        .limit(articleLimit)
                        .toArray(function (err, result) {
                            if (err) throw err;
                            response.render('index.ejs', {
                                currentArticleURL: request.url,
                                rubriqueName: rubriqueName,
                                listArticles: result,
                                baseURL: baseURL,
                                indexArticlesPrecedents: indexArticlesPrecedents,
                                indexArticlesSuivants: indexArticlesSuivants,
                                countArticles: countArticles
                            });
                        });
                });
        }

        // if first tranche is actualite
        if (pageType[0] == "type=news" && pageType.length == 2) {
            var sliceArticlesIndex = Math.abs(parseInt(pageType[1].split("=")[1], 10));
            var articleLimit = 6;

            var indexArticlesPrecedents = sliceArticlesIndex - articleLimit;
            var indexArticlesSuivants = sliceArticlesIndex + articleLimit;

            articles.countDocuments({typeIsArticle: true})
                .then(function (countArticles) {
                    articles.find({typeIsArticle: true})
                        .sort({date: -1})
                        .skip(sliceArticlesIndex)
                        .limit(6)
                        .toArray(function (err, result) {
                            if (err) throw err;
                            response.render('index.ejs', {
                                currentArticleURL: request.url,
                                listArticles: result,
                                baseURL: baseURL,
                                indexArticlesPrecedents: indexArticlesPrecedents,
                                indexArticlesSuivants: indexArticlesSuivants,
                                countArticles: countArticles
                            });
                        });
                });
        }
    }
});

//// the boss routes //////
app.get('/upload', validateCookie, listImgFolder, function (request, response) {
    response.render('index.ejs', {currentArticleURL: request.url, imgList: imgFiles, baseURL: baseURL});
    createArchive();
});

app.get('/edit*', validateCookie, function (request, response) {
    var articleID = request.url.replace("/edit?", "");
    articleID = articleID.replace("=edit", "");

    articles.find({id: articleID}).forEach(
        function (doc, err) {
            var result = doc;
            response.render('index.ejs', {currentArticleURL: request.url, result: result, baseURL: baseURL});
        });
});

app.get('/admin', validateCookie, function (request, response) {
    articles.find().toArray(function (err, result) {
        if (err) throw err;
        response.render('index.ejs', {currentArticleURL: request.url, listArticles: result, baseURL: baseURL});
    });
});

app.get('/create', validateCookie, function (request, response) {
    response.render('index.ejs', {currentArticleURL: request.url, baseURL: baseURL});
});

// we give a cookie to the user to allow it to create/edit/delete articles
app.post('/login', urlencodedParser, function (request, response) {
    users.find().forEach(
        function (doc, err) {
            if (request.body.identifiant === doc.username
                && request.body.password === doc.password) {
                secret = Math.random().toString(36).substring(2, 20);
                response.cookie('session_id', secret);
                response.redirect(baseURL + 'admin');
            } else {
                response.redirect(baseURL + 'login');
            }
        }
    );
});

// if the user has a fresh cookie, he can create an article and had it to the DB
app.post('/create', validateCookie, urlencodedParser, function (request, response) {
    jsonData = {
        title: request.body.title,
        content: request.body.content,
        categorie: request.body.categorie,
        typeIsArticle: (request.body.typeIsArticle == "true"),
        id: request.body.id,
        date: request.body.date,
        thumbail: request.body.thumbail
    };

    articles.insertOne(jsonData);

    response.redirect(baseURL + "type=article&id="+jsonData.id);
});

app.post('/delete', validateCookie, urlencodedParser, function (request, response) {
    var articleToDelete = Object.keys(JSON.parse(JSON.stringify(request.body)));
    articles.deleteOne({id: articleToDelete[0]});

    response.redirect(baseURL);
});

app.post('/edit', validateCookie, urlencodedParser, function (request, response) {
    var articleToEdit = Object.values(JSON.parse(JSON.stringify(request.body)));

    var newTitle = articleToEdit[0];
    var newDate = articleToEdit[1];
    var newContent = articleToEdit[2];
    var articleType = articleToEdit[3];
    var newID = articleToEdit[4];
    var newCategorie = articleToEdit[5];
    var newThumbail = articleToEdit[6];

    jsonData = {
        title: newTitle,
        content: newContent,
        categorie: newCategorie,
        typeIsArticle: (articleType == "true"),
        id: newID,
        date: newDate,
        thumbail: newThumbail
    };

    try {
        articles.replaceOne({id: jsonData.id}, jsonData);
    }
    catch(error) {
        if (error) console.log(error);
    }

    response.redirect(baseURL + "type=article&id="+newID);
});

app.post('/upload', validateCookie, upload.single('newImg'), urlencodedParser, function (request, response) {
    try {
        response.redirect(baseURL + "upload");
    } catch (error) {
        response.send(400);
    }
});

app.listen(port, () => console.log('Server running at '+port));