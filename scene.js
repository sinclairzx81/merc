mxdi.define([], function() {
	var scene    = new THREE.Scene();
	var camera   = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
	var terminal = new mxdi.graphics.Console({width: 1024, 
											 height: 1024, 
											 fontsize: 68,
											 backgroundColor: "#FFFFFF",
											 color : "#000000"});
											
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, map: terminal.texture()  } );
	var mesh     = new THREE.Mesh( geometry, material );
	
	var lights = [];
	lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
	lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
	lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );
	lights[0].position.set( 0, 200, 0 );
	lights[1].position.set( 100, 200, 100 );
	lights[2].position.set( -100, -200, -100 );
	
	scene.add( lights[0] );
	scene.add( lights[1] );
	scene.add( lights[2] );
	
	scene.add( mesh );
	
	camera.position.z = 2;
	var count = 0;
	var buffer = "1110101 10 01110  100"
	mxdi.loop.update(function() {
		var temp = buffer.split('')
		temp.unshift(temp.pop())
		buffer = temp.join('')
		terminal.log(count + ": " + buffer)
		mesh.rotation.x += 0.002;
		mesh.rotation.y += 0.002;
		mesh.rotation.z += 0.002;
		count++;
	})
	
	return {
		scene: scene,
		camera: camera 
	}
})