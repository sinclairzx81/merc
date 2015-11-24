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

module mxdi.loop {
	var running = false;
	
	var update_handlers: {
		started : Date,
		last    : Date,
		callback: (status: LoopStatus) => void
	}[] = [];
		
	var render_handlers: {
		started : Date,
		last    : Date,
		callback: (status: LoopStatus) => void
	}[] = [];	
	
	export interface LoopStatus {
		delta   : number,
		runtime : number
	}
	
	/**
	 * starts request animation frame loop.
	 */
	export function start() {
		if(!running) {
			running = true;
			var step = () => { 
				// process update handlers
				update_handlers.forEach(function (handler) {
					var now     = new Date();
					var delta   = now.getTime() - handler.last.getTime();
					var elapsed = now.getTime() - handler.started.getTime();
					handler.last = now
					handler.callback({
						delta   : delta,
						runtime : elapsed
					})
				})
				// process render handlers
				render_handlers.forEach(function (handler) {
					var now     = new Date();
					var delta   = now.getTime() - handler.last.getTime();
					var elapsed = now.getTime() - handler.started.getTime();
					handler.last = now
					handler.callback({
						delta   : delta,
						runtime : elapsed
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
	
	/**
	 * subscribes to the update cycle.
	 */
	export function update(callback: (status: LoopStatus) => void): void {
		update_handlers.push({
			started  : new Date(), // when loop started.
			last     : new Date(), // the last iteration time.
			callback : callback    // the callback.
		})			
	}
	
	/**
	 * subscribes to the render cycle.
	 */
	export function render(callback: (status: LoopStatus) => void): void {
		render_handlers.push({
			started  : new Date(), // when loop started.
			last     : new Date(), // the last iteration time.
			callback : callback    // the callback.
		})			
	}
}