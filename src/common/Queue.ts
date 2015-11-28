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

module acid {
	
	/**
	 * A simple concurrency queue.
	 */
	export class Queue {
    	private queue   : {(next: () => void): void } [] = [];
    	private paused  : boolean = false;
		private running : number  = 0;	
		constructor(private concurrency: number = 1) {}
		
		/**
		 * runs this operation. callers to call next() on complete.
		 */
		public run(operation: (next: () => void) => void): void {
			this.queue.push(operation);
        	this.next(); 
		}
		
		/**
		 * attempts to run the next operation on the queue.
		 */
		private next() : void {
			if(this.queue.length > 0) {
				if(this.running < this.concurrency) {
					var operation = this.queue.shift()
					this.running += 1;
					operation(() => {
						this.running -= 1;
						if(!this.paused) 
                        	setTimeout(() => this.next())		
					})
				}
			}
		}
	}
}