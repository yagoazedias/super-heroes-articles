import { ModelRouter } from '../common/model-router'
import * as restify from 'restify'
import { NotFoundError } from 'restify-errors'
import { Category } from './category.model'
import {User} from "../users/users.model";

class CategoryRouter extends ModelRouter<Category> {
    constructor(){
        super(Category);
        this.on('beforeRender', document => {
            this.preFormatter(document);
        })
    }

    preFormatter =  (document) => {
        document.articles.forEach((actual) => {
            actual.category = undefined;
        });

        document.users.forEach((actual) => {
            actual.category = undefined;
            actual.articles = undefined;
        });
    };

    findByAllStars = (req, resp, next) => {
        this.model.find()
            .populate({
                path:     'users',
                populate: { path:  'user',
                    model: User }
            })
            .populate('articles')
            .then(categories => {
                console.log(categories);
            })
            .catch(next)
    };

    findById = (req, resp, next) => {
        this.model.findById(req.params.id)
            .populate({
                path:     'users',
                populate: { path:  'user',
                    model: User }
            })
            .populate({
                path:     'articles',
                populate: { path:  'article',
                    model: User }
            })
            .then(this.render(resp, next))
            .catch(next)
    };

    findAll = (req, resp, next) => {
        this.model.find()
            .populate({
                path:     'users',
                populate: { path:  'user',
                    model: User }
            })
            .populate('articles')
            .then(this.renderAll(resp,next))
            .catch(next)
    };

    applyRoutes(application: restify.Server){
        application.get('/categories', this.findAll);
        application.get('/categories/rockstars', this.findByAllStars);
        application.get('/categories/:id', [this.validateId, this.findById]);
        application.post('/categories', this.save);
    }

}

export const categoryRouter = new CategoryRouter();
