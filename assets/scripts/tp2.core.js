/* Developed by Raphael BIRON for ESGI ©️ 2021 */

/*
* Load modules and libs
*/
import * as THREE from '../../three/build/three.module.js';
import { OrbitControls } from '../../three/examples/jsm/controls/OrbitControls.js';
import { GUI } from '../../three/examples/jsm/libs/dat.gui.module.js';
import Stats from '../../three/examples/jsm/libs/stats.module.js';

/*
* Load our materials
*/
import * as MATERIALS from './materials.module.js';

let i;
let camera, scene, renderer, controls, spotLight, ambientLight;
let lightHelper, shadowCameraHelper, seatHelper, footRestHelper, chairBackHelper, chairBackLegHelper, chairBackLeg2Helper, axesHelper;
let gui, stats;

let haveChairBack = true; // Enable/Disable the chairback
let displayAxes = false; // Hide/show axes
let displayHelpers = false; // Hide/show helpers
let legCount = 3; // Count of chair leg

let legDims = {radius: 10, height: 250}; // Dimensions of one leg
let seatDims = {radius: 75, height: 25}; // Dimensions of the seat

let lightPos ={x: 800, y: 800, z: 0}; // Position of the light

/*
* Elements of our scene
*/
let seat, footRest, floor, chairBack, chairBackLeg, chairBackLeg2;

init();
animate();

function init(){
    initMisc();
    initLights();
    initMeshes();
    initScene();
    initHelpers();
}

function animate(){
    requestAnimationFrame(animate);
    stats.update();
    controls.update();
    render();
}

function render(){
    renderer.render(scene, camera);
}

/** 
* Setting up miscellaneous things (Camera, Scene, Renderer, Controls, etc...)
*/
function initMisc(){
    /*
    * Setting up the camera and the scene
    */
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 3000 );
    camera.position.set(0, 450, 500);

    scene = new THREE.Scene();

    /*
    * Renderer section
    */
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    document.body.appendChild(renderer.domElement);

    /*
    * Setting up OrbitControls module
    */
    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window );
    controls.minDistance = camera.position.z/10;
    controls.maxDistance = camera.position.z*2;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minPolarAngle = .75;
    controls.maxPolarAngle = 1.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = -1.5;

    /*
    * Resize event
    */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /*
    * Init Stats
    */
    stats = new Stats();
    document.body.appendChild( stats.dom );

    /*
    * Init GUI
    */
    gui = new GUI();
    buildGUI();
}

/** 
* Setting up lights
*/
function initLights(){
    ambientLight = new THREE.AmbientLight(0xffffff, .25);
    scene.add(ambientLight);

    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(lightPos.x, lightPos.y, lightPos.z);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2056;
    spotLight.shadow.mapSize.height = 2056;
    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 2500;
    spotLight.penumbra = 0.1;
    spotLight.shadow.bias = -0.002;
    spotLight.shadow.radius = 2;
    scene.add(spotLight);
}

/** 
* Setting up meshes geometries, materials, positions, etc...
*/
function initMeshes(){
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
    seat = new THREE.Mesh(seatGeo, MATERIALS.Leathers['Black Leather']);
    seat.castShadow = true;
    seat.receiveShadow = true;

    /*
    * Create the footrest mesh
    */
    const footRestGeo = new THREE.TorusGeometry(seatDims.radius*.7, legDims.radius/2, 16, 100);
    footRest = new THREE.Mesh(footRestGeo, MATERIALS.Leathers['Black Leather']);
    footRest.rotation.set(THREE.Math.degToRad(90), 0, 0);
    footRest.castShadow = true;
    footRest.receiveShadow = true;

    /*
    * Create the chairback meshes
    */
    const chairBackGeo = new THREE.CylinderGeometry(seatDims.radius*.8, seatDims.radius*.8, 16, 32);
    const chairBackLegGeo = new THREE.CylinderGeometry(legDims.radius/2, legDims.radius/2, legDims.height/4, 32);
    chairBack = new THREE.Mesh(chairBackGeo, MATERIALS.Leathers['Black Leather']);
    chairBackLeg = new THREE.Mesh(chairBackLegGeo, MATERIALS.Metals.Metal);
    chairBackLeg2 = new THREE.Mesh(chairBackLegGeo, MATERIALS.Metals.Metal);

    chairBack.castShadow = true;
    chairBackLeg.castShadow = true;
    chairBackLeg2.castShadow = true;
    chairBack.receiveShadow = true;
    chairBackLeg.receiveShadow = true;
    chairBackLeg2.receiveShadow = true;

    chairBack.rotation.set(0, 0, THREE.Math.degToRad(90));
}

/** 
* Adding meshes to the scene and generate Legs
*/
function initScene(){
    scene.add(floor);
    
    scene.add(seat);

    scene.add(footRest);

    scene.add(chairBack);
    scene.add(chairBackLeg);
    scene.add(chairBackLeg2);

    legsRender();
}

/** 
* Setting up helpers
*/
function initHelpers(){
    lightHelper = new THREE.SpotLightHelper(spotLight);
    lightHelper.update();

    shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
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

    if(displayHelpers){
        scene.add(seatHelper, footRestHelper, lightHelper, shadowCameraHelper);
        if(haveChairBack) scene.add(chairBackHelper, chairBackLegHelper, chairBackLeg2Helper);
    }

    axesHelper = new THREE.AxesHelper(750);
    if(displayAxes) scene.add(axesHelper);
}

/** 
* Creation and placement of chair legs
*/
function legsRender(){
    let y = 0;
    while(scene.getObjectByName("leg" + y)){
        try { scene.remove(scene.getObjectByName("leg"+ y), scene.getObjectByName("legHelper"+ y)); }
        catch (error) {}
        y++
    }

    for(i = 0; i < legCount; i++){
        const legGeo = new THREE.CylinderGeometry(legDims.radius, legDims.radius/2, legDims.height, 32);
        let leg = new THREE.Mesh(legGeo, MATERIALS.Metals.Metal);
        leg.name = "leg" + i;

        scene.add(leg);
        leg.castShadow = true;
        leg.receiveShadow = true;

        leg.rotation.set(0, THREE.Math.degToRad((360/legCount)*(i+1)), THREE.Math.degToRad(10));
        leg.translateX(50);

        let helper = new THREE.BoxHelper(leg, 0x0000ff);
        helper.name = "legHelper"+ i;
        helper.update();
        if(displayHelpers) scene.add(helper);
    }

    floor.position.set(0, -legDims.height/2, 0);
    seat.position.set(0, legDims.height/2, 0);
    chairBack.position.set(-seatDims.radius*.75, legDims.height/2+90, 0);
    chairBackLeg.position.set(-seatDims.radius*.75, legDims.height/2+25, 30);
    chairBackLeg2.position.set(-seatDims.radius*.75, legDims.height/2+25, -30);
}

/**
* Setting up GUI
*/
function buildGUI(){
    const settings = {
        'chairback': haveChairBack,
        'debug' : displayHelpers,
        'displayAxes' : displayAxes,
        'rotationSpeed': controls.autoRotateSpeed,
        'floorTexture': Object.keys(MATERIALS.Floors)[0],
        'chairTexture': Object.keys(MATERIALS.Leathers)[0],
        'legCount' : legCount,
        'legRadius' : legDims.radius,
        'legHeight' : legDims.height,
        'lightX' : lightPos.x,
        'lightZ' : lightPos.z,
    };

    const globalGUIFolder = gui.addFolder('Global');
    const chairGUIFolder = gui.addFolder('Chair');
    const lightGUIFolder = gui.addFolder('Light');

    globalGUIFolder.add(settings, 'debug').name('Debug Mode').onChange(() => {
        if(!displayHelpers){
            scene.add(seatHelper, footRestHelper, lightHelper, shadowCameraHelper);
            if(haveChairBack) scene.add(chairBackHelper, chairBackLegHelper, chairBackLeg2Helper);	
        } else {
            scene.remove(seatHelper, footRestHelper, lightHelper, shadowCameraHelper);
            if(haveChairBack) scene.remove(chairBackHelper, chairBackLegHelper, chairBackLeg2Helper);	
        }
        displayHelpers = !displayHelpers;
        legsRender();
    }); 

    globalGUIFolder.add(settings, 'displayAxes').name('Display Axes').onChange(() => {
        if(!displayAxes) scene.add(axesHelper);	
        else scene.remove(axesHelper);
        displayAxes = !displayAxes;
    }); 

    globalGUIFolder.add(settings, 'rotationSpeed', -100, 100).step(.1).name('Rotation Speed').onChange(val => {
        controls.autoRotateSpeed = -val;
    });
    
    globalGUIFolder.add(settings, 'floorTexture', Object.keys(MATERIALS.Floors)).name('Floor Texture').onChange(val => {
        floor.material = MATERIALS.Floors[val];
    });

    chairGUIFolder.add(settings, 'chairTexture', Object.keys(MATERIALS.Leathers)).name('Chair Texture').onChange(val => {
        seat.material = MATERIALS.Leathers[val];
        footRest.material = MATERIALS.Leathers[val];
        chairBack.material = MATERIALS.Leathers[val];
    });

    chairGUIFolder.add(settings, 'chairback').name('Chairback Displayed').onChange(() => {
        if(!haveChairBack){
            scene.add(chairBack, chairBackLeg, chairBackLeg2);
            if(displayHelpers) scene.add(chairBackHelper, chairBackLeg2Helper, chairBackLegHelper);
        } else {
            scene.remove(chairBack, chairBackLeg, chairBackLeg2);
            if(displayHelpers) scene.remove(chairBackHelper, chairBackLeg2Helper, chairBackLegHelper);
        }
        haveChairBack = !haveChairBack;
    });

    chairGUIFolder.add(settings, 'legCount', 3, 30).name('Legs Count').step(1).onChange(val => {
        legCount = val;
        legsRender();
    });

    chairGUIFolder.add(settings, 'legRadius', 5, 20).name('Legs Radius').step(1).onChange(val => {
        legDims.radius = val;
        legsRender();
    });

    chairGUIFolder.add(settings, 'legHeight', 50, 400).name('Legs Height').step(1).onChange(val => {
        legDims.height = val;
        legsRender();
    });

    lightGUIFolder.add(settings, 'lightX', -800, 800).name('X Position').onChange(val => {
        lightPos.x = val;
        spotLight.position.set(lightPos.x, lightPos.y, lightPos.z);
    });

    lightGUIFolder.add(settings, 'lightZ', -800, 800).name('Z Position').onChange(val => {
        lightPos.z = val;
        spotLight.position.set(lightPos.x, lightPos.y, lightPos.z);
    });

    globalGUIFolder.open();
    chairGUIFolder.open();	
    lightGUIFolder.open();				
    gui.open();
}