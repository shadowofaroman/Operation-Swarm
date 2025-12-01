import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { createGravitySwarm } from './simulations/GravitySwarm.js';
import { createAtomicBomb } from './simulations/AtomicBomb.js';

const renderer = new WebGPURenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101010);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 80);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const PARTICLE_COUNT = 400000;
let currentSim = null;

function loadSimulation(simName) {
    if (currentSim && currentSim.mesh) {
        scene.remove(currentSim.mesh);
        currentSim.computeNode = null;
        currentSim.mesh.geometry.dispose();
        currentSim.mesh.material.dispose();
        currentSim.mesh = null;
    }

    if (simName === 'GravitySwarm') {
        currentSim = createGravitySwarm(scene, PARTICLE_COUNT);
        camera.position.set(0, 0, 80);
        scene.background = new THREE.Color(0x101010);
    } else if (simName === 'AtomicBomb') {
        currentSim = createAtomicBomb(scene, PARTICLE_COUNT);
        camera.position.set(0, 0, 80);
        scene.background = new THREE.Color(0x000000);
    }
}
loadSimulation('GravitySwarm');

const uiContainer = document.createElement('div');
uiContainer.style.position = 'absolute';
uiContainer.style.top = '20px';
uiContainer.style.left = '20px';
uiContainer.style.color = 'white';
uiContainer.style.fontFamily = 'monospace';
document.body.appendChild(uiContainer);

function createButton(text, simName) {
  const btn = document.createElement('button');
  btn.innerText = text;
  btn.style.marginRight = '10px';
  btn.style.padding = '10px 20px';
  btn.style.background = '#333';
  btn.style.color = '#fff';
  btn.style.border = '1px solid #555';
  btn.style.cursor = 'pointer';
  btn.onclick = () => loadSimulation(simName);
  return btn;
}

uiContainer.appendChild(createButton('Gravity Swarm', 'GravitySwarm'));
uiContainer.appendChild(createButton('Atomic Bomb', 'AtomicBomb'));

function animate() {
    if (currentSim.computeNode) {
        renderer.compute(currentSim.computeNode);
    }
    renderer.render(scene, camera);
    controls.update();
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});