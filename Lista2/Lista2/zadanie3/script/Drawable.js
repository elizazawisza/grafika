class Drawable {
    constructor(geometry, verticesNumber, type, translation, color) {
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry), gl.STATIC_DRAW);
        this.type = type;
        this.count = verticesNumber;
        this.moveVector = [0, 0];

        this.translation = translation || [0, 0];
        this.color = color || [1.0, 0.0, 0.0, 1.0];
    }

    getCollisionRange() {
        const xmin = this.translation[0];
        const xmax = this.translation[0] + paddleWidth;
        const ymin = this.translation[1];
        const ymax = this.translation[1] + paddleHeight;
        return {
            x: { min: xmin, max: xmax },
            y: { min: ymin, max: ymax },
        };
    }

    moveAfterUpdate(deltaTime) {

    }

    randomMoveVector() {
        return [(Math.random() > 0.5 ? 1 : -1), ((Math.random() * 2) - 1) * 0.5];
    }

    draw() {

        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        gl.lineWidth(LINE_WIDTH);


        const size = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        let offset = 0;
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        gl.uniform1f(uniformPointSize, POINT_SIZE);


        gl.uniform4fv(colorLocation, this.color);


        gl.uniform2fv(translationLocation, this.translation);


        const primitiveType = this.type;
        offset = 0;
        const count = this.count;
        gl.drawArrays(primitiveType, offset, count);
    }
}