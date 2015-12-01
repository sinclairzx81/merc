/// <reference path="../bin/acid.d.ts" />

acid.define([], function() {
	
	//----------------------
	// variables..
	//----------------------
	var width         = 1600;
	var	height        = 1600;
	
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
		reflect: new THREE.WebGLRenderTarget(width / 2, height / 2, {
			minFilter: THREE.LinearFilter,
			maxFilter: THREE.LinearFilter
		}),		
		scene: new THREE.WebGLRenderTarget(width, height, {
			minFilter: THREE.LinearFilter,
			maxFilter: THREE.LinearFilter
		})
	}
	
	var animation = new acid.animation.Animation (
		[], function(src, dst, amount) {
			return { 
				position : acid.animation.lerp3(src.position, dst.position, amount),
				target   : acid.animation.lerp3(src.target,   dst.target, amount),
				up       : acid.animation.lerp3(src.up,       dst.up, amount)
			}
		})
		
	//----------------------
	// lazy load scene.
	//----------------------
	acid.graphics.assets.load("scene", 
		"showroom/assets/scene.json").then(function(scene) {
		acid.graphics.assets.load("texture", [
			"showroom/assets/room-floor.jpg",
			"showroom/assets/room-wall.jpg",
			"showroom/assets/room-arch.jpg",
			"showroom/assets/room-ceiling.jpg",
			"showroom/assets/stage-floor.jpg",
			"showroom/assets/display-top.jpg",
			"showroom/assets/stage-panel.jpg",
		]).then(function(textures) {
			
			//-------------------------------
			// environment
			//-------------------------------
			scene.getObjectByName("room-arch").material       = new THREE.MeshBasicMaterial({map: textures[2],  wireframe: false, side: THREE.DoubleSide});
			scene.getObjectByName("room-ceiling").material    = new THREE.MeshBasicMaterial({map: textures[3],  wireframe: false, side: THREE.DoubleSide});
			scene.getObjectByName("room-floor").material      = new THREE.MeshBasicMaterial({map: textures[0],  wireframe: false, side: THREE.DoubleSide});
			scene.getObjectByName("room-wall").material       = new THREE.MeshBasicMaterial({map: textures[1],  wireframe: false, side: THREE.DoubleSide});
			scene.getObjectByName("stage-floor").material     = new THREE.MeshBasicMaterial({map: textures[4],  wireframe: false, side: THREE.DoubleSide});
			scene.getObjectByName("stage-light").material     = new THREE.MeshBasicMaterial({color: 0xFFFFFF,   wireframe: false, side: THREE.DoubleSide});
			scene.getObjectByName("stage-panel").material     = new THREE.MeshBasicMaterial({map: textures[6],  wireframe: false, side: THREE.DoubleSide});
			scene.getObjectByName("stage-wall").material      = new THREE.MeshPhongMaterial({color: 0x333333,   transparent: true, opacity: 0.8, side: THREE.DoubleSide});
			scene.getObjectByName("room-floor").material = new acid.graphics.materials.ReflectMaterial({
				reflection_map : targets.reflect,
				map            : textures[0],
				roughness      : 0.7,
				reflect		   : 0.3
			});					
			scene.getObjectByName("stage-floor").material = new acid.graphics.materials.ReflectMaterial({
				reflection_map : targets.reflect,
				map            : textures[4],
				roughness      : 0.4,
				reflect		   : 0.3
			});
			
			//-------------------------------
			// car - environment map
			//-------------------------------
			var car_environment_cubemap  = new THREE.CubeCamera(1, 1000, 512);
			car_environment_cubemap.name = "car-environment-cubemap";
			car_environment_cubemap.position.set(0, 1, 0)
			scene.add(car_environment_cubemap)
			
			//-------------------------------
			// car
			//-------------------------------			
			scene.getObjectByName("car-panels").material       = new THREE.MeshPhongMaterial({ envMap: car_environment_cubemap.renderTarget, color: 0x222222, specular: 0x222222, emissive: 0x333333, shininess: 5, side: THREE.DoubleSide } );
			scene.getObjectByName("car-chassis").material      = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false, side: THREE.DoubleSide});
			scene.getObjectByName("car-chrome").material       = new THREE.MeshPhongMaterial({ envMap: car_environment_cubemap.renderTarget, color: 0xFFFFFF, specular: 0xFFFFFF, emissive: 0xFFFFFF, shininess: 100, side: THREE.DoubleSide});
			scene.getObjectByName("car-fender").material       = new THREE.MeshPhongMaterial({ color: 0x000000, side: THREE.DoubleSide});
			scene.getObjectByName("car-headlights").material   = new THREE.MeshPhongMaterial({ envMap: car_environment_cubemap.renderTarget, color: 0xFFFFFF, specular: 0xFFFFFF, emissive: 0xFFFFFF, transparent: true, opacity: 0.9, side: THREE.DoubleSide});
			scene.getObjectByName("car-interior").material     = new THREE.MeshPhongMaterial({ color: 0xC4854D, side: THREE.DoubleSide});
			scene.getObjectByName("car-mag-0").material        = new THREE.MeshPhongMaterial({ envMap: car_environment_cubemap.renderTarget, color: 0xC87533, specular: 0xFFFFFF, emissive: 0xFFFFFF, shininess: 100, side: THREE.DoubleSide});
			scene.getObjectByName("car-mag-1").material        = new THREE.MeshPhongMaterial({ envMap: car_environment_cubemap.renderTarget, color: 0xC87533, specular: 0xFFFFFF, emissive: 0xFFFFFF, shininess: 100, side: THREE.DoubleSide});
			scene.getObjectByName("car-mag-2").material        = new THREE.MeshPhongMaterial({ envMap: car_environment_cubemap.renderTarget, color: 0xC87533, specular: 0xFFFFFF, emissive: 0xFFFFFF, shininess: 100, side: THREE.DoubleSide});
			scene.getObjectByName("car-mag-3").material        = new THREE.MeshPhongMaterial({ envMap: car_environment_cubemap.renderTarget, color: 0xC87533, specular: 0xFFFFFF, emissive: 0xFFFFFF, shininess: 100, side: THREE.DoubleSide});
			scene.getObjectByName("car-plates").material       = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, side: THREE.DoubleSide});
			scene.getObjectByName("car-rearlights").material   = new THREE.MeshPhongMaterial({ envMap: car_environment_cubemap.renderTarget, color: 0x660000, transparent: true, opacity: 0.9, side: THREE.DoubleSide});
			scene.getObjectByName("car-seats").material        = new THREE.MeshPhongMaterial({ color: 0xC4854D, side: THREE.DoubleSide});
			scene.getObjectByName("car-steering").material     = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, side: THREE.DoubleSide});
			scene.getObjectByName("car-wheel-0").material      = new THREE.MeshPhongMaterial({ color: 0x222222, side: THREE.DoubleSide});
			scene.getObjectByName("car-wheel-1").material      = new THREE.MeshPhongMaterial({ color: 0x222222, side: THREE.DoubleSide});
			scene.getObjectByName("car-wheel-2").material      = new THREE.MeshPhongMaterial({ color: 0x222222, side: THREE.DoubleSide});
			scene.getObjectByName("car-wheel-3").material      = new THREE.MeshPhongMaterial({ color: 0x222222, side: THREE.DoubleSide});
			scene.getObjectByName("car-windows").material      = new THREE.MeshPhongMaterial({ envMap: car_environment_cubemap.renderTarget, color: 0xFFFFFF, specular: 0xFFFFFF, emissive: 0xFFFFFF, transparent: true, opacity: 0.6, side: THREE.DoubleSide});
			scene.getObjectByName("car-wipers").material       = new THREE.MeshPhongMaterial({ color: 0xC4854D, specular: 0xFFFFFF,side: THREE.DoubleSide});
			scenes.scene = scene
			
			//-------------------------------
			// animations
			//-------------------------------
			animation.add({time: 0, value: {
				position : new THREE.Vector3(-15, 5, -15),
				target   : new THREE.Vector3(0, 0, 0),
				up       : new THREE.Vector3(0.25, 1, 0)				
			}})	
			animation.add({time: 4000, value: {
				position : new THREE.Vector3(13, 5, -15),
				target   : new THREE.Vector3(0, 0, 0),
				up       : new THREE.Vector3(-0.0, 1, 0)				
			}})	
			animation.add({time: 8000, value: {
				position : new THREE.Vector3(8, 1.5, -10),
				target   : new THREE.Vector3(-15, 0, 10),
				up       : new THREE.Vector3(0, 1, 0)				
			}})
			animation.add({time: 12000, value: {
				position : new THREE.Vector3(8, 1.5, -3),
				target   : new THREE.Vector3(-16, 0, 17),
				up       : new THREE.Vector3(0, 1, 0)				
			}})	
			animation.add({time: 16000, value: {
				position : new THREE.Vector3(-0, 3.0, -15),
				target   : new THREE.Vector3(0, 1.2, -6),
				up       : new THREE.Vector3(0, 1, 0)				
			}})		

			animation.add({time: 20000, value: {
				position : new THREE.Vector3(-12, 2.0, 5),
				target   : new THREE.Vector3(-8, 1.5, 5),
				up       : new THREE.Vector3(0.0, 1, -0.0)				
			}})	
			animation.add({time: 24000, value: {
				position : new THREE.Vector3(-12, 2.0, -2),
				target   : new THREE.Vector3(-8, 1.5, -2),
				up       : new THREE.Vector3(0.0, 1, 0.05)				
			}})	
			animation.add({time: 28000, value: {
				position : new THREE.Vector3(-15, 5, -15),
				target   : new THREE.Vector3(0, 0, 0),
				up       : new THREE.Vector3(0.25, 1, 0)				
			}})																													
		})
	});
	
	var anglex    = 45.0;
	var angley    = 0.0;
	var motion    = new THREE.Vector3(0, 0, 0)
	var pos       = new THREE.Vector3(-15, 4, -15)
	var firstpass = true;
	
	return {
		update : function(time) {
			if(scenes.scene) {
				if(acid.input.gamepad.enabled) {
					if(acid.input.gamepad.sticks.right.x > 0.3 ||
					   acid.input.gamepad.sticks.right.x < -0.3)
						anglex -= acid.input.gamepad.sticks.right.x * 2
					if(acid.input.gamepad.sticks.right.y > 0.3 ||
					   acid.input.gamepad.sticks.right.y < -0.3) {
							angley -= acid.input.gamepad.sticks.right.y * 0.05
							if(angley > 1)  angley = 1;
							if(angley < -1) angley = -1;   
					   }
					if(acid.input.gamepad.sticks.left.y > 0.3 ||
					   acid.input.gamepad.sticks.left.y < -0.3) {
						  motion.add(new THREE.Vector3(
							  			Math.sin(anglex * 3.14 / 180) * acid.input.gamepad.sticks.left.y * -0.2, 0,
						  				Math.cos(anglex * 3.14 / 180) * acid.input.gamepad.sticks.left.y * -0.2))
					   }		 				
					if(acid.input.gamepad.sticks.left.x > 0.3 ||
					   acid.input.gamepad.sticks.left.x < -0.3) {
						  motion.add(new THREE.Vector3
						  				((Math.cos(anglex * 3.14 / 180) * acid.input.gamepad.sticks.left.x * -0.2), 0,
						  			    -(Math.sin(anglex * 3.14 / 180) * acid.input.gamepad.sticks.left.x * -0.2)))
					   }
					   						
					motion = motion.multiplyScalar(0.4)
					pos.add(motion)	
					var position = pos
					var target   = new THREE.Vector3(position.x + Math.sin(anglex * 3.14 / 180), angley + 4, 
													 position.z + Math.cos(anglex * 3.14 / 180))
					var up       = new THREE.Vector3(0, 1, 0)
					cameras.camera.up = up
					cameras.camera.lookAt(target);			
					cameras.camera.position.set(position.x,  position.y, position.z);					
				} else {
					var transform =  animation.get(time, true)
					cameras.camera.up = transform.up
					cameras.camera.lookAt(transform.target);			
					cameras.camera.position.set(transform.position.x,  
												transform.position.y, 
												transform.position.z);					
				}

			}
		},
		render : function(app) {
			if(scenes.scene) {
				app.renderer.setClearColor(0xCCCCCC)	
				
				if(firstpass) {
					//---------------------------------------
					// render car environment map
					//---------------------------------------
					scenes.scene.getObjectByName("car").visible = false;						
					scenes.scene.getObjectByName("car-environment-cubemap").updateCubeMap( app.renderer, scenes.scene );
					scenes.scene.getObjectByName("car").visible = true;
					firstpass = false						
				}
				
				//--------------------------------------
				// render reflection planes
				//--------------------------------------
				scenes.scene.getObjectByName("room-floor").visible  = false;	
				scenes.scene.getObjectByName("stage-floor").visible = false;
				app.renderer.render(scenes.scene, 
					acid.graphics.cameras.reflect(cameras.camera, 
						new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)), 
						targets.reflect, 
						true)
				scenes.scene.getObjectByName("room-floor").visible  = true;	
				scenes.scene.getObjectByName("stage-floor").visible = true;
								
				app.renderer.render(scenes.scene, cameras.camera, targets.scene, true)				
			}

			return targets;
		}
	}
})