import { ModelRouter } from '../common/model-router'
import * as restify from 'restify'
import { Article } from './articles.model'
import { Category } from "../category/category.model";
import { User } from "../users/users.model";

class ArticlesRouter extends ModelRouter<Article> {
    constructor(){
        super(Article);
        this.on('beforeRender', document => {
            this.preFormatter(document);
        })
    }

    preFormatter =  (document) => {
        document.user.category = undefined;
        document.user.articles = undefined;
        document.category.articles = undefined;
        document.category.users = undefined;
    };

    findById = (req, resp, next) => {
        this.model.findById(req.params.id)
            .populate('category')
            .populate('user')
            .then(this.render(resp, next))
            .catch(next)
    };

    findByUser = (req, resp, next) => {

        if(req.query.user) {
            Article.
            find({})
                .populate('user')
                .then((articles) => {

                    const articlesByUser = articles.filter((article) =>
                        article.user._id.toString() === req.query.user
                    );

                    resp.json(articlesByUser);

                }).catch(next)
        } else {
            next();
        }
    };

    findByCategory = (req, resp, next) => {

        if(req.query.category) {
            Article.
            find({})
                .then((articles) => {
                    const articlesFiltered = articles.filter((article) =>
                        article.category.toString() === req.query.category
                    );

                    resp.json(articlesFiltered);
                }).catch(next)
        } else {
            next();
        }
    };

    findAll = (req, resp, next) => {
        this.model.find()
            .populate('category')
            .populate('user')
            .then(this.renderAll(resp,next))
            .catch(next)
    };

    save = (req, resp, next) => {
        const document = new this.model(req.body);
        console.log(document);
        document
            .save()
            .then((article) => {

                User
                    .findOne({'_id': req.body.user})
                    .then(() => {
                        User
                            .findOneAndUpdate({'_id': req.body.user}, {$push: { articles: article._id} })
                            .catch(next);

                    }).catch(next);

                Category
                    .findOne({'_id': req.body.category})
                    .then(() => {
                        Category
                            .findOneAndUpdate({'_id': req.body.category}, {$push: { articles: article._id} })
                            .catch(next);

                    }).catch(next);

                resp.send(document);
            })
            .catch(next)
    };

    applyRoutes(application: restify.Server){
        application.get('/articles', [this.findByUser, this.findByCategory, this.findAll]);
        application.get('/articles/:id', [this.validateId, this.findById]);
        application.post('/articles', this.save);
        application.put('/articles/:id', [this.validateId,this.replace]);
        application.patch('/articles/:id', [this.validateId,this.update]);
        application.del('/articles/:id', [this.validateId,this.delete]);
    }

}

export const articlesRouter = new ArticlesRouter();
