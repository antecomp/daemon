class Actor {
    name: string;
    health: number;
    maxHealth: number;

    constructor(name: string, maxHealth: number) {
        this.name = name;
        this.maxHealth = this.health = maxHealth
    }

    takeDamage(amount: number) {
        this.health = Math.max(this.health - amount, 0);
    }

    heal(amount: number) {
        this.health += Math.min(this.health + amount, this.maxHealth);
    }

    isDead() {
        return this.health == 0;
    }
}