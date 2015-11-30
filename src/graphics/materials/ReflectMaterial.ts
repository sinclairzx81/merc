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
		//the planar reflection map.
		reflection_map? : THREE.Texture | THREE.WebGLRenderTarget;
		// the diffuse map.
		map? : THREE.Texture | THREE.WebGLRenderTarget;
		// term for the blur applied to emulate rough. 0.0 by default.
		roughness? : number;
		// a clamped number (0-1) for how much reflection takes place.
		reflect? : number
	}
	
	/**
	 * A reflection shader that reflects a surface from screen space.
	 */
	export class ReflectMaterial extends THREE.ShaderMaterial {
		
		constructor(private options ? : ReflectMaterialParamaters) {
			super({})
			
			this.uniforms.reflection_map = { 
				type : "t",
				value: options.reflection_map		
			};
			this.uniforms.map = { 
				type : "t",
				value: options.map		
			};
			this.uniforms.roughness = { 
				type : "f",
				value: options.roughness || 0 		
			}
			this.uniforms.reflect = { 
				type : "f",
				value: options.reflect || 0.5 		
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
			varying vec4       clipspace;
			varying vec2       texcoord;
			uniform sampler2D  reflection_map;
			uniform sampler2D  map;
			uniform float      roughness;
			uniform float      reflect;
			
			vec4 sample_map() {
				return texture2D(map, texcoord);
			}
				
			vec4 sample_reflection_map() {
				vec3 ndc = clipspace.xyz / clipspace.w;
				vec2 reflection_uv = ndc.xy * 0.5 + 0.5;
				vec4 accumulator = vec4(0.0);
				if(roughness > 0.0) {
					vec2  kernel[14];
					kernel[ 0] = reflection_uv + vec2(0.0, -0.028) * roughness;
					kernel[ 1] = reflection_uv + vec2(0.0, -0.024) * roughness;
					kernel[ 2] = reflection_uv + vec2(0.0, -0.020) * roughness;
					kernel[ 3] = reflection_uv + vec2(0.0, -0.016) * roughness;
					kernel[ 4] = reflection_uv + vec2(0.0, -0.012) * roughness;
					kernel[ 5] = reflection_uv + vec2(0.0, -0.008) * roughness;
					kernel[ 6] = reflection_uv + vec2(0.0, -0.004) * roughness;
					kernel[ 7] = reflection_uv + vec2(0.0,  0.004) * roughness;
					kernel[ 8] = reflection_uv + vec2(0.0,  0.008) * roughness;
					kernel[ 9] = reflection_uv + vec2(0.0,  0.012) * roughness;
					kernel[10] = reflection_uv + vec2(0.0,  0.016) * roughness;
					kernel[11] = reflection_uv + vec2(0.0,  0.020) * roughness;
					kernel[12] = reflection_uv + vec2(0.0,  0.024) * roughness;
					kernel[13] = reflection_uv + vec2(0.0,  0.028) * roughness;
					accumulator += texture2D(reflection_map, kernel[ 0])*0.0044299121055113265;
					accumulator += texture2D(reflection_map, kernel[ 1])*0.00895781211794;
					accumulator += texture2D(reflection_map, kernel[ 2])*0.0215963866053;
					accumulator += texture2D(reflection_map, kernel[ 3])*0.0443683338718;
					accumulator += texture2D(reflection_map, kernel[ 4])*0.0776744219933;
					accumulator += texture2D(reflection_map, kernel[ 5])*0.115876621105;
					accumulator += texture2D(reflection_map, kernel[ 6])*0.147308056121;
					accumulator += texture2D(reflection_map, reflection_uv    )*0.159576912161;
					accumulator += texture2D(reflection_map, kernel[ 7])*0.147308056121;
					accumulator += texture2D(reflection_map, kernel[ 8])*0.115876621105;
					accumulator += texture2D(reflection_map, kernel[ 9])*0.0776744219933;
					accumulator += texture2D(reflection_map, kernel[10])*0.0443683338718;
					accumulator += texture2D(reflection_map, kernel[11])*0.0215963866053;
					accumulator += texture2D(reflection_map, kernel[12])*0.00895781211794;
					accumulator += texture2D(reflection_map, kernel[13])*0.0044299121055113265;	
				} else {
					accumulator += texture2D(reflection_map, reflection_uv);
				}
<<<<<<< HEAD
				return accumulator;	
=======
				return accumulator;
>>>>>>> master
			}
			
			void main() {
				vec4 _map        = sample_map();
				vec4 _reflection = sample_reflection_map();
				gl_FragColor     = _map + (_reflection * reflect);
<<<<<<< HEAD
				
=======
>>>>>>> master
			}`		
		}
	}
}
