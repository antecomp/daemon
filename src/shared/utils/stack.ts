/** Generic wrapper for JS list stack operations as an explicit Stack class. */
export default class Stack<T> {
    private items: T[];

    constructor() {
        this.items =[];
    }

    push(element: T) {
        this.items.push(element);
    }

    pop() {
        if(this.items.length === 0) {
            return undefined; // underflow
        }
        return this.items.pop()
    }

    peek() {
        return this.items[this.items.length -1];
    }

    isEmpty() {
        return this.items.length == 0;
    }

    size() {
        return this.items.length;
    }
}