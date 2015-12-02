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
/// <reference path="../../common/Task.ts" />
/// <reference path="msgpack.ts" />

module acid.graphics.assets {
	
	/**
	 * loads the threejs json format.
	 * @param path {string} the uri of the resource.
	 * @returns {Task} a tau Task.
	 */	
	function load_json(url: string): acid.Task<any> {
		return new acid.Task((resolve, reject) => {
			var loader = new THREE.JSONLoader();
			loader.load(url, ( geometry, materials ) => {
				resolve({
					geometry: geometry,
					materials: materials
				})
			})
		})
	}
	/**
	 * loads the threejs object json format.
	 * @param path {string} the uri of the resource.
	 * @returns {Task} a tau Task.
	 */	
	function load_scene(url: string): acid.Task<THREE.Scene> {
		return new acid.Task<THREE.Scene>((resolve, reject) => {
			var loader = new THREE.ObjectLoader();
			loader.load(url, ( scene:any )  => {
				resolve(scene)
			})
		})
	}
	
	/**
	 * loads the threejs object json format.
	 * @param path {string} the uri of the resource.
	 * @returns {Task} a tau Task.
	 */	
	function load_msgpack(url: string): acid.Task<THREE.Scene> {
		return new acid.Task<THREE.Scene>((resolve, reject) => {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.responseType = 'arraybuffer';
			xhr.addEventListener("load", e => {
				var decoded = msgpack.decode( xhr.response )
				var loader  = new THREE.ObjectLoader();
				var scene   = <THREE.Scene>loader.parse( decoded )
				resolve(scene)
			}, false)
			xhr.send();	
		})
	}
		
	/**
	 * loads a texture.
	 * @param path {string} the uri of the resource.
	 * @returns {Task} a tau Task.
	 */	
	function load_texture(url: string): acid.Task<any> {
		return new acid.Task((resolve, reject) => {
			var loader = new THREE.TextureLoader();
			loader.load(url, texture => {
				resolve(texture)	
			})
		});
	}	
	/**
	 * loads a graphics resource
	 * @param type {string} the type of resource to load.
	 * @param path {string|string[]} the url(s) of the resource.
	 * @returns {Task<any|any[]>} a Task.
	 */
	export function load(type: string, urls: string |string[] ) : acid.Task<any> {
		if(typeof urls === "string") {
			switch(type) {
				case "texture":  return load_texture(urls)
				case "json":     return load_json(urls)
				case "scene":    return load_scene(urls)
				case "msgpack":  return load_msgpack(urls)
				default: return new acid.Task((resolve, reject) => 
						reject('unknown type'))
			}				
		}
		else {
			switch(type) {
				case "texture":   return acid.Task.all(urls.map(load_texture))
				case "json":      return acid.Task.all(urls.map(load_json))
				case "scene":     return acid.Task.all(urls.map(load_scene))
				case "msgpack":   return acid.Task.all(urls.map(load_msgpack))
				default: return new acid.Task((resolve, reject) => 
						reject('unknown type'))
			}			
		}
	} 
}