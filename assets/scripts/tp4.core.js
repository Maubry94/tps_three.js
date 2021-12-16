/* Developed by Raphael BIRON & Matthieu AUBRY for ESGI ©️ 2021 */

/**
 * ----==== PATCH NOTE ====----
 * Adding two models (one yelling and one dancing)
 * Adding two new functions (getRandomInt() & getRandomColor())
 * Adding Disco features
 * Restyling & optimize GUI
 * Creating scene mode switching feature
 * Changing origin of the scene (Seat is now at 0, 0, 0)
 * Notice can now be add at the bottom of the page 'new Notice("content");'
 * A function to load alls models more simply has been added (initModels())
 * All inits display a notice at the start and at the end of their process
 * FBX models can now be simply create by calling our FBXModel class
 */

/**
 * Load modules and libs
 */
import * as THREE from "../../three/build/three.module.js";
import { OrbitControls } from "../../three/examples/jsm/controls/OrbitControls.js";
import { TWEEN } from "../../three/examples/jsm/libs/tween.module.min.js";
import { GUI } from "../../three/examples/jsm/libs/dat.gui.module.js";
import Stats from "../../three/examples/jsm/libs/stats.module.js";
import { FBXLoader } from "../../three/examples/jsm/loaders/FBXLoader.js";
import { FBXModel } from "../classes/FBXModel.js";
import { Notice } from "../classes/Notice.js";
/**
 * Load our materials
 */
import * as MATERIALS from "./materials.module.js";

/**
 * Globals vars
 */
let i;
let camera, scene, renderer, controls, delta, clock;
let gui, stats;
let mixers = [],
	fbxModels = [];
let disco = { lights: [], helpers: [], status: false };
let possibleColors = [0xffbd00, 0xff0000, 0xe000ff, 0x00fbff, 0x57ff50];
let guiModes = [];
let actualMode = "Normal";

/**
 * Configuration
 */
let haveChairBack = true; // Enable/Disable the chairback
let displayAxes = false; // Hide/show axes
let displayHelpers = false; // Hide/show helpers
let legCount = 3; // Count of chair leg

let legDims = { radius: 10, height: 250 }; // Dimensions of one leg
let seatDims = { radius: 75, height: 25 }; // Dimensions of the seat

let lightPos = { x: 500, y: 700, z: 0 }; // Position of the light

let animationStatus = true; // Animation running or not

disco.lightsCount = 3; // Disco lights count

let overlay = document.getElementsByClassName("overlay")[0];
let loader = document.getElementsByClassName("lds-facebook")[0];
let title = document.getElementsByClassName("title")[0];
let playBtn = document.getElementsByClassName("btn")[0];

/**
 * Elements of our scene
 */
let seat, footRest, floor, chairBack, chairBackLeg, chairBackLeg2, cable, discoBall;
let mainSpotLight, ambientLight;
let discoHelper, lightHelper, shadowCameraHelper, seatHelper, footRestHelper, chairBackHelper, chairBackLegHelper, chairBackLeg2Helper, axesHelper;
let listener, audioLoader;
let soundgen;

init();
animate();

playBtn.addEventListener("click", function () {
	overlay.remove();
});

function init() {
	initMisc();
	initLights();
	initMeshes();
	initHelpers();
	initScene();
	initModels(
		new FBXModel(
			"Yelling Knight",
			"./assets/models/yelling_knight.fbx",
			{ x: -7.5, y: -100, z: 0 },
			{ x: 0, y: 90, z: 0 },
			{ x: 2.5, y: 2.5, z: 2.5 },
			0
		),
		new FBXModel(
			"Twerking Zombie",
			"./assets/models/twerking_zombie.fbx",
			{ x: 300, y: -legDims.height + 10, z: 0 },
			{ x: 0, y: 90, z: 0 },
			{ x: 2.5, y: 2.5, z: 2.5 },
			0
		),
		new FBXModel(
			"Speakers",
			"./assets/models/speakers.fbx",
			{ x: -800, y: -legDims.height + 10, z: 650 },
			{ x: 0, y: 90, z: 0 },
			{ x: 2, y: 2, z: 2 }
		)
	);
	setInterval(() => {
		loader.remove();
		title.innerHTML = 'Cliquez sur "Play" pour jouer.';
		playBtn.style.display = "block";
	}, 15000);
}

function animate() {
	requestAnimationFrame(animate);

	delta = clock.getDelta();

	if (animationStatus) for (let i = 0; i < mixers.length; i++) mixers[i].update(delta);

	stats.update();
	controls.update();
	TWEEN.update();

	lightHelper.update();
	shadowCameraHelper.update();
	seatHelper.update();
	chairBackHelper.update();
	chairBackLegHelper.update();
	chairBackLeg2Helper.update();
	footRestHelper.update();

	discoBall.rotation.y += 0.01;
	MATERIALS.Others["Mirror"].emissive.r = disco.analyser.getAverageFrequency() / 256;
	MATERIALS.Others["Mirror"].emissive.g = disco.analyser.getAverageFrequency() / 256;
	MATERIALS.Others["Mirror"].emissive.b = disco.analyser.getAverageFrequency() / 256;

	disco.helpers.forEach(discoHelper => {
		discoHelper.update();
	});

	disco.lights.forEach(light => {
		light.angle = THREE.Math.degToRad(35) + THREE.Math.degToRad(disco.analyser.getAverageFrequency() / 10);
	});

	guiModes.forEach(modeController => {
		const modeControllerName = modeController.property.toLowerCase().replace("mode", "");
		if (modeControllerName == actualMode.toLocaleLowerCase()) {
			modeController.setActive();
		} else {
			modeController.setInactive();
		}
	});

	render();
}

function render() {
	renderer.render(scene, camera);
}

/**
 * Setting up miscellaneous things (Camera, Scene, Renderer, Controls, etc...)
 */
function initMisc() {
	new Notice(`🕑 Miscellaneous initialization...`);

	clock = new THREE.Clock();

	/*
	 * Setting up the camera and the scene
	 */
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
	camera.position.set(0, 200, 750);

	scene = new THREE.Scene();

	/*
	 * Setting up audio module
	 */
	listener = new THREE.AudioListener();
	camera.add(listener);

	disco.applause = new THREE.Audio(listener);

	audioLoader = new THREE.AudioLoader();
	audioLoader.load("./assets/musics/applauses.mp3", function (buffer) {
		disco.applause.setBuffer(buffer);
		disco.applause.setLoop(true);
		disco.applause.setVolume(0.1);
	});

	disco.music = new THREE.PositionalAudio(listener);

	audioLoader = new THREE.AudioLoader();
	audioLoader.load("./assets/musics/Britney_Spears_-_Gimme_More.mp3", function (buffer) {
		disco.music.setBuffer(buffer);
		disco.music.setLoop(true);
		disco.music.setVolume(0.5);
		disco.music.setRefDistance(600);
	});

	disco.analyser = new THREE.AudioAnalyser(disco.music);

	/*
	 * Renderer section
	 */
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.VSMShadowMap;
	document.body.appendChild(renderer.domElement);

	/*
	 * Setting up OrbitControls module
	 */
	controls = new OrbitControls(camera, renderer.domElement);
	controls.listenToKeyEvents(window);
	controls.minDistance = camera.position.z / 10;
	controls.maxDistance = camera.position.z * 2;
	controls.enablePan = true;
	controls.screenSpacePanning = false;
	controls.enableDamping = true;
	controls.dampingFactor = 0.1;
	controls.minPolarAngle = 0.75;
	controls.maxPolarAngle = 1.5;
	//   controls.autoRotate = true;
	//   controls.autoRotateSpeed = -1.5;

	/*
	 * Events
	 */
	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	/*
	 * Init Stats
	 */
	stats = new Stats();
	document.body.appendChild(stats.dom);

	/*
	 * Init GUI
	 */
	gui = new GUI({ width: 325 });

	new Notice(`✅ Miscellaneous successfully initialized`);

	buildGUI();
}

/**
 * Animate one light by switching angle and radius
 */
function tween(light) {
	// new TWEEN.Tween(light)
	// 	.to({ angle: Math.random() * 0.7 + 0.1, penumbra: Math.random() + 1 }, Math.random() * 3000 + 2000)
	// 	.easing(TWEEN.Easing.Quadratic.Out)
	// 	.start();

	new TWEEN.Tween(light.position)
		.to({ x: Math.random() * 1200 - 400, y: Math.random() * 400 + 600, z: Math.random() * 1200 - 600 }, Math.random() * 3000 + 2000)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();
}

/**
 * Setting up lights
 */
function initLights() {
	new Notice(`🕑 Lights initialization...`);

	ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambientLight);

	mainSpotLight = new THREE.SpotLight(0xffffff);
	mainSpotLight.position.set(lightPos.x, lightPos.y, lightPos.z);
	mainSpotLight.castShadow = true;
	mainSpotLight.shadow.mapSize.width = 2056;
	mainSpotLight.shadow.mapSize.height = 2056;
	mainSpotLight.shadow.camera.near = 100;
	mainSpotLight.shadow.camera.far = 2500;
	mainSpotLight.penumbra = 0.1;
	mainSpotLight.shadow.bias = -0.002;
	mainSpotLight.shadow.radius = 2;
	scene.add(mainSpotLight);

	disco.group = new THREE.Group();
	disco.group.position.x = -300;

	for (i = 0; i < disco.lightsCount; i++) {
		let discoLight = new THREE.SpotLight(getRandomColor());
		discoLight.position.set(getRandomInt(-1000, 1000), 800, getRandomInt(-1000, 1000));
		discoLight.castShadow = true;
		discoLight.shadow.mapSize.width = 2056;
		discoLight.shadow.mapSize.height = 2056;
		discoLight.shadow.camera.near = 500;
		discoLight.shadow.camera.far = 2500;
		discoLight.penumbra = 0.1;
		discoLight.shadow.bias = -0.002;
		discoLight.shadow.radius = 2;
		disco.lights.push(discoLight);
		disco.group.add(discoLight);
	}

	setInterval(() => {
		if (actualMode == "Disco" && animationStatus)
			disco.lights.forEach(light => {
				tween(light);
			});
	}, 1000);

	new Notice(`✅ Lights successfully initialized`);
}

/**
 * Setting up meshes geometries, materials, positions, etc...
 */
function initMeshes() {
	new Notice(`🕑 Meshes initialization...`);

	/*
	 * Create the floor mesh
	 */
	const floorGeo = new THREE.CylinderGeometry(1200, 1200, 25, 64);
	floor = new THREE.Mesh(floorGeo, MATERIALS.Floors.Planks);
	floor.receiveShadow = true;

	/*
	 * Create the seat mesh
	 */
	const seatGeo = new THREE.CylinderGeometry(seatDims.radius, seatDims.radius, seatDims.height, 32);
	seat = new THREE.Mesh(seatGeo, MATERIALS.Leathers["Black Leather"]);
	seat.castShadow = true;
	seat.receiveShadow = true;

	/*
	 * Create the footrest mesh
	 */
	const footRestGeo = new THREE.TorusGeometry(seatDims.radius * 0.7, legDims.radius / 2, 16, 100);
	footRest = new THREE.Mesh(footRestGeo, MATERIALS.Leathers["Black Leather"]);
	footRest.rotation.set(THREE.Math.degToRad(90), 0, 0);
	footRest.castShadow = true;
	footRest.receiveShadow = true;

	/**
	 * Create the cable mesh
	 */
	const cableGeo = new THREE.CylinderGeometry(2.5, 2.5, 1000, 32);
	cable = new THREE.Mesh(cableGeo, MATERIALS.Others["Cable"]);
	cable.position.set(0, 1100, 0);
	cable.castShadow = true;
	cable.receiveShadow = true;

	/*
	 * Create the discoball mesh
	 */
	const discoBallGeo = new THREE.SphereGeometry(125, 18, 9);
	discoBall = new THREE.Mesh(discoBallGeo, MATERIALS.Others["Mirror"]);
	discoBall.position.set(0, 600, 0);
	discoBall.castShadow = true;
	discoBall.receiveShadow = true;

	/*
	 * Create the chairback meshes
	 */
	const chairBackGeo = new THREE.CylinderGeometry(seatDims.radius * 0.8, seatDims.radius * 0.8, 16, 32);
	const chairBackLegGeo = new THREE.CylinderGeometry(legDims.radius / 2, legDims.radius / 2, legDims.height / 4, 32);
	chairBack = new THREE.Mesh(chairBackGeo, MATERIALS.Leathers["Black Leather"]);
	chairBackLeg = new THREE.Mesh(chairBackLegGeo, MATERIALS.Metals.Metal);
	chairBackLeg2 = new THREE.Mesh(chairBackLegGeo, MATERIALS.Metals.Metal);

	chairBack.castShadow = true;
	chairBackLeg.castShadow = true;
	chairBackLeg2.castShadow = true;
	chairBack.receiveShadow = true;
	chairBackLeg.receiveShadow = true;
	chairBackLeg2.receiveShadow = true;

	chairBack.rotation.set(0, 0, THREE.Math.degToRad(90));

	const soundgenGeo = new THREE.SphereGeometry(20, 32, 16);
	soundgen = new THREE.Mesh(soundgenGeo);
	soundgen.position.set(-800, 0, 0);
	soundgen.add(disco.music);
	scene.add(soundgen);

	new Notice(`✅ Meshes successfully initialized`);
}

/**
 * Setting up all models
 */
function initModels(...models) {
	new Notice(`🕑 Models initialization...`);

	models.forEach((model, idx) => {
		new Notice(`📥 Receiving model n°${idx}`);

		if (!model.partOf) model.partOf = scene;

		new Notice(`🕑 Loading model: '${model.name}'`);

		let loader = new FBXLoader();

		loader.load(model.pathTo, obj => {
			let mixer = new THREE.AnimationMixer(obj);

			if (model.baseAnimationIndex != undefined) {
				const action = mixer.clipAction(obj.animations[model.baseAnimationIndex]);
				action.play();
			}

			obj.traverse(child => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});

			model.partOf.add(obj);
			obj.position.set(model.position.x, model.position.y, model.position.z);
			obj.rotation.set(THREE.Math.degToRad(model.rotation.x), THREE.Math.degToRad(model.rotation.y), THREE.Math.degToRad(model.rotation.z));
			obj.scale.set(model.scale.x, model.scale.y, model.scale.z);

			mixers.push(mixer);
			fbxModels[model.name] = obj;

			new Notice(`✅ Successfully load model: '${model.name}'`);
		});
	});
}

/**
 * Adding meshes to the scene and generate Legs
 */
function initScene() {
	new Notice(`🕑 Scene initialization...`);

	scene.add(floor);

	scene.add(seat);

	scene.add(footRest);

	scene.add(cable);
	scene.add(discoBall);

	scene.add(chairBack);
	scene.add(chairBackLeg);
	scene.add(chairBackLeg2);

	legsRender();

	new Notice(`✅ Scene successfully initialized`);
}

/**
 * Setting up helpers
 */
function initHelpers() {
	new Notice(`🕑 Helpers initialization...`);

	lightHelper = new THREE.SpotLightHelper(mainSpotLight);
	lightHelper.update();

	disco.lights.forEach(light => {
		let discoLightHelper = new THREE.SpotLightHelper(light);
		discoLightHelper.update();
		disco.helpers.push(discoLightHelper);
	});

	shadowCameraHelper = new THREE.CameraHelper(mainSpotLight.shadow.camera);
	shadowCameraHelper.update();

	seatHelper = new THREE.BoxHelper(seat, 0xff0000);
	seatHelper.update();

	chairBackHelper = new THREE.BoxHelper(chairBack, 0xff0000);
	chairBackHelper.update();

	chairBackLegHelper = new THREE.BoxHelper(chairBackLeg, 0x00ff00);
	chairBackLegHelper.update();

	chairBackLeg2Helper = new THREE.BoxHelper(chairBackLeg2, 0x00ff00);
	chairBackLeg2Helper.update();

	footRestHelper = new THREE.BoxHelper(footRest, 0xffff00);
	footRestHelper.update();

	if (displayHelpers) {
		scene.add(seatHelper, footRestHelper, lightHelper, shadowCameraHelper);
		if (haveChairBack) scene.add(chairBackHelper, chairBackLegHelper, chairBackLeg2Helper);
	}

	axesHelper = new THREE.AxesHelper(750);
	if (displayAxes) scene.add(axesHelper);

	new Notice(`✅ Helpers successfully initialized`);
}

/**
 * Setting up GUI
 */
function buildGUI() {
	new Notice(`📂 Building GUI...`);

	const settings = {
		normalMode: () => {
			switchingMode("normal");
		},
		discoMode: () => {
			switchingMode("disco");
		},
		debug: displayHelpers,
		pauseAnim: !animationStatus,
		chairback: haveChairBack,
		displayAxes: displayAxes,
		// rotationSpeed: controls.autoRotateSpeed,
		floorTexture: Object.keys(MATERIALS.Floors)[0],
		chairTexture: Object.keys(MATERIALS.Leathers)[0],
		legCount: legCount,
		legRadius: legDims.radius,
		legHeight: legDims.height,
		lightX: lightPos.x,
		lightZ: lightPos.z,
	};

	let guiFolders = [];

	const modesGUIFolder = gui.addFolder("Running Modes");
	const globalGUIFolder = gui.addFolder("Global");
	const chairGUIFolder = gui.addFolder("Chair");
	const lightGUIFolder = gui.addFolder("Light");

	guiFolders.push({ color: "#FFCF76", folder: modesGUIFolder });
	guiFolders.push({ color: "#FF7676", folder: globalGUIFolder });
	guiFolders.push({ color: "#76C7FF", folder: chairGUIFolder });
	guiFolders.push({ color: "#DADADA", folder: lightGUIFolder });

	guiModes.push(modesGUIFolder.add(settings, "normalMode").name("🙂 Normal"));
	guiModes.push(modesGUIFolder.add(settings, "discoMode").name("🥳 Disco"));

	guiModes.forEach(mode => {
		mode.classList1 = mode.domElement.parentElement.parentElement.classList;
		mode.classList2 = mode.domElement.previousElementSibling.classList;

		mode.setInactive = () => {
			mode.classList2.add("control-inactive");
		};
		mode.setActive = () => {
			mode.classList2.remove("control-inactive");
		};
	});

	modesGUIFolder
		.add(settings, "debug")
		.name("🛠️ Debug")
		.onChange(() => {
			if (!displayHelpers) {
				scene.add(seatHelper, footRestHelper, lightHelper, shadowCameraHelper);
				disco.helpers.forEach(discoHelper => {
					scene.add(discoHelper);
				});
				if (haveChairBack) scene.add(chairBackHelper, chairBackLegHelper, chairBackLeg2Helper);
			} else {
				scene.remove(seatHelper, footRestHelper, lightHelper, shadowCameraHelper);
				disco.helpers.forEach(discoHelper => {
					scene.remove(discoHelper);
				});
				if (haveChairBack) scene.remove(chairBackHelper, chairBackLegHelper, chairBackLeg2Helper);
			}
			displayHelpers = !displayHelpers;
			legsRender();
		});

	globalGUIFolder
		.add(settings, "pauseAnim")
		.name("⏯️ Pause Animation")
		.onChange(() => {
			animationStatus = !animationStatus;
		});

	globalGUIFolder
		.add(settings, "displayAxes")
		.name("Display Axes")
		.onChange(() => {
			if (!displayAxes) scene.add(axesHelper);
			else scene.remove(axesHelper);
			displayAxes = !displayAxes;
		});

	//   globalGUIFolder
	//     .add(settings, "rotationSpeed", -100, 100)
	//     .step(0.1)
	//     .name("Rotation Speed")
	//     .onChange(val => {
	//       controls.autoRotateSpeed = -val;
	//     });

	globalGUIFolder
		.add(settings, "floorTexture", Object.keys(MATERIALS.Floors))
		.name("Floor Texture")
		.onChange(val => {
			floor.material = MATERIALS.Floors[val];
		});

	chairGUIFolder
		.add(settings, "chairTexture", Object.keys(MATERIALS.Leathers))
		.name("Chair Texture")
		.onChange(val => {
			seat.material = MATERIALS.Leathers[val];
			footRest.material = MATERIALS.Leathers[val];
			chairBack.material = MATERIALS.Leathers[val];
		});

	chairGUIFolder
		.add(settings, "chairback")
		.name("Chairback Displayed")
		.onChange(() => {
			if (!haveChairBack) {
				scene.add(chairBack, chairBackLeg, chairBackLeg2);
				if (displayHelpers) scene.add(chairBackHelper, chairBackLeg2Helper, chairBackLegHelper);
			} else {
				scene.remove(chairBack, chairBackLeg, chairBackLeg2);
				if (displayHelpers) scene.remove(chairBackHelper, chairBackLeg2Helper, chairBackLegHelper);
			}
			haveChairBack = !haveChairBack;
		});

	chairGUIFolder
		.add(settings, "legCount", 3, 30)
		.name("Legs Count")
		.step(1)
		.onChange(val => {
			legCount = val;
			legsRender();
		});

	chairGUIFolder
		.add(settings, "legRadius", 5, 20)
		.name("Legs Radius")
		.step(1)
		.onChange(val => {
			legDims.radius = val;
			legsRender();
		});

	chairGUIFolder
		.add(settings, "legHeight", 115, 400)
		.name("Legs Height")
		.step(1)
		.onChange(val => {
			legDims.height = val;
			legsRender();
		});

	lightGUIFolder
		.add(settings, "lightX", -500, 500)
		.name("X Position")
		.onChange(val => {
			lightPos.x = val;
			mainSpotLight.position.set(lightPos.x, lightPos.y, lightPos.z);
		});

	lightGUIFolder
		.add(settings, "lightZ", -500, 500)
		.name("Z Position")
		.onChange(val => {
			lightPos.z = val;
			mainSpotLight.position.set(lightPos.x, lightPos.y, lightPos.z);
		});

	guiFolders.forEach(gFolder => {
		gFolder.folder.domElement.firstChild.childNodes.forEach(el => {
			el.style.borderLeft = `3px solid ${gFolder.color}`;
			if (el.classList.contains("has-slider")) {
				el.firstChild.childNodes[1].firstChild.firstChild.style.color = gFolder.color;
				el.firstChild.childNodes[1].childNodes[1].firstChild.style.background = gFolder.color;
			}
		});
	});
	modesGUIFolder.open();
	gui.open();

	new Notice(`✅ Successfully building GUI`);
}

/**
 * Creation and placement of chair legs
 */
function legsRender() {
	let i = 0;
	while (scene.getObjectByName("leg" + i)) {
		try {
			scene.remove(scene.getObjectByName("leg" + i), scene.getObjectByName("legHelper" + i));
		} catch (error) {}
		i++;
	}

	for (i = 0; i < legCount; i++) {
		const legGeo = new THREE.CylinderGeometry(legDims.radius, legDims.radius / 2, legDims.height, 32);
		let leg = new THREE.Mesh(legGeo, MATERIALS.Metals.Metal);
		leg.name = "leg" + i;

		scene.add(leg);
		leg.castShadow = true;
		leg.receiveShadow = true;

		leg.position.set(0, -legDims.height / 2, 0);
		leg.rotation.set(0, THREE.Math.degToRad((360 / legCount) * (i + 1)), THREE.Math.degToRad(10));
		leg.translateX(50);

		let helper = new THREE.BoxHelper(leg, 0x0000ff);
		helper.name = "legHelper" + i;
		helper.update();
		if (displayHelpers) scene.add(helper);
	}

	floor.position.set(0, -legDims.height, 0);
	footRest.position.set(0, -legDims.height / 2, 0);
	chairBack.position.set(-seatDims.radius * 0.75, 90, 0);
	chairBackLeg.position.set(-seatDims.radius * 0.75, 25, 30);
	chairBackLeg2.position.set(-seatDims.radius * 0.75, 25, -30);

	let twerking_zombie = fbxModels["Twerking Zombie"];
	if (twerking_zombie) twerking_zombie.position.set(300, -legDims.height + 10, 0);
}

/**
 * Switching between modes (Default: Normal)
 * @param {String} mode Desired mode
 */
function switchingMode(mode) {
	if (actualMode.toLowerCase() == mode) return;

	switch (mode) {
		case "disco":
			disco.music.play();
			disco.applause.play();
			new Notice(`▶️ Playing music: 'Gimme More, Britney Spears'`);
			scene.add(disco.group);
			scene.remove(mainSpotLight);
			new Notice(`🥳 It's time for a Disco Party !`);
			actualMode = "Disco";
			break;

		case "normal":
		default:
			disco.music.pause();
			disco.applause.pause();
			new Notice(`⏸️ Pausing all musics !`);
			scene.remove(disco.group);
			scene.add(mainSpotLight);
			new Notice(`😐 Disabling ${actualMode} Mode`);
			actualMode = "Normal";
			break;
	}
}

/**
 * Generate a random int in a range
 * @param {Number} min Minimum int (inclusive)
 * @param {Number} max Maximum int (inclusive)
 * @returns {Number} int
 */
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random color in possibleColors array
 * @returns {Number} selectedColor
 */
function getRandomColor() {
	let randomInt = getRandomInt(0, possibleColors.length - 1);
	let selectedColor = possibleColors[randomInt];
	possibleColors.splice(randomInt, 1);
	return selectedColor;
}
