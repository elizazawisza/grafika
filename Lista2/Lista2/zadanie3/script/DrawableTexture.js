
class DrawableTexture extends Drawable {
    constructor(geometry, verticesNumber, type, translation, color, textureUrl) {
        super(geometry, verticesNumber, type, translation, color);

        this.texture = loadTexture(gl, textureUrl);
        this.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);

        this.textureCoordinates = [
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoordinates),
            gl.STATIC_DRAW);
    }

    draw() {
        const num = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.vertexAttribPointer(texcoordAttributeLocation, num, type, normalize, stride, offset);
        gl.enableVertexAttribArray(texcoordAttributeLocation);


        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.uniform1i(textureUniformLocation, 0);

        super.draw();
    }
}