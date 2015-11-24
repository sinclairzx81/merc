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

/// <reference path="../common/Queue.ts" />
/// <reference path="../common/Task.ts" />

module mxdi {
	
	interface ModuleDescriptor {
		name     : string,
		names    : string[],
		callback :  (...args: any[]) => any	
	}
	
	var pending      : ModuleDescriptor = null;
	var descriptors  : { [name: string] : ModuleDescriptor } = {};
	var cache        : { [name: string] : any } = {};
	
	/**
	 * requests this resource as a string.
	 */
	var queue = new mxdi.Queue(1);
	function request(name: string): mxdi.Task<string> {
		return new Task<string>((resolve, reject) => {
			queue.run(next => {
				var xhr = new XMLHttpRequest()
				xhr.addEventListener("readystatechange", (event) => {
					if (xhr.readyState == 4) {
						switch(xhr.status) {
							case 200: resolve(xhr.responseText); break;
							default: reject("unable to load " + name); break;
						} next();
					}
				}, false)
				xhr.open("GET", name + ".js", true)
				xhr.send()				
			})
		})
	}
	
	/**
	 * loads this resource from the given path, returns a module descriptor.
	 */
	function load(name: string) : mxdi.Task<ModuleDescriptor> {  
		return new mxdi.Task<ModuleDescriptor>((resolve, reject) => {
			if(!descriptors[name]) {
				request(name).then(source => {
					var head    = document.getElementsByTagName("head")[0]
					var script  = document.createElement("script")
					var code    = document.createTextNode(source)
					script.type = "text/javascript";
					script.appendChild(code)
					head.appendChild(script)
					setTimeout(() => {
						if(pending) {
							descriptors[name] = {
								name     : name,
								names    : pending.names,
								callback : pending.callback
							}; pending = null;
							resolve(descriptors[name])
							return;					
						} reject("unable to locate define for " + name)
					})
				}).catch(reject);
			} else resolve(descriptors[name])
		})
	}
 	
	/**
	 * boots this module and returns its exports.
	 */
	function boot(descriptor: ModuleDescriptor): mxdi.Task<any> {
		return new mxdi.Task<any>((resolve, reject) => {
			mxdi.Task.all(descriptor.names.map(load)).then(descriptors => {
				mxdi.Task.all(descriptors.map(boot)).then(exports => {
					if(cache[descriptor.name]) {
						resolve(cache[descriptor.name])
					} else {
						cache[descriptor.name] = 
							descriptor.callback.apply(descriptor.callback, exports)
						resolve(cache[descriptor.name])	
					}
				}).catch(reject)
			}).catch(reject)		
		})
	}
	
	/**
	 * defines a module. 
	 */		
	export function define(name  : string, names: string[], callback: (...args: any[]) => any): void;
	export function define(names : string[], callback: (...args: any[]) => any): void;
	export function define(args  : any): void {
		if(arguments.length == 3)
			descriptors[<string>arguments[0]] = {
				name    : <string>arguments[0],
				names   : <string[]>arguments[1],
				callback: <(...args:any[])=>void>arguments[2]
			}
		if(arguments.length == 2)
			pending = {
				name    : 'unknown',
				names   : <string[]>arguments[0],
				callback: <(...args:any[])=>void>arguments[1]
			};
	}
		
	/**
	 * requires a module and returns a promise containing its exports.
	 */	
	export function require(names: string[], callback: (...args: any[]) => any): Task<any> {
		return boot({
			name    : undefined,
			names   : names,
			callback: callback
		})
	}
	
	/**
	 * reduces this module to a single output. (experimental)
	 */
	/*
	function compile(path:string, name: string): Task<string> {
		return new Task<string>((resolve, reject) => {
			require([path], function() {
				var call = 
				[
					"var cache = {};",
					"var call = function() {",
					"var name = arguments[0];",
					"var args = [];",
					"for(var i = 1; i < arguments.length; i++)",
					"args.push(arguments[i]);",								
					"if(cache[name]) return cache[name];",
					"cache[name] = bundle[name].apply(bundle[name], args);",
					"return cache[name];",
					"};"
				].join("\n")
				
				var bundle = 
				[
					'var bundle = {\n', 
					Object.keys(descriptors)
					.map(key => descriptors[key])
					.map(descriptor => {
						return [
							'"', descriptor.name, '": ', 
							descriptor.callback.toString()
						].join('')
					}).join(",\n"), 
					'\n};'
				].join('')
				
				var link = (descriptor: ModuleDescriptor): string => {
					var buf = [];
					buf.push("call(")
					buf.push('"' + descriptor.name + '"')
					if(descriptor.names.length > 0) {
						buf.push(", ")
						buf.push(descriptor.names.map(path => link(descriptors[path])))					
					} buf.push(")")
					return buf.join("")
				}
				
				resolve([
					"var ", name, " = function() {", 
					bundle, 
					call, "\n return ", 
					link(descriptors[path]), "\n};"
				].join(""))
			}).catch(reject)
		})
	}*/
}