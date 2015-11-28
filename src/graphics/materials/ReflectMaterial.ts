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

/// <reference path="../../typings.ts" />

module acid.graphics.materials {
	
	export interface ReflectMaterialParamaters extends THREE.ShaderMaterialParameters {
		reflection : THREE.Texture | THREE.WebGLRenderTarget;
		map        : THREE.Texture | THREE.WebGLRenderTarget;
	}
	
	/**
	 * A reflection shader that reflects a surface from screen space.
	 */
	export class ReflectMaterial extends THREE.ShaderMaterial {
		
		constructor(private options ? : ReflectMaterialParamaters) {
			super({})
			this.uniforms.reflection = { 
				type : "t",
				value: options.reflection		
			};
			this.uniforms.map = { 
				type : "t",
				value: options.map		
			}				
			this.vertexShader = `
			varying vec4 clipspace;
			varying vec2 texcoord;
			void main() {
				clipspace = projectionMatrix * 
					modelViewMatrix * vec4(
					position.x,
					position.y, 
					position.z,  
					1.0);
				texcoord = uv;
				gl_Position = clipspace;
			}`
			this.fragmentShader = `
			varying vec4      clipspace;
			varying vec2      texcoord;
			uniform sampler2D reflection;
			uniform sampler2D map;
			void main() {
				vec3 ndc = clipspace.xyz / clipspace.w;
				vec4 _reflection = texture2D(reflection, ndc.xy * 0.5 + 0.5);
				vec4 _map        = texture2D(map, texcoord);
				gl_FragColor = _reflection + _map; 
			}`
					
		}
	}
}
