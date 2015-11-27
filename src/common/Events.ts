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
     * singular event.
     */
    class Event {
        
        private handlers: {
            once    : boolean;
            callback: (data: any) => void
        }[] = []
        
        /**
        * once() : subscribes to this event once.
        * @param callback {function} the callback.
        * @returns {void}
        */        
        public once(callback: (data: any) => void) : void {
            this.handlers.push({
                once    : true,
                callback: callback
            })
        }
        /**
        * on() : subscribes to this event once.
        * @param callback {function} the callback.
        * @returns {void}
        */         
        public on(callback: (data: any) => void) : void {
            this.handlers.push({
                once    : false,
                callback: callback
            })
        } 
        
        /**
        * remove() : removes this callback from the event.
        * @param callback {any} the callback to remove
        * @returns {void}
        */
        public remove (callback: (data: any) => void) : void {
            this.handlers = 
                this.handlers.filter(handler => 
                    handler.callback != callback)
        }
    
        /**
        * emit() : emits data to listeners of this event.
        * @param data {any} the data to emit.
        * @param data {any} the data to emit.
        * @returns {void}
        */
        public emit(data: any) : void {
            this.handlers.forEach(handler =>
                handler.callback(data))
            this.handlers = 
                this.handlers.filter(handler =>
                    handler.once == false)
        }          
    }
    /**
     * Events
     */
    export class Events {
        private events: Event[] = []
        /**
        * once() : subscribes to this event once.
        * @param name {string} the name of this event.
        * @param callback {function} the callback.
        * @returns {void}
        */
        public once(name: string, callback: (data: any) => void) : void{
            if(!this.events[name]) {
                this.events[name] = new Event()
            } this.events[name].once(callback)
        }
        /**
        * on() : subscribes to this event.
        * @param name {string} the name of this event.
        * @param callback {function} the callback.
        * @returns {void}
        */
        public on(name: string, callback: (data: any) => void) : void {
            if(!this.events[name]) {
                this.events[name] = new Event()
            } this.events[name].on(callback)
        }
        /**
        * remove() : removes this callback from the event.
        * @param name {string} the name of the event.
        * @param callback {any} the callback to remove
        * @returns {void}
        */
        public remove(name: string, callback: (data: any) => void): void {
            if(!this.events[name]) {
                this.events[name].remove(callback)
            }
        }
        /**
        * emit() : emits data to listeners of this event.
        * @param name {string} the name of the event.
        * @param data {any} the data to emit.
        * @returns {void}
        */
        public emit (name: string, data: any) : void {
            if(this.events[name]) {
                this.events[name].emit(data)
            }
        }        
    }
}
