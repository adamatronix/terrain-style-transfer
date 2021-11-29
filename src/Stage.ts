import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Stage {
  scene: THREE.Scene = null;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor() {
    this.renderFrame = this.renderFrame.bind(this);
    this.setupWorld();
    this.renderFrame();
  }

  setupWorld = () => {
    //setup the scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);

    //setup the camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 5000);
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(new THREE.Vector3(0,0,0));
    

    /**
     * Setup Renderer
     */
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );
    this.renderer.shadowMap.enabled = true;

    /**
     * Setup Controls
     */
    let controls = new OrbitControls( this.camera, this.renderer.domElement);
    controls.minDistance = 0;
    controls.maxDistance = 500;


    /**
     * Lighting
     */
    const skyColor = 0xFFFFFF;  // light blue
    const groundColor = 0xFFFFFF;  // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    light.position.set(0,200,0);
    this.scene.add(light);
  } 

  renderFrame = () => {
    this.renderer.render( this.scene, this.camera );
    requestAnimationFrame(this.renderFrame);
  } 
}

export default Stage;