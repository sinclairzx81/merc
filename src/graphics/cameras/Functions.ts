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
/// <reference path= "../math/Functions.ts" />

module acid.graphics.cameras {
	
	/**
	 * mirrors this camera about a plane.
	 * @param camera {THREE.Camera} the camera to mirror
	 * @param plane {THREE.Plane} the plane to mirror against.
	 * @returns {THREE.Camera} a new camera mirrored against this plane.
	 */
	export function reflect(camera: THREE.PerspectiveCamera, plane: THREE.Plane) : THREE.Camera {
		var reflect = camera.clone()
		reflect.matrixAutoUpdate = false;
<<<<<<< HEAD
		reflect.matrix.identity()
		reflect.matrix.multiply(acid.graphics.math.createReflectionMatrix(plane))
		//reflect.matrix.multiply(camera.matrix.scale(new THREE.Vector3(-1, -1, 1)))
=======
		reflect.matrix.copy(acid.graphics.math.createReflectionMatrix(plane))
>>>>>>> master
		reflect.matrix.multiply(camera.matrix)
		reflect.updateProjectionMatrix();
		reflect.updateMatrixWorld(true);
		return reflect;
	}
}