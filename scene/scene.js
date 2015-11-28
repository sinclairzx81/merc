/// <reference path="../bin/acid.d.ts" />

acid.define([], function() {
	
	//----------------------
	// variables..
	//----------------------
	var width         = 1600;
	var	height        = 1600;	
	var angle         = 0;
	
	//----------------------
	// scene..
	//----------------------
	var scenes = {
		scene   : new THREE.Scene(),
		reflect : new THREE.Scene()
	}
	var camera = new THREE.PerspectiveCamera( 90, 1, 0.1, 1000 );
	var targets = {
		reflect: new THREE.WebGLRenderTarget(width, height, {
			minFilter: THREE.LinearFilter,
			maxFilter: THREE.LinearFilter
		}),		
		scene: new THREE.WebGLRenderTarget(width, height, {
			minFilter: THREE.LinearFilter,
			maxFilter: THREE.LinearFilter
		})
	}
	
	//----------------------
	// animation..
	//----------------------
	
	var animation = new acid.animation.Animation (
		[{time: 0,      value: { height: 0.5, offset:  3.5 } },
		 {time: 4000,   value: { height: 1.5, offset:  3.5 } },
		 {time: 4300,   value: { height: 3.5, offset:  7.0 } },
		 {time: 12000,  value: { height: 4.5, offset:  7.5 } },
		 {time: 13300,  value: { height: 0.5, offset:  2.5 } },
		 {time: 14000,  value: { height: 0.5, offset:  3.0 } },
		 {time: 16300,  value: { height: 0.5, offset:  3.5 } }], function(src, dst, amount) {
			return { 
				height: acid.animation.lerp(src.height, dst.height, amount),
				offset: acid.animation.lerp(src.offset, dst.offset, amount)
			}
		})  
			
	//----------------------
	// lazy load scene.
	//----------------------	
	acid.graphics.assets.load("json", ["scene/assets/cube.json",
		 							   "scene/assets/floor.json",
		 							   "scene/assets/wall.json",
		 							   "scene/assets/light.json"])
		.then(function(models) {				  
		acid.graphics.assets.load("texture", ["scene/assets/cube.jpg",
			 								  "scene/assets/floor.jpg",
			 								  "scene/assets/wall.jpg",
											  "scene/assets/test.jpg"])
			.then(function(textures) {
				// scene..							 					   				
				scenes.scene.add(new THREE.Mesh(models[0].geometry, new THREE.MeshBasicMaterial( { map: textures[0] } )))
				scenes.scene.add(new THREE.Mesh(models[1].geometry, new acid.graphics.materials.ReflectMaterial({
					reflection: targets.reflect,
					map       : textures[1]
				})));
				scenes.scene.add(new THREE.Mesh(models[2].geometry, new THREE.MeshBasicMaterial( { map: textures[2] } )))
				scenes.scene.add(new THREE.Mesh(models[3].geometry, new THREE.MeshBasicMaterial( { color: 0xFFFFFF } )))
				
				// reflect				 					   				
				scenes.reflect.add(new THREE.Mesh(models[0].geometry, new THREE.MeshBasicMaterial( { map: textures[0], side: THREE.DoubleSide } )))
				scenes.reflect.add(new THREE.Mesh(models[2].geometry, new THREE.MeshBasicMaterial( { map: textures[2], side: THREE.DoubleSide } )))
				scenes.reflect.add(new THREE.Mesh(models[3].geometry, new THREE.MeshBasicMaterial( { color: 0xFFFFFF,  side: THREE.DoubleSide } )))				
		});			
	});
	
	return {
		update : function(time) {
			var state = animation.get(time, true)
			// animate camera
			var position = new THREE.Vector3(
				Math.cos((angle - 90) * (Math.PI / 180)) * state.offset, 
				state.height, 
				Math.sin((angle - 90) * (Math.PI / 180)) * state.offset)
			var lookat   = new THREE.Vector3(
				Math.cos((angle) * (Math.PI / 180)) * 1.5, 
				1.5, 
				Math.sin((angle) * (Math.PI / 180)) * 1.5)
				
				camera.position.set(position.x,  position.y, position.z);
				camera.up = new THREE.Vector3(0, 1, 0)
				camera.lookAt(lookat);
			if(acid.input.gamepad.enabled) 
				angle = acid.input.gamepad.sticks.left.x * 90			
			else
				angle += 0.05			
		},
		render : function(app) {
			
			app.renderer.render(scenes.reflect, 
				acid.graphics.cameras.reflect(camera, 
					new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)), 
					targets.reflect, 
					true)
					
			app.renderer.render(scenes.scene, camera, targets.scene, true)
			return targets;
		}
	}
})