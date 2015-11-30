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

module acid.graphics.math {
	/**
<<<<<<< HEAD
	 * creates a new reflection matrix about this plane.
=======
	 * creates a new reflection matrix about this plane. The result matrix
	 * can be multiplied against any other matrix to reflect it.
>>>>>>> master
	 */
	export function createReflectionMatrix(plane: THREE.Plane) : THREE.Matrix4 {
		var n = plane.normalize()
		var m = new THREE.Matrix4()
<<<<<<< HEAD
		var m11 =  1.0 - 2.0 * n.normal.x * n.normal.x;
		var m12 =  2.0       * n.normal.x * n.normal.y;
		var m13 =  2.0       * n.normal.x * n.normal.z;
		var m14 =  0.0;
		var m21 = -2.0       * n.normal.x * n.normal.y;
		var m22  = 1.0 - 2.0 * n.normal.y * n.normal.y;
		var m23 = -2.0       * n.normal.y * n.normal.z;
		var m24 =  0.0;
		var m31 = -2.0       * n.normal.z * n.normal.x;
		var m32 = -2.0       * n.normal.z * n.normal.y;
		var m33 =  1.0 - 2.0 * n.normal.z * n.normal.z;
		var m34 =  0.0;
		var m41 = -2.0 * n.constant * n.normal.x;
		var m42 = -2.0 * n.constant * n.normal.y;
		var m43 = -2.0 * n.constant * n.normal.z;
		var m44 =  1.0;
		return m.set(m11, m12, m13, m14,
					 m21, m22, m23, m24,
					 m31, m32, m33, m34,
					 m41, m42, m43, m44);			 
=======
		return m.set(
			 1.0 - 2.0 * n.normal.x * n.normal.x, 
			 2.0 * n.normal.x * n.normal.y, 
			 2.0 * n.normal.x * n.normal.z, 
			 0.0,
			-2.0 * n.normal.x * n.normal.y, 
			 1.0 - 2.0 * n.normal.y * n.normal.y, 
			-2.0 * n.normal.y * n.normal.z, 
			 0.0,
			-2.0 * n.normal.z * n.normal.x, 
			-2.0 * n.normal.z * n.normal.y, 
			 1.0 - 2.0 * n.normal.z * n.normal.z, 
			 0.0,
			-2.0 * n.constant * n.normal.x, 
			-2.0 * n.constant * n.normal.y, 
			-2.0 * n.constant * n.normal.z, 
			 1.0);			 
>>>>>>> master
	}
}