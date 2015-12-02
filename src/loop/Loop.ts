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

module acid.loop {
	
	var running = false;
	var update_handlers: { started: Date, last: Date, callback: (status: LoopInfo) => void}[] = [];
	var render_handlers: { started: Date, last: Date, callback: (status: LoopInfo) => void}[] = [];	
	
	export interface LoopInfo {
		/**
		 * the elapsed time between this cycles and the previous.
		 */
		elapsed   : number,
		
		/**
		 * the total running time since this loop was started.
		 */
		runningTime : number
	}
	
	/**
	 * subscribes to the update cycle.
	 */
	export function update(callback: (status: LoopInfo) => void): void {
		update_handlers.push({
			started  : new Date(), // when loop started.
			last     : new Date(), // the last iteration time.
			callback : callback    // the callback.
		})			
	}
	
	/**
	 * subscribes to the render cycle.
	 */
	export function render(callback: (status: LoopInfo) => void): void {
		render_handlers.push({
			started  : new Date(), // when loop started.
			last     : new Date(), // the last iteration time.
			callback : callback    // the callback.
		})			
	}
		
	/**
	 * starts request animation frame loop.
	 */
	export function start() {
		if(!running) {
			running = true;
			var step = () => {
				var now     = new Date();
				var time    = now.getTime();				
				//-------------------------------
				// process update handlers
				//-------------------------------
				update_handlers.forEach(handler => {
					var delta   = time - handler.last.getTime();
					var elapsed = time - handler.started.getTime();
					handler.last = now
					handler.callback({
						elapsed   : delta,
						runningTime : elapsed
					})
				})
				//-------------------------------
				// process render handlers
				//-------------------------------
				render_handlers.forEach(handler => {
					var delta   = time - handler.last.getTime();
					var elapsed = time - handler.started.getTime();
					handler.last = now
					handler.callback({
						elapsed   : delta,
						runningTime : elapsed
					})
				})				
				if(running) {
					window.requestAnimationFrame(step);	
				}
			}; window.requestAnimationFrame(step);			
		}	
	}
	
	/**
	 * stops the request animation frame loop.
	 */
	export function stop(): void {
		running = false;
	}
}