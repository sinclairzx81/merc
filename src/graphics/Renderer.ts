/*--------------------------------------------------------------------------

acid-js - multimedia web stuff

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

/// <reference path="../typings.ts" />
/// <reference path="Element.ts" />

module acid.graphics {
	
	export class Renderer extends THREE.WebGLRenderer {
		private material: THREE.ShaderMaterial;
		private scene   : THREE.Scene;
		private camera  : THREE.OrthographicCamera;
		private plane   : THREE.PlaneBufferGeometry;
		private mesh    : THREE.Mesh;
		
		constructor(private element : acid.graphics.Element) {
			super();
			this.initialize();
		}
		
		/**
		 * initializes this renderer
		 */
		private initialize() : void {
			// initialize
			this.element.appendChild(this.domElement)
			this.setSize(this.element.width, this.element.height)
			this.element.on("resize", _ =>
				this.setSize(this.element.width, this.element.height))
			
			this.shadowMap.enabled = true;
			this.shadowMap.type    = THREE.BasicShadowMap;
			this.setClearColor(0xFFFFFF);
			
			// initialize screen quad
			this.material  = new THREE.ShaderMaterial({
				depthWrite: false,
				uniforms: {
					map  : { type: "t",  value: null },
					scale: { type: "v2", value: [0, 0] } 
				},
				vertexShader: [
					"varying vec2  texcoord;",
					"uniform vec2  scale;",
					"void main() {",
					"	texcoord = uv;",
					"	gl_Position = projectionMatrix * ",
					"		modelViewMatrix * vec4(",
					"		position.x * scale.x,",
					"		position.y * scale.y,", 
					"		position.z,  1.0 );",
					"}"
				].join('\n'),
				fragmentShader: [
					"varying  vec2 	texcoord;",
					"uniform sampler2D map;",
					"void main() {",
					"	gl_FragColor = texture2D( map, texcoord );",
					"}"
				].join('\n')
			})
			this.scene  = new THREE.Scene()
			this.camera = new THREE.OrthographicCamera  (100, 100, 100, 100, -10000, 10000 )
			this.plane  = new THREE.PlaneBufferGeometry (1, 1)	
			this.mesh   = new THREE.Mesh( this.plane, this.material )
			this.mesh.position.z = -100	
			this.scene.add(this.mesh)			
		}
		
		
		/**
		* output() - submits this texture to the output buffer. 
		* note: The output of this texture will have full coverage over 
		* the display. If this is not desirable, you can set the crop 
		* flag to true to adjust the output to maintain the correct 
		* aspect of the texture being submitted. 
		* @param texture {THREE.Texture} the texture to render.
		* @param crop    {boolean} if true, will crop image to best fit display.
		*/	
		public output(texture: THREE.Texture | THREE.WebGLRenderTarget, crop: boolean) {
			var width       = this.element.width;
			var height      = this.element.height;
			var half_width  = width  / 2;
			var half_height = height / 2;
			var scalex      = width;
			var scaley      = height;
			if(crop != undefined && crop == true) {
				if(scalex > scaley) scaley = scalex;
				if(scalex < scaley) scalex = scaley;
			}
			this.camera.left     = -half_width;
			this.camera.right    =  half_width;
			this.camera.top      =  half_height;
			this.camera.bottom   = -half_height;
			this.camera.updateProjectionMatrix();			
			
			this.material.uniforms.map.value   = texture;
			this.material.uniforms.scale.value = new THREE.Vector2(scalex, scaley);-
			this.render ( this.scene, this.camera );
		}			
	}	
}