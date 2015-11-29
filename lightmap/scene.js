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
		scene   : null
	}
	var cameras = {
		camera      : new THREE.PerspectiveCamera( 90, 1, 0.1, 1000 )
	}
	

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
		[{time: 0,      value: { height: 8.5, offset:  30.5 } },
		 {time: 4000,   value: { height: 8.5, offset:  30.5 } },
		 {time: 4300,   value: { height: 8.5, offset:  30.0 } },
		 {time: 12000,  value: { height: 8.5, offset:  30.5 } },
		 {time: 13300,  value: { height: 8.5, offset:  30.5 } },
		 {time: 14000,  value: { height: 8.5, offset:  30.0 } },
		 {time: 16300,  value: { height: 8.5, offset:  30.5 } }], function(src, dst, amount) {
			return { 
				height: acid.animation.lerp(src.height, dst.height, amount),
				offset: acid.animation.lerp(src.offset, dst.offset, amount)
			}
		})  
		
	//----------------------
	// lazy load scene.
	//----------------------
	acid.graphics.assets.load("scene", 
		"lightmap/assets/lightmap.json").then(function(scene) {
		acid.graphics.assets.load("texture", 
		["lightmap/assets/ceiling.jpg",
		 "lightmap/assets/wall.jpg", 
		 "lightmap/assets/cube.jpg",
		 "lightmap/assets/wood.jpg"
		 ]).then(function(textures) {
			scene.getObjectByName("light").material    = new THREE.MeshBasicMaterial ({ color: 0xFFFFFF, side: THREE.DoubleSide});
			scene.getObjectByName("light").visible     = false;
			scene.getObjectByName("ceiling").material  = new THREE.MeshBasicMaterial ({ map: textures[0], color: 0xFFFFFF, side: THREE.DoubleSide});
			scene.getObjectByName("wall").material     = new THREE.MeshBasicMaterial ({ map: textures[1], color: 0xFFFFFF, side: THREE.DoubleSide});
			scene.getObjectByName("cube").material     = new THREE.MeshBasicMaterial ({ map: textures[2], side: THREE.DoubleSide } );
			scene.getObjectByName("wood").material     = new acid.graphics.materials.ReflectMaterial({
				reflection_map : targets.reflect,
				map            : textures[3],
				roughness      : 0.3,
				reflect		   : 0.3
			});
			scenes.scene = scene			
		})
	});
	
	return {
		update : function(time) {
			var state = animation.get(time, true)
			var position = new THREE.Vector3(
				Math.cos((angle - 90) * (Math.PI / 180)) * state.offset, 
				state.height, 
				Math.sin((angle - 90) * (Math.PI / 180)) * state.offset)
			var lookat   = new THREE.Vector3(0, 4.6, 0)
			cameras.camera.position.set(position.x,  position.y, position.z);
			cameras.camera.up = new THREE.Vector3(0, 1, 0)
			cameras.camera.lookAt(lookat);
			angle = (Math.cos(time * 0.001) * 10) + 270; 
		},
		
		render : function(app) {
			if(scenes.scene) {
				//------------------------------------
				// render reflection
				//------------------------------------
				scenes.scene.getObjectByName("wood").visible = false;
				app.renderer.render(scenes.scene, 
					acid.graphics.cameras.reflect(cameras.camera, 
						new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)), 
						targets.reflect, 
						true)
				scenes.scene.getObjectByName("wood").visible = true;
				
				app.renderer.setClearColor(0xDDDDDD)						
				app.renderer.render(scenes.scene, cameras.camera, targets.scene, true)				
			}

			return targets;
		}
	}
})