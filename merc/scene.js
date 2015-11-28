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
		[{time: 0,      value: { height: 0.5, offset:  -3.5 } },
		 {time: 4000,   value: { height: 1.5, offset:  -4.5 } },
		 {time: 4300,   value: { height: 3.5, offset:  -4.0 } },
		 {time: 12000,  value: { height: 4.5, offset:  -1.5 } },
		 {time: 13300,  value: { height: 0.5, offset:  -3.5 } },
		 {time: 14000,  value: { height: 0.5, offset:  -7.0 } },
		 {time: 16300,  value: { height: 0.5, offset:  -4.5 } }], function(src, dst, amount) {
			return { 
				height: acid.animation.lerp(src.height, dst.height, amount),
				offset: acid.animation.lerp(src.offset, dst.offset, amount)
			}
		})  
	//----------------------
	// lazy load scene.
	//----------------------
	acid.graphics.assets.load("scene", "merc/assets/merc.json").then(function(scene) {
		acid.graphics.assets.load("texture", 
		["merc/assets/merc-black.jpg", 
		 "merc/assets/plate.jpg",
		 "merc/assets/ground.jpg"]).then(function(textures) {
			scene.getObjectByName("body").material        = new THREE.MeshPhongMaterial   ({ map: textures[0], specular: 0x050505, shininess: 100, side: THREE.DoubleSide } );
			scene.getObjectByName("plates").material      = new THREE.MeshPhongMaterial   ({ map: textures[1], specular: 0x050505, shininess: 100, side: THREE.DoubleSide } );
			scene.getObjectByName("chassis").material     = new THREE.MeshPhongMaterial   ({color: 0x000000, side: THREE.DoubleSide});
			scene.getObjectByName("chrome").material      = new THREE.MeshPhongMaterial   ({color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 100, side: THREE.DoubleSide});
			scene.getObjectByName("tyre0").material       = new THREE.MeshLambertMaterial ({color: 0x222222, side: THREE.DoubleSide});
			scene.getObjectByName("tyre1").material       = new THREE.MeshLambertMaterial ({color: 0x222222, side: THREE.DoubleSide});
			scene.getObjectByName("tyre2").material       = new THREE.MeshLambertMaterial ({color: 0x222222, side: THREE.DoubleSide});
			scene.getObjectByName("tyre3").material       = new THREE.MeshLambertMaterial ({color: 0x222222, side: THREE.DoubleSide});
			scene.getObjectByName("mag0").material        = new THREE.MeshPhongMaterial   ({color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 100, side: THREE.DoubleSide});
			scene.getObjectByName("mag1").material        = new THREE.MeshPhongMaterial   ({color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 100, side: THREE.DoubleSide});
			scene.getObjectByName("mag2").material        = new THREE.MeshPhongMaterial   ({color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 100, side: THREE.DoubleSide});
			scene.getObjectByName("mag3").material        = new THREE.MeshPhongMaterial   ({color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 100, side: THREE.DoubleSide});
			scene.getObjectByName("fender").material      = new THREE.MeshPhongMaterial   ({color: 0x000000, side: THREE.DoubleSide});
			scene.getObjectByName("seats").material       = new THREE.MeshPhongMaterial   ({color: 0xC4854D, side: THREE.DoubleSide});
			scene.getObjectByName("interior").material    = new THREE.MeshPhongMaterial   ({color: 0xC4854D, side: THREE.DoubleSide});			
			scene.getObjectByName("wipers").material      = new THREE.MeshPhongMaterial   ({color: 0xC4854D, side: THREE.DoubleSide});
			scene.getObjectByName("steering").material    = new THREE.MeshPhongMaterial   ({color: 0x333333, side: THREE.DoubleSide});
			scene.getObjectByName("windows").material     = new THREE.MeshPhongMaterial   ({color: 0x333333, transparent: true, opacity: 0.9, side: THREE.DoubleSide});
			scene.getObjectByName("headlights").material  = new THREE.MeshPhongMaterial   ({color: 0x333333, specular: 0xFFFFFF,transparent: true, opacity: 0.9, side: THREE.DoubleSide});
			scene.getObjectByName("rearlights").material  = new THREE.MeshPhongMaterial   ({color: 0xBB0000, transparent: true, opacity: 0.9, side: THREE.DoubleSide});
			textures[2].wrapS = THREE.RepeatWrapping;
			textures[2].wrapT = THREE.RepeatWrapping;		
			scene.getObjectByName("ground").material      = new acid.graphics.materials.ReflectMaterial({
				reflection_map : targets.reflect,
				map            : textures[2],
				roughness      : 0.4,
				reflect		   : 0.5
			});
			scenes.scene = scene			
		})
	});
	
	return {
		update : function(time) {
			var state = animation.get(time, true)
			// animate camera
			var position = new THREE.Vector3(
				Math.cos((angle - 90) * (Math.PI / 180)) * state.offset, 
				state.height, 
				Math.sin((angle - 90) * (Math.PI / 180)) * state.offset)
			var lookat   = new THREE.Vector3(0, 0.6, 0)
			camera.position.set(position.x,  position.y, position.z);
			camera.up = new THREE.Vector3(0, 1, 0)
			camera.lookAt(lookat);
			angle += 0.2
		},
		render : function(app) {
			if(scenes.scene) {
				scenes.scene.getObjectByName("ground").visible = false;
				app.renderer.render(scenes.scene, 
					acid.graphics.cameras.reflect(camera, 
						new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)), 
						targets.reflect, 
						true)	
				scenes.scene.getObjectByName("ground").visible = true;							
				app.renderer.render(scenes.scene, camera, targets.scene, true)				
			}

			return targets;
		}
	}
})