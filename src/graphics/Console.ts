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

/// <reference path="Canvas" />

module acid.graphics {
	
	/**
	* Console options.
	*/
	export interface ConsoleOptions {
		/** the width of the terminal */
		width?  	      : number, 
		/** the height of the terminal */
		height? 	      : number,
		/** the text color */
		color?            : string,
		/** the background color */
		backgroundColor?  : string	
		/** the font family */
		font?             : string,
		/** the fontsize of the terminal (in pixels) */
		fontsize?         : number,
		/** the line height */
		lineheight?       : number,
		/** the number of lines to keep in the buffer */
		buffersize?       : number
	}
	
	/**
	 * Console rendering context bound to a threejs texture.
	 */
	export class Console  {
		private canvas            : acid.graphics.Canvas;
		private buffer            : string [];
		private ratio             : number;
		private devicePixelRatio  : number;
		private backingStoreRatio : number;
		
		/**
		* creates a new terminal.
		*/
		constructor(private options: ConsoleOptions) {
			 
			this.buffer = []
			this.initialize();
		}
		
		/**
		* initialize console.
		*/
		private initialize() : void {
			
			this.options 				  = this.options || {};
			this.options.width            = this.options.width            || 256;
			this.options.height           = this.options.height           || 256;
			this.options.color            = this.options.color            || "white";
			this.options.backgroundColor  = this.options.backgroundColor  || "black";		
			this.options.font             = this.options.font             || "monospace";
			this.options.fontsize         = this.options.fontsize         || 16;
			this.options.lineheight       = this.options.lineheight       || this.options.fontsize / 4;
			this.options.buffersize       = this.options.buffersize       || 1024;
			this.canvas                   = new acid.graphics.Canvas({
				width : this.options.width,
				height: this.options.height
			})
			this.log("initialize")				
			this.clear();
		}
		
		/**
		 * returns the texture associated with this console.
		 * @returns {THREE.Texture} the texture.
		 */
		public texture() : THREE.Texture {
			return this.canvas.texture()
		}

		/**
		 * disposes of this console.
		 * @returns {void}
		 */
		public dispose() : void {
			this.canvas.dispose();
		}
		
		/**
		* clears the terminal.
		* @returns {void}
		*/
		public clear() : void {
			this.buffer = []
			this.draw();
		}
		
		/**
		* write this message to the terminal.
		* @param message {string} the message to write.
		* @returns {void}
		*/
		public log(message: string) : void {
			var context = this.canvas.context()
			if(typeof message !== "string") 
				message = message.toString()
			var temp    = []
			message.split('').forEach(char => {
				temp.push(char)
				var metrics = context.measureText(temp.join(''));
				if(metrics.width > this.options.width) {
					temp.pop();
					var line = temp.join('').trim();
					if(line.length > 0)
						this.buffer.push(line)
					temp = [char]
				}	
			});
			var line = temp.join('').trim();
			if(line.length > 0)
				this.buffer.push(line)
			while(this.buffer.length > 
				this.options.buffersize) 
				this.buffer.shift();
			this.draw();
		}
		
		/**
		* draws the console buffer to the window.
		* @returns {void}
		*/
		private draw() : void {
			var context = this.canvas.context()			
			var subset = this.buffer.slice(Math.max(this.buffer.length - 
				(this.options.height / this.options.fontsize), 0)).reverse();
			context.fillStyle = this.options.backgroundColor
			context.fillRect(0, 0, this.options.width, this.options.height)
			context.font = this.options.fontsize.toString() + "px " + this.options.font;
			context.fillStyle = this.options.color
			subset.forEach((line, index) => {
				var y = (this.options.height- (this.options.lineheight * 2)) - 
					(index * (this.options.fontsize + this.options.lineheight)); 
				context.fillText(line, 4, y);			
			});
		}
	}
}