//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
require('../Article');
let Article = mongoose.model("Article");
require('../Category');
let Category = mongoose.model("Category");
const fs = require('fs');
const Functions = require("../functions");
functions = new Functions;

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../Catalog');
let should = chai.should();
let expect = chai.expect;
let chaiFiles = require('chai-files');
chai.use(chaiFiles);
var file = chaiFiles.file;
var dir = chaiFiles.dir;


chai.use(chaiHttp);

describe('Articles', () => {
    // beforeEach((done) => { //Before each test we empty the database
    //     Article.deleteMany({}, (err) => {
    //        done();
    //     });
    // });

    /*
    * Test the /POST route
    */
    describe('/POST article', () => {

        it('it should POST an article', async (done) => {
            let articles = [
                {
                    title: "Mes comptines",
                    description: "1 puce, 1 image, 1 comptine. Appuie sur la puce : les comptines les plus connues enfin accessibles du bout des doigts !",
                    price: "10€",
                    filePath: "./test/images/mes-comptines.jpg",
                    fileName: "mes-comptines.jpg"
                },
                {
                    title: "My Hero Academia - Tome 31 : My Hero Academia",
                    description: "Rejoignez les super-héros du manga phénomène My Hero Academia !  Alors que les héros semblaient enfin reprendre l'avantage, un coup de poker de Mister Compress vient tout bouleverser ! Spinner parvient à ranimer son chef... Mais est-ce bien Tomura qui s'est réveillé, ou plutôt... All for One ?  L'ancien ennemi d'All Might paraît en effet avoir à nouveau pris le contrôle de son disciple... Déterminé à retrouver son corps, il se dirige droit vers le Tartare ! De leur côté, les héros doivent à présent gérer les conséquences de leur défaite...",
                    price: "6.60€",
                    filePath: "./test/images/my-hero-academia.jpg",
                    fileName: "my-hero-academia.jpg"
                },
                {
                    title: "Jours de sable",
                    description: "Washington, 1937. John Clark, journaliste photoreporter de 22 ans, est engagé par la Farm Security Administration, l'organisme gouvernemental chargé d'aider les fermiers victimes de la Grande Dépression. Sa mission : témoigner de la situation dramatique des agriculteurs du Dust Bowl. Située à cheval sur l'Oklahoma, le Kansas et le Texas, cette région est frappée par la sécheresse et les tempêtes de sable plongent les habitants dans la misère. En Oklahoma, John tente de se faire accepter par la population. Au cours de son séjour, qui prend la forme d'un voyage initiatique, il devient ami avec une jeune femme, Betty. Grâce à elle, il prend conscience du drame humain provoqué par la crise économique. Mais il remet en question son rôle social et son travail de photographe... Après Le Retour de la bondrée (Prix Saint-Michel du meilleur album) et L'Obsolescence programmée de nos sentiments (en collaboration avec Zidrou, Prix d'argent du Japan International Manga Award), Aimée de Jongh signe un récit émouvant, inspiré par des faits historiques et nourri par un séjour sur place.",
                    price: "29.99€",
                    filePath: "./test/images/jours-de-sable.jpg",
                    fileName: "jours-de-sable.jpg"
                },
                {
                    title: "Mes comptines - A SUPPRIMER APRES LE TEST",
                    description: "Washington, 1937. John Clark, journaliste photoreporter de 22 ans, est engagé par la Farm Security Administration, l'organisme gouvernemental chargé d'aider les fermiers victimes de la Grande Dépression. Sa mission : témoigner de la situation dramatique des agriculteurs du Dust Bowl. Située à cheval sur l'Oklahoma, le Kansas et le Texas, cette région est frappée par la sécheresse et les tempêtes de sable plongent les habitants dans la misère. En Oklahoma, John tente de se faire accepter par la population. Au cours de son séjour, qui prend la forme d'un voyage initiatique, il devient ami avec une jeune femme, Betty. Grâce à elle, il prend conscience du drame humain provoqué par la crise économique. Mais il remet en question son rôle social et son travail de photographe... Après Le Retour de la bondrée (Prix Saint-Michel du meilleur album) et L'Obsolescence programmée de nos sentiments (en collaboration avec Zidrou, Prix d'argent du Japan International Manga Award), Aimée de Jongh signe un récit émouvant, inspiré par des faits historiques et nourri par un séjour sur place.",
                    price: "29.99€",
                    filePath: "./test/images/jours-de-sable.jpg",
                    fileName: "jours-de-sable.jpg"
                },
            ];

            const category = await Category.findOne({name: "Livre jeunesse"});
                
            let article = articles[3];

            article = {...article, idCategory: category._id.toString()};

            try {
                const res = await chai.request(server)
                .post('/article')
                .set('content-type', 'multipart/form-data')
                .field('title', article.title)
                .field('description', article.description)
                .field('idCategory', article.idCategory)
                .field('price', article.price)
                .attach('file', fs.readFileSync(article.filePath), article.fileName);

                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('title');
                expect(res.body).to.have.property('description');
                expect(res.body).to.have.property('idCategory');
                expect(res.body).to.have.property('price');

                await Article.deleteMany({title: article.title});

                // Delete the file of the article
                let fileToDelete = functions.convertUrlImageToPath(
                    res.body.imageUrl,
                    __dirname + "/images_tests"
                );
    
                fs.unlinkSync(fileToDelete);
                
                done();
            } catch(err) {
                console.log(err);
            }
        });
    });

    /*
    * Test the /PUT route
    */
    describe('/PUT article', () => {

        let pathFileToCheck;
        let idArticleToModify;

        it('it should modify an article without a file in input', async (done) => {
            const modifyArticleWithoutInputFile = async() => {
                const article = {
                    title: "Mes comptines - A SUPPRIMER APRES LE TEST",
                    description: "Washington, 1937. John Clark, journaliste photoreporter de 22 ans, est engagé par la Farm Security Administration, l'organisme gouvernemental chargé d'aider les fermiers victimes de la Grande Dépression. Sa mission : témoigner de la situation dramatique des agriculteurs du Dust Bowl. Située à cheval sur l'Oklahoma, le Kansas et le Texas, cette région est frappée par la sécheresse et les tempêtes de sable plongent les habitants dans la misère. En Oklahoma, John tente de se faire accepter par la population. Au cours de son séjour, qui prend la forme d'un voyage initiatique, il devient ami avec une jeune femme, Betty. Grâce à elle, il prend conscience du drame humain provoqué par la crise économique. Mais il remet en question son rôle social et son travail de photographe... Après Le Retour de la bondrée (Prix Saint-Michel du meilleur album) et L'Obsolescence programmée de nos sentiments (en collaboration avec Zidrou, Prix d'argent du Japan International Manga Award), Aimée de Jongh signe un récit émouvant, inspiré par des faits historiques et nourri par un séjour sur place.",
                    price: "29.99€",
                    filePath: "./test/images/jours-de-sable.jpg",
                    fileName: "jours-de-sable.jpg",
                    idCategory: "idcategory-1"
                };
    
                const res = await chai.request(server)
                .post('/article')
                .set('content-type', 'multipart/form-data')
                .field('title', article.title)
                .field('description', article.description)
                .field('idCategory', article.idCategory)
                .field('price', article.price)
                .attach('file', fs.readFileSync(article.filePath), article.fileName);
    
                pathFileToCheck = functions.convertUrlImageToPath(
                    res.body.imageUrl,
                    __dirname + "/images_tests"
                );
            
                idArticleToModify = res.body._id;
    
                const newArticle = {
                    title: "Mes comptines - A SUPPRIMER APRES LE TEST",
                    description: "Nouvelle description",
                    price: "10.99€",
                    filePath: "./test/images/my-hero-academia.jpg",
                    fileName: "my-hero-academia.jpg",
                    idCategory: "idcategory-2"
                };
    
                const resUpdate = await chai.request(server)
                .put('/article/' + idArticleToModify)
                .set('content-type', 'multipart/form-data')
                .field('title', newArticle.title)
                .field('description', newArticle.description)
                .field('idCategory', newArticle.idCategory)
                .field('price', newArticle.price);
    
                expect(resUpdate.status).to.equal(200);
                expect(resUpdate.body).to.be.an('object');
                expect(resUpdate.body).to.have.property('title');
                expect(resUpdate.body).to.have.property('description');
                expect(resUpdate.body).to.have.property('description').eql(newArticle.description);
                expect(resUpdate.body).to.have.property('idCategory');
                expect(resUpdate.body).to.have.property('idCategory').eql(newArticle.idCategory);
                expect(resUpdate.body).to.have.property('price');
                expect(resUpdate.body).to.have.property('price').eql(newArticle.price);
                expect(file(pathFileToCheck)).to.exist;
    
                await Article.deleteMany({title: article.title});
    
                // Delete the file of the article
                let fileToDelete = functions.convertUrlImageToPath(
                    res.body.imageUrl,
                    __dirname + "/images_tests"
                );
    
                fs.unlinkSync(fileToDelete);
            };            

            try {
                await modifyArticleWithoutInputFile();
                done();
            } catch (error) {
                done(error);
            }
        });

        it('it should modify an article with a file in input', async (done) => {
            const modifyArticleWithInputFile = async() => {
                const article = {
                    title: "Mes comptines - A SUPPRIMER APRES LE TEST",
                    description: "Washington, 1937. John Clark, journaliste photoreporter de 22 ans, est engagé par la Farm Security Administration, l'organisme gouvernemental chargé d'aider les fermiers victimes de la Grande Dépression. Sa mission : témoigner de la situation dramatique des agriculteurs du Dust Bowl. Située à cheval sur l'Oklahoma, le Kansas et le Texas, cette région est frappée par la sécheresse et les tempêtes de sable plongent les habitants dans la misère. En Oklahoma, John tente de se faire accepter par la population. Au cours de son séjour, qui prend la forme d'un voyage initiatique, il devient ami avec une jeune femme, Betty. Grâce à elle, il prend conscience du drame humain provoqué par la crise économique. Mais il remet en question son rôle social et son travail de photographe... Après Le Retour de la bondrée (Prix Saint-Michel du meilleur album) et L'Obsolescence programmée de nos sentiments (en collaboration avec Zidrou, Prix d'argent du Japan International Manga Award), Aimée de Jongh signe un récit émouvant, inspiré par des faits historiques et nourri par un séjour sur place.",
                    price: "29.99€",
                    filePath: "./test/images/jours-de-sable.jpg",
                    fileName: "jours-de-sable.jpg",
                    idCategory: "idcategory-1"
                };
    
                const res = await chai.request(server)
                .post('/article')
                .set('content-type', 'multipart/form-data')
                .field('title', article.title)
                .field('description', article.description)
                .field('idCategory', article.idCategory)
                .field('price', article.price)
                .attach('file', fs.readFileSync(article.filePath), article.fileName);
            
                idArticleToModify = res.body._id;
    
                const newArticle = {
                    title: "Mes comptines - A SUPPRIMER APRES LE TEST",
                    description: "Nouvelle description",
                    price: "10.99€",
                    filePath: "./test/images/my-hero-academia.jpg",
                    fileName: "my-hero-academia.jpg",
                    idCategory: "idcategory-2"
                };
    
                const resUpdate = await chai.request(server)
                .put('/article/' + idArticleToModify)
                .set('content-type', 'multipart/form-data')
                .field('title', newArticle.title)
                .field('description', newArticle.description)
                .field('idCategory', newArticle.idCategory)
                .field('price', newArticle.price)
                .attach('file', fs.readFileSync(newArticle.filePath), newArticle.fileName);
    
                expect(resUpdate.status).to.equal(200);
                expect(resUpdate.body).to.be.an('object');
                expect(resUpdate.body).to.have.property('title');
                expect(resUpdate.body).to.have.property('description');
                expect(resUpdate.body).to.have.property('description').eql(newArticle.description);
                expect(resUpdate.body).to.have.property('idCategory');
                expect(resUpdate.body).to.have.property('idCategory').eql(newArticle.idCategory);
                expect(resUpdate.body).to.have.property('price');
                expect(resUpdate.body).to.have.property('price').eql(newArticle.price);
    
                pathNewFileToCheck = functions.convertUrlImageToPath(
                    resUpdate.body.imageUrl,
                    __dirname + "/images_tests"
                );
    
                pathOldFileToCheck = functions.convertUrlImageToPath(
                    res.body.imageUrl,
                    __dirname + "/images_tests"
                );
    
                expect(file(pathNewFileToCheck)).to.exist;
                expect(file(pathOldFileToCheck)).to.not.exist;
    
                await Article.deleteMany({title: article.title});
    
                // Delete the new file of the article
                fs.unlinkSync(pathNewFileToCheck);
            }

            try {
                await modifyArticleWithInputFile();
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    /*
    * Test the /DELETE route
    */
    describe('/DELETE article', () => {

        let pathFileToCheck;
        let idArticleToDelete;

        it('it should DELETE an article', async (done) => {
            const article = {
                title: "Mes comptines - A SUPPRIMER APRES LE TEST",
                description: "Washington, 1937. John Clark, journaliste photoreporter de 22 ans, est engagé par la Farm Security Administration, l'organisme gouvernemental chargé d'aider les fermiers victimes de la Grande Dépression. Sa mission : témoigner de la situation dramatique des agriculteurs du Dust Bowl. Située à cheval sur l'Oklahoma, le Kansas et le Texas, cette région est frappée par la sécheresse et les tempêtes de sable plongent les habitants dans la misère. En Oklahoma, John tente de se faire accepter par la population. Au cours de son séjour, qui prend la forme d'un voyage initiatique, il devient ami avec une jeune femme, Betty. Grâce à elle, il prend conscience du drame humain provoqué par la crise économique. Mais il remet en question son rôle social et son travail de photographe... Après Le Retour de la bondrée (Prix Saint-Michel du meilleur album) et L'Obsolescence programmée de nos sentiments (en collaboration avec Zidrou, Prix d'argent du Japan International Manga Award), Aimée de Jongh signe un récit émouvant, inspiré par des faits historiques et nourri par un séjour sur place.",
                price: "29.99€",
                filePath: "./test/images/jours-de-sable.jpg",
                fileName: "jours-de-sable.jpg",
                idCategory: "idcategory"
            };

            const res = await chai.request(server)
            .post('/article')
            .set('content-type', 'multipart/form-data')
            .field('title', article.title)
            .field('description', article.description)
            .field('idCategory', article.idCategory)
            .field('price', article.price)
            .attach('file', fs.readFileSync(article.filePath), article.fileName);

            pathFileToCheck = functions.convertUrlImageToPath(
                res.body.imageUrl,
                __dirname + "/images_tests"
            );
        
            idArticleToDelete = res.body._id;

            chai.request(server)
            .delete('/article/' + idArticleToDelete)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
                res.body.should.have.property('message').eql("Article deleted");
                done();
            });
        });

        it('it should check the file of the deleted article doesn\'t exist anymore', (done) => {
            //expect(file(pathFileToCheck)).to.exist;
            expect(file(pathFileToCheck)).to.not.exist;
            done();
        });

        it('it should check the deleted article doesn\'t exist anymore', async (done) => {
            const article = await Article.findOne({_id: idArticleToDelete});
            
            expect(article).to.equal(null);

            done();
        });
    });


    /*
    * Test the /GET route
    */
    describe('/GET articles', () => {
        it('it should GET all the articles', (done) => {
        chai.request(server)
            .get('/articles')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                //   res.body.length.should.be.eql(0);
                done();
            });
        });
    });

    /*
    * Test the /GET route that retrieves all the articles of a category 
    */
    describe('/GET all the articles of a category', () => {
        it('it should GET all the articles', async (done) => {
        // retrieve all the categories
        const listCategories = await Category.find();

        const firstCategory = listCategories[0];

        chai.request(server)
            .get('/articles/category/' + firstCategory._id)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                expect(res.body).to.have.deep.property('[0].title');
                expect(res.body).to.have.deep.property('[0].description');
                expect(res.body).to.have.deep.property('[0].idCategory');
                expect(res.body).to.have.deep.property('[0].price');
                done();
            });
        });
    });
    
});


describe('Categories', () => {
    // beforeEach((done) => { //Before each test we empty the database
    //     Category.deleteMany({}, (err) => {
    //        done();
    //     });
    // });


    /*
    * Test the /POST route
    */
    describe('/POST category', () => {

        it('it should POST a category and get an object with properties name and _id', (done) => {

            let category = {
                name: "Livre jeunesse - CATEGORIE A SUPPRIMER",
            };
        
            chai.request(server)
                .post('/category')
                .send(category)
                .end(async (err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('name');
                    res.body.should.have.property('_id');
                    res.body.should.have.property('name').eql(category.name);

                    await Category.deleteMany({name: category.name});
                done();
            });
        });
    });

    /*
    * Test the /GET route
    */
    describe('/GET categories', () => {
        it('it should GET all the categories', (done) => {
            chai.request(server)
                .get('/categories')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(4);
                    done();
                });
        });
    });
});


