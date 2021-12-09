export class FBXModel {
  /**
   * New simplified FBX model for our loader function
   * @param {String} name UNIQUE Model name
   * @param {String} pathTo Path to your .fbx file
   * @param {*} position Position of your model {x: 0, y: 0, z: 0}
   * @param {*} rotation Rotation of your model {x: 0, y: 0, z: 0}
   * @param {*} scale Scale of your model {x: 0, y: 0, z: 0}
   * @param {Number} baseAnimationIndex Index of the animation played by default by your model
   * @param {*} partOf THREE.Scene or THREE.Group to which your model belongs
   */
  constructor(
    name,
    pathTo,
    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
    scale = { x: 0, y: 0, z: 0 },
    baseAnimationIndex,
    partOf
  ) {
    Object.assign(this, { name, pathTo, position, rotation, scale, baseAnimationIndex, partOf });
  }
}
