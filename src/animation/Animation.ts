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

module acid.animation {
    
    /**
     * keyframe interface. 
     */
	export interface Frame<T> {
		time : number,
		value: T
	}
    
	/**
     * animation keyframe type.
     */
	export class Animation<T> {
		constructor(private frames: Frame<T>[], 
					private interpolation: (src: T, dst: T, amount: number) => T) {
			this.frames = this.frames.sort((a, b) => {
				if (a.time > b.time) return  1
				if (a.time < b.time) return -1
				return 0
			})				
		}
		
<<<<<<< HEAD
		public get(millisecond: number, repeat: boolean) : T { 
=======
        /**
         * adds a new frame of animation.
         */
        public add(frame: Frame<T>) {
            this.frames.push(frame)
			this.frames = this.frames.sort((a, b) => {
				if (a.time > b.time) return  1
				if (a.time < b.time) return -1
				return 0
			})	            
        }
        
        /**
         * gets the animation at this millisecond offset.
         */        
		public get(millisecond: number, repeat: boolean) : T { 
            if(this.frames.length == 0)
                throw Error("unable to get with empty frames")
            if(this.frames.length == 1)
                return this.frames[0].value
>>>>>>> master
            repeat = repeat || false
            var first  = this.frames[0];
            var last   = this.frames[this.frames.length - 1];
            if (repeat)  millisecond = millisecond % last.time;
            if (millisecond <= first.time) { return first.value } 
            if (millisecond >= last.time)  { return last.value }
            var src = null;
            var dst = null;
            for (var i = (this.frames.length - 1); i >= 0; i--) {
                if (millisecond >= this.frames[i].time) {
                    src = this.frames[i]
                    if (i < this.frames.length - 1)
                        dst = this.frames[i + 1]
                    else
                        src = this.frames[i]
                    break;
                }
            }
            var delta_0 = dst.time - src.time;
            var delta_1 = dst.time - millisecond;
            var amount  = (delta_1 != 0) ? delta_1 / delta_0 : 0;
            amount = -amount + 1;
            return this.interpolation(src.value, dst.value, amount)			
		}
	}
    
    
}