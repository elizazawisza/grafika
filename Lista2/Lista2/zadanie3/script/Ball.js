class Ball extends DrawableTexture {
    constructor(geometry, verticesNumber, type, translation, moveVector, color, textureUrl) {
        super(geometry, verticesNumber, type, translation, color, textureUrl);
        this.moveVector = moveVector || this.randomMoveVector();
        this.collidables = [];
        this.isInsideCollidable = false;
    }

    moveAfterUpdate(deltaTime) {
        this.bounce(this.detectCollision());
        this.translation[0] += PIXELS_PER_SEC * this.moveVector[0] * deltaTime;
        this.translation[1] += PIXELS_PER_SEC * this.moveVector[1] * deltaTime;
    }

    registerCollisionObject(obj) {
        if (!(obj instanceof Drawable)) {
            throw new Error('Object must be of type Drawable');
        }
        this.collidables.push(obj);
    }

    bounce(modifiers) {
        if (modifiers != null) {
            this.isInsideCollidable = true;
            this.moveVector[0] = this.moveVector[0] * modifiers[0] * ACCELERATION;
            this.moveVector[1] = this.moveVector[1] * modifiers[1] * ACCELERATION;
        } else {
            this.isInsideCollidable = false;
        }
    }

    detectCollision() {
        let range;
        const x = this.translation[0];
        const y = this.translation[1];
        const ballOffset = (POINT_SIZE / 2);
        for (let obj of this.collidables) {
            range = obj.getCollisionRange();
            if (!this.isInsideCollidable &&
                range.x.min - ballOffset <= x && x <= range.x.max + ballOffset &&
                range.y.min - ballOffset <= y && y <= range.y.max + ballOffset
            ) {
                return [-1, 1];
            }
        }

        if (y <= 0 || canvas.clientHeight <= y) {
            return [1, -1];
        }

        if (x <= 0 || canvas.clientWidth <= x) {
            this.translation = [canvas.clientWidth / 2, canvas.clientHeight / 2];
            this.moveVector = this.randomMoveVector();
        }

        return null;
    }

}