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
	 * simple fallback for a ES6 promise.
	 */
	export class Task<T extends any> {
		private state   : string  = "pending";
		private thens   : { (value: any):void }[] = [];
		private catches : { (error: any):void }[] = [];
		private value   : T    = null;
		private error   : any  = null;		
		
		/**
		 * initializes a new task with a resolver.
		 */
		constructor(resolver: (resolve: (value: T) => void, reject : (error: any) => void) => void) {
			setTimeout(() => {
				try {
					resolver(value => this.resolve(value), error => this.reject(error));
				} catch (error) {
					this.reject(error);
				}				
			})
		}
		
		/**
		 * will trigger this callback once this value is resolved.
		 */
		public then(callback: (value: T) => void) : Task<T> {
			switch (this.state) {
				case "pending": this.thens.push(callback); break;
				case "resolved": callback(this.value); break;
				case "rejected": break;
			} return this;			
		}
		/**
		 * will trigger this callback if this task rejects.
		 */		
		public catch(callback: (error: any) => void) : Task<T> {
			switch (this.state) {
				case "pending": this.catches.push(callback); break;
				case "rejected": callback(this.error); break;
				case "resolved": break;
			} return this;			
		}
		
		/**
		 * internally resolves this task.
		 */
		private resolve(value: any) : void {
			switch (this.state) {
				case "pending":
					this.state   = "resolved"
					this.value   = value
					this.thens.forEach(callback => callback(value))
					this.thens   = []
					this.catches = []
					break;
			}	
		}
		
		/**
		 * internally rejects this task.
		 */		
		private reject(error: any) : void {
			switch (this.state) {
				case "pending":
					this.state   = "rejected"
					this.error   = error  
					this.catches.forEach(callback => callback(error))
					this.thens   = []
					this.catches = []
					break;
			}			
		}
		/**
		 * runs all these tasks in parallel.
		 */
		public static all<T>(tasks: Task<T>[]) : Task<T[]> {
			return new Task<T[]>((resolve, reject) => {
				if (tasks.length == 0) {
					resolve([])
					return
				}
				var completed = 0;
				var values    = new Array(tasks.length)
				tasks.forEach((task, index) => {
					task.then(value => {
						completed += 1;
						values[index] = value;
						if (completed == tasks.length)
							resolve(values)
					}).catch(reject)
				})
			})			
		}
	}
}