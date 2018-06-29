import { Review } from './review';

export class Whisky {
    _id: string;
    brand: string;
    name: string;
    age: number;

    reviews = [];
    
    tags = [];
    constructor() {
        this.brand = 'Lagavulin';
        this.age = 16;
        
        let review = new Review();
        review.rating=4;
        review.tasting = 'this is a good whisky... yes it is';
        review.userName = 'daniel.wood';
        
        this.reviews.push(review);      
    }
}
