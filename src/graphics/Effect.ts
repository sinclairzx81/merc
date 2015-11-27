/*--------------------------------------------------------------------------

mxdi-js - multimedia web stuff

The MIT License (MIT)

Copyright (c) 2015 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

module acid.graphics {
	
	/**
	 * webgl effect kernel
	 */
	export class Effect {
		
		private material : THREE.ShaderMaterial;
		private scene    : THREE.Scene;
		private camera   : THREE.OrthographicCamera;
		private plane    : THREE.PlaneBufferGeometry;
		private mesh     : THREE.Mesh;
		
		constructor(source_or_function: string| Function) {
			var source    = this.parse_to_string(source_or_function);
			var uniforms  = this.parse_uniforms(source);
			uniforms.resolution = {
				type : "v2",
				value: new THREE.Vector2(0, 0)
			};
			this.material = new THREE.ShaderMaterial({
				depthWrite    : false,
				uniforms      : uniforms,
				fragmentShader: this.prepare_effect(source),
				vertexShader  : [
					"varying vec2  texcoord;",
					"uniform vec2  resolution;",
					"void main() {",
					"texcoord = uv;",
					"	gl_Position = projectionMatrix * ",
					"		modelViewMatrix * vec4(",
					"		position.x * resolution.x,",
					"		position.y * resolution.y,",
					"		position.z,  1.0 );",
					"}"
				].join('\n')
			});			
			this.scene    = new THREE.Scene();
			this.camera   = new THREE.OrthographicCamera(100, 100, 100, 100, -10000, 10000);
			this.plane    = new THREE.PlaneBufferGeometry(1, 1);
			this.mesh     = new THREE.Mesh(this.plane, this.material);
			this.mesh.position.z = -100;
			this.scene.add(this.mesh);			
		}
		
		/**
		* render() - renders this effect. 
		* @param renderer {WebGlRenderer} the webgl renderer to use for this effect.
		* @param uniforms {object} uniforms for this shader.
		* @param target   {WebGLRenderTarget} (optional) the webgl render target to render to.
		* @returns {void}
		*/
		public render(renderer: THREE.WebGLRenderer, uniforms: any, target: THREE.WebGLRenderTarget) {
			var half_width     = target.width / 2;
			var half_height    = target.height / 2;
			this.camera.left   = -half_width;
			this.camera.right  = half_width;
			this.camera.top    = half_height;
			this.camera.bottom = -half_height;
			this.camera.updateProjectionMatrix();
			this.material.uniforms.resolution.value =
				new THREE.Vector2(target.width, target.height);
			Object.keys(uniforms).forEach(key => {
				if (this.material.uniforms[key])
					this.material.uniforms[key].value = 
						uniforms[key];
			});
			renderer.setClearColor(0x000000);
			//renderer.setSize (target.width, target.height);
			renderer.render  (this.scene, this.camera, target, true);
		}		
		
		/**
		 * disposes of this effect.
		 */
		public dispose() : void {
        	this.material.dispose();
        	this.plane.dispose();			
		}
		
		/**
		* parse_func(): parses this function (or string) to a string.
		* @param string_or_func (Function) - the string or function to parse.
		* @returns {string} - the shader string.
		*/
		private parse_to_string(string_or_func: any) : string {
			if (typeof string_or_func === "function") {
				var src = string_or_func.toString();
				var body = src.slice(src.indexOf("{") + 1, src.lastIndexOf("}"));
				if ((body.charAt(0) != '/') ||
					(body.charAt(1) != '*') ||
					(body.charAt(body.length - 2) != '*') ||
					(body.charAt(body.length - 1) != '/'))
					throw Error("parse_to_string: shader_func not properly formatted");
				return body.substring(2, body.length - 2);
			} else if (typeof string_or_func === 'string' || string_or_func instanceof String) {
				return string_or_func;
			} else {
				throw Error("parse_to_string: not a function or string.")
			}
		}
		
		/**
		 * parse_uniforms() - parses the uniform arguments from a glsl shader and converts to a threejs uniform.
		 * @param source {string} - the shader source to parse.
		 * @returns      {object} - the threejs uniform material parameters.
		 */
		private parse_uniforms(source: string) : any {
			return source
				.split  ('\n')
				.filter (line => line.indexOf('uniform') != -1)
				.map    (line => line
							.split  (' ')
							.filter (item => item.length > 0)
							.map    (item => item.replace(';', '').replace('\r', ''))
							.reduce ((param:any, token, index) => {
								switch (index) {
									case 0: break;
									case 1:
										switch (token) {
											case "int":         param.type = 'i';  break;
											case "float":       param.type = 'f';  break;
											case "vec2":        param.type = 'v2'; break;
											case "vec3":        param.type = 'v3'; break;
											case "vec4":        param.type = 'v4'; break;
											case "mat3":        param.type = 'm3'; break;
											case "mat4":        param.type = 'm4'; break;
											case "sampler2D":   param.type = 't';  break;
											case "samplerCube": param.type = 't';  break;
											default: break;
										}; break;
									case 2:
										param.name = token;
										break;
								}; return param;
						}, {}))
				.reduce((prev, current) => {
					if (current) {
						prev[current.name] = { type: current.type, value: null };
					};return prev;
			}, {});
		}
		
		/**
		* prepare_effect() - prepares the effect source into a valid webgl fragment shader.
		* @param source {string} the effect source.
		* @returns {string} the wrapped effect source.
		*/
		private prepare_effect(source: string) : string {
			return [
				"varying vec2  texcoord;",
				source,
				"void main() { gl_FragColor = effect(texcoord); }"]
				.join('\n');
		}
	}
}

 



    

    
