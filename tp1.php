<!-- Developed by Group 1 for ESGI ©️ 2021 -->

<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]>      <html class="no-js"> <!--<![endif]-->
<html>

<head>
	<title>TP1 Three.js</title>
	<?php include('includes/headContent.php') ?>
</head>

<body>
	<!--[if lt IE 7]>
            <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="#">upgrade your browser</a> to improve your experience.</p>
        <![endif]-->

	<script type="module">
		// Importations
		import * as THREE from './three/build/three.module.js';
		import {
			OrbitControls
		} from './three/examples/jsm/controls/OrbitControls.js';

		let i;
		let camera, scene, renderer, controls;

		let haveChairBack = true; // Enable/Disable the chairback
		let displayAxes = false; // Hide/show axes
		let displayHelpers = false; // Hide/show helpers
		let legCount = 3; // Count of chair leg

		let legDims = {
			radius: 10,
			height: 250
		}; // Dimensions of one leg
		let seatDims = {
			radius: 75,
			height: 20
		}; // Dimensions of the seat

		//Elements
		let seat, footRest, floor, chairBack, chairBackLeg, chairBackLeg2;

		init();
		animate();

		function init() {
			/* 
			 * Setting up the camera and the stage
			 */
			camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
			camera.position.z = 600;

			scene = new THREE.Scene();

			scene.rotation.x = THREE.Math.degToRad(30);

			/* 
			 * Load and create the materials composing the chair and floor
			 */
			const seatText = new THREE.TextureLoader().load('./assets/textures/seat.jpg');
			const seatMat = new THREE.MeshBasicMaterial({
				map: seatText
			});
			const metalText = new THREE.TextureLoader().load('./assets/textures/metal.jpg');
			const metalMat = new THREE.MeshBasicMaterial({
				map: metalText
			});
			const floorText = new THREE.TextureLoader().load('./assets/textures/floor.jpg');
			const floorMat = new THREE.MeshBasicMaterial({
				map: floorText
			});

			/* 
			 * Create the floor mesh
			 */
			const floorGeo = new THREE.CylinderGeometry(500, 500, 25, 64);
			floor = new THREE.Mesh(floorGeo, floorMat);
			scene.add(floor);
			floor.position.set(0, -legDims.height / 2, 0);

			/* 
			 * Create the seat mesh
			 */
			const seatGeo = new THREE.CylinderGeometry(seatDims.radius, seatDims.radius, seatDims.height, 32);
			seat = new THREE.Mesh(seatGeo, seatMat);
			scene.add(seat);
			seat.position.set(0, legDims.height / 2, 0);

			/* 
			 * Create the footrest mesh
			 */
			const footRestGeo = new THREE.TorusGeometry(seatDims.radius * .7, legDims.radius / 2, 16, 100);
			footRest = new THREE.Mesh(footRestGeo, seatMat);
			scene.add(footRest);
			footRest.rotation.set(THREE.Math.degToRad(90), 0, 0);

			/* 
			 * Create the chairback mesh
			 */
			const chairBackGeo = new THREE.CylinderGeometry(seatDims.radius * .8, seatDims.radius * .8, 16, 32);
			const chairBackLegGeo = new THREE.CylinderGeometry(legDims.radius / 2, legDims.radius / 2, legDims.height / 4, 32);
			chairBack = new THREE.Mesh(chairBackGeo, seatMat);
			chairBackLeg = new THREE.Mesh(chairBackLegGeo, metalMat);
			chairBackLeg2 = new THREE.Mesh(chairBackLegGeo, metalMat);

			chairBack.rotation.set(0, 0, THREE.Math.degToRad(90));
			chairBack.position.set(-seatDims.radius * .75, legDims.height / 2 + legDims.height * .35, 0);
			chairBackLeg.position.set(-seatDims.radius * .75, legDims.height / 2 + 25, 30);
			chairBackLeg2.position.set(-seatDims.radius * .75, legDims.height / 2 + 25, -30);

			if (haveChairBack) {
				scene.add(chairBack);
				scene.add(chairBackLeg);
				scene.add(chairBackLeg2);
			}

			let seatHelper = new THREE.BoundingBoxHelper(seat, 0xff0000);
			seatHelper.update();
			let chairBackHelper = new THREE.BoundingBoxHelper(chairBack, 0xff0000);
			chairBackHelper.update();
			let chairBackLegHelper = new THREE.BoundingBoxHelper(chairBackLeg, 0x00ff00);
			chairBackLegHelper.update();
			let chairBackLeg2Helper = new THREE.BoundingBoxHelper(chairBackLeg2, 0x00ff00);
			chairBackLeg2Helper.update();
			let footRestHelper = new THREE.BoundingBoxHelper(footRest, 0xffff00);
			footRestHelper.update();

			if (displayHelpers) {
				scene.add(seatHelper);
				scene.add(footRestHelper);
				if (haveChairBack) {
					scene.add(chairBackHelper);
					scene.add(chairBackLegHelper);
					scene.add(chairBackLeg2Helper);
				}
			}

			const axesHelper = new THREE.AxesHelper(750);
			if (displayAxes) scene.add(axesHelper);

			/* 
			 * Creation and placement of chair legs
			 */
			for (i = 0; i < legCount; i++) {
				const legGeo = new THREE.CylinderGeometry(legDims.radius, legDims.radius / 2, legDims.height, 32);
				let leg = new THREE.Mesh(legGeo, metalMat);

				scene.add(leg);

				leg.rotation.set(0, THREE.Math.degToRad((360 / legCount) * (i + 1)), THREE.Math.degToRad(10));
				leg.translateX(50);

				var helper = new THREE.BoundingBoxHelper(leg, 0x0000ff);
				helper.update();
				if (displayHelpers) scene.add(helper);
			}

			/* 
			 * Renderer section
			 */
			renderer = new THREE.WebGLRenderer({
				antialias: true
			});
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(renderer.domElement);

			/* 
			 * Control the camera with the mouse
			 */
			controls = new OrbitControls(camera, renderer.domElement);
			controls.minDistance = camera.position.z / 10;
			controls.maxDistance = camera.position.z * 2;
			controls.enablePan = false;

			/* 
			 * Resize event
			 */
			window.addEventListener('resize', onWindowResize);
		}

		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		}

		function animate() {
			requestAnimationFrame(animate);
			scene.rotation.y += 0.001;
			renderer.render(scene, camera);
		}
	</script>
</body>

</html>