import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry';
import SimplexNoise from 'simplex-noise';
import { octave, map } from './Utilities';

class Stage {
  scene: THREE.Scene = null;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture

  constructor() {
    this.renderFrame = this.renderFrame.bind(this);
    let textureData = this.generateTexture();
    this.setupWorld();
    this.setupTerrain(textureData);
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
    const groundColor = 0xcccccc;  // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    light.position.set(0,500,0);
    this.scene.add(light);

    const pLight = new THREE.PointLight( 0xffffff, 0.8, 600 );
    pLight .castShadow = true;
    pLight .shadow.camera.near = 0.1;
    pLight .shadow.camera.far = 300;
    pLight .shadow.mapSize.width = 1024;
    pLight .shadow.mapSize.height = 1024;
        // move the light back and up a bit
    pLight .position.set( -30, 690, -30 );

    // remember to add the light to the scene
    this.scene.add( pLight );
  } 

  setupTerrain = (data:any) => {
    
    const vertices = [];
    const geometry = new THREE.PlaneBufferGeometry(256,256,256,256);
    for ( let r = 0; r < data.height; r+=1 ) {
      for ( let c = 0; c < data.width; c+=1) {
        const n =  (r*(data.height)  +c)
        const x = r * 4;
        const col = data.data[n*4] // the red channel
        
        let y = map(col,0,255,0,500)
        const z = c * 4;
        vertices.push(x,y,z);
      }

    }

    const positions = (geometry as THREE.BufferGeometry).attributes.position.array as Array<number>;
    for (let i = 0; i < positions.length; i += 3) {
      const v = {
        x: vertices[i], 
        y: vertices[i + 1], 
        z: vertices[i + 2]
      }
      positions[i] = v.x
      positions[i + 1] = v.y
      positions[i + 2] = v.z
    }
    (geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true

  
    //geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add(mesh);

  }
  /*
  generateMap = () => {
    this.canvas = <HTMLCanvasElement> document.getElementById('myCanvas');
    this.canvas.width = 400;
    this.canvas.height = 400;
    let t = 0;
    let canvas = this.canvas;
    let context = this.canvas.getContext('2d')
    const simplex = new SimplexNoise('4');
    const imagedata = context.getImageData(0,0,this.canvas.width,this.canvas.height);
    const data = imagedata.data;
    const texture = new THREE.CanvasTexture(context.canvas);

    for(let x=0; x<canvas.width; x++) {
      for(let y=0; y<canvas.height; y++) {
          var r = simplex.noise3D(x / 300, y / 300, t) * 0.4 + 0.4;

          data[(x + y * canvas.width) * 4 + 0] = r * 255;
          data[(x + y * canvas.width) * 4 + 1] = r * 255;
          data[(x + y * canvas.width) * 4 + 2] = r * 255;
          data[(x + y * canvas.width) * 4 + 3] = 255;
      }
  }

  context.putImageData(imagedata, 0, 0);
  }*/

  generateTexture = () => {
    this.canvas = <HTMLCanvasElement> document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 256;
    let context = this.canvas.getContext('2d')

    const canvas = this.canvas;
    const c = context;

    c.fillStyle = 'black'
    c.fillRect(0,0,canvas.width, canvas.height)
    for(let i=0; i<canvas.width; i++) {
        for(let j=0; j<canvas.height; j++) {
            let v =  octave(i/canvas.width,j/canvas.height,2)
            const per = (100*v).toFixed(2)+'%'
            c.fillStyle = `rgb(${per},${per},${per})`
            c.fillRect(i,j,1,1)
        }
    }
    

    this.texture = new THREE.CanvasTexture(context.canvas);

    return c.getImageData(0,0,canvas.width,canvas.height);

  }

  renderFrame = () => {
    this.renderer.render( this.scene, this.camera );
    requestAnimationFrame(this.renderFrame);
  } 
}

export default Stage;