class HilbertCurve {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;

        this.program = createProgramFromSources(gl, [vertexShader], [fragmentShader]);
        this.colorBuffer = null;
        this.positionBuffer = null;
        this.drawCounts = 0;

        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
    }

    bufferLevels(hilbertCurves) {
        let tmp = 0;
        let colorArray = [];
        let positionArray = []
        for (let i = 0; i < hilbertCurves.length; i++) {
            tmp += +hilbertCurves[i].positions.length / 3
        }
        this.drawCounts = tmp
        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        
        for (let i = 0; i < hilbertCurves.length; i++) {
            for(let j = 0; j < hilbertCurves[i].positions.length / 3; j++){
                for(let h=0; h<hilbertCurves[i].color.length; h++){
                    colorArray.push(hilbertCurves[i].color[h])
                }

            }
        }
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colorArray), this.gl.STATIC_DRAW);

        for (let i = 0; i < hilbertCurves.length; i++) {
            for(let j = 0; j < hilbertCurves[i].positions.length; j++){
                positionArray.push(hilbertCurves[i].positions[j])
            }
        }

        
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positionArray), this.gl.STATIC_DRAW);

    }


    draw() {
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);

        this.gl.useProgram(this.program);

        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(
            this.positionLocation,
            3,
            this.gl.FLOAT,
            false,
            0,
            0
        );

        this.gl.enableVertexAttribArray(this.colorLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.vertexAttribPointer(
            this.colorLocation,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );

        this.gl.drawArrays(this.gl.LINES, 0, this.drawCounts);
    }
}
