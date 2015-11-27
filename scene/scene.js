/// <reference path="../bin/acid.d.ts" />

acid.define([], function() {
	
	//----------------------
	// variables..
	//----------------------
	var width         = 1024;
	var	height        = 1024;	
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
		scene: new THREE.WebGLRenderTarget(width, height, {
			minFilter: THREE.LinearFilter,
			maxFilter: THREE.LinearFilter
		}),		
		reflect: new THREE.WebGLRenderTarget(width, height, {
			minFilter: THREE.LinearFilter,
			maxFilter: THREE.LinearFilter
		}),	
		output: new THREE.WebGLRenderTarget(width, height, {
			minFilter: THREE.LinearFilter,
			maxFilter: THREE.LinearFilter
		})		
	}
	
	var effects =  {
		mix: new acid.graphics.effects.Effect(function() {/* 
			uniform sampler2D map0;
			uniform sampler2D map1;
			vec4 effect(vec2 uv) {
				vec4 a = texture2D(map0, uv);
				vec4 b = texture2D(map1, uv);
				return a + b;
			}
		*/})
	}
	
	//----------------------
	// animation..
	//----------------------
	
	var animation = new acid.animation.Animation (
		[{time: 0,     value: { height: 0.0, offset:  3.5 } },
		 {time: 4000,  value: { height: 1.5, offset:  3.5 } },
		 {time: 4300,  value: { height: 3.5, offset:  7.0 } },
		 {time: 8000,  value: { height: 4.5, offset:  7.5 } },
		 {time: 8300,  value: { height: 0.5, offset:  3.5 } },
		 {time: 12000, value: { height: 0.5, offset:  2.5 } },
		 {time: 12300, value: { height: 0.5, offset:  3.5 } }], function(src, dst, amount) {
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
			 								  "scene/assets/wall.jpg"])
			.then(function(textures) {
				// scene..							 					   				
				scenes.scene.add(new THREE.Mesh(models[0].geometry, new THREE.MeshBasicMaterial( { map: textures[0] } )))
				scenes.scene.add(new THREE.Mesh(models[1].geometry, new THREE.MeshBasicMaterial( { map: textures[1] } )))
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
			effects.mix.render(app.renderer, {
				map0: targets.scene,
				map1: targets.reflect
			}, targets.output)
			return targets;
		}
	}
})