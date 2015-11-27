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

/// <reference path="../typings.ts" />

module acid.graphics {

	export interface CanvasOptions {
		width  : number,
		height : number    
	}
	
	/**
	 * Canvas rendering context bound to a threejs texture.
	 */
	export class Canvas {
		
		private _canvas     : HTMLCanvasElement;
		private _context    : CanvasRenderingContext2D;
		private _texture    : THREE.Texture;
		
		constructor(private options: CanvasOptions) {
			this._canvas              = document.createElement('canvas')
			this._context             = this._canvas.getContext('2d')
			this._texture       	  = new THREE.Texture(this._canvas)
			//this._texture.minFilter   = THREE.LinearFilter;
			//this._texture.magFilter   = THREE.LinearFilter;
			
			var ratio                 = 1;
			this._canvas.width        = this.options.width  * ratio;
			this._canvas.height       = this.options.height * ratio;
			this._canvas.style.width  = this.options.width  + "px";
			this._canvas.style.height = this.options.height + "px";
			this._context.setTransform(ratio, 0, 0, ratio, 0, 0);
		}
		/**
		 * returns the canvas rendering context.
		 * @returns {CanvasRenderingContext2D} the canvas context.
		 */
		public context() : CanvasRenderingContext2D {
			this._texture.needsUpdate = true
			return this._context
		}
		
		/**
		 * returns the threejs texture for this canvas.
		 * @returns {THREE.Texture} the texture.
		 */
		public texture() : THREE.Texture {
			return this._texture;
		}
		
		/**
		 * disposes of this canvas.
		 * @returns {void}
		 */
		public dispose() : void {
			this._texture.dispose();
		}		
	}
}