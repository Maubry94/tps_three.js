/* Developed by Raphael BIRON for ESGI ©️ 2021 */

import * as THREE from "../../three/build/three.module.js";

const metalText = new THREE.TextureLoader().load("./assets/textures/metal.jpg");
const Metal = new THREE.MeshStandardMaterial({ map: metalText });

const blackLeatherText = new THREE.TextureLoader().load("./assets/textures/black_leather.jpg");
const BlackLeather = new THREE.MeshStandardMaterial({ map: blackLeatherText });

const pinkLeatherText = new THREE.TextureLoader().load("./assets/textures/pink_leather.jpg");
const PinkLeather = new THREE.MeshStandardMaterial({ map: pinkLeatherText });

const planksText = new THREE.TextureLoader().load("./assets/textures/planks.jpg");
planksText.wrapS = THREE.RepeatWrapping;
planksText.wrapT = THREE.RepeatWrapping;
planksText.repeat.set(4, 2.5);
const Planks = new THREE.MeshStandardMaterial({ map: planksText });

const theShiningFloorText = new THREE.TextureLoader().load("./assets/textures/theshining_floor.jpg");
theShiningFloorText.wrapS = THREE.RepeatWrapping;
theShiningFloorText.wrapT = THREE.RepeatWrapping;
theShiningFloorText.repeat.set(5, 3.5);
const TheShiningFloor = new THREE.MeshStandardMaterial({ map: theShiningFloorText });

const wood1Text = new THREE.TextureLoader().load("./assets/textures/wood1.jpg");
const Wood1 = new THREE.MeshStandardMaterial({ map: wood1Text });

const marbleText = new THREE.TextureLoader().load("./assets/textures/marble.jpg");
const Marble = new THREE.MeshStandardMaterial({ map: marbleText });

const blackMarbleText = new THREE.TextureLoader().load("./assets/textures/black_marble.jpg");
const BlackMarble = new THREE.MeshStandardMaterial({ map: blackMarbleText });

const White = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0, metalness: 0 });

const mirrorText = new THREE.TextureLoader().load("./assets/textures/disco.jpg");
const Mirror = new THREE.MeshPhongMaterial({ map: mirrorText, flatShading: true, reflectivity: 1, shininess: 1 });

const cableText = new THREE.TextureLoader().load("./assets/textures/cable.jpg");
const Cable = new THREE.MeshPhongMaterial({ map: cableText });

const Floors = {
	Planks: Planks,
	"The Shining Floor": TheShiningFloor,
	Marble: Marble,
	"Black Marble": BlackMarble,
};

const Metals = {
	Metal: Metal,
};

const Woods = {
	"Dark Straight": Wood1,
};

const Colours = {
	White: White,
};

const Leathers = {
	"Black Leather": BlackLeather,
	"Pink Leather": PinkLeather,
};

const Others = {
	Mirror: Mirror,
	Cable: Cable,
};

export { Floors, Metals, Woods, Colours, Leathers, Others };
