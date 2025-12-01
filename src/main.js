import * as THREE from 'three';
import { WebGPURenderer, MeshBasicNodeMaterial, StorageInstancedBufferAttribute } from 'three/webgpu';
import { Fn, color, positionLocal, storage, instanceIndex } from 'three/tsl';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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

const positionBuffer = new StorageInstancedBufferAttribute(PARTICLE_COUNT, 3);
const velocityBuffer = new StorageInstancedBufferAttribute(PARTICLE_COUNT, 3);

for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = 40 * Math.cbrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positionBuffer.setXYZ(i, x, y, z);
    velocityBuffer.setXYZ(i, 0, 0, 0);
}

const positionStorage = storage(positionBuffer, 'vec3', PARTICLE_COUNT);
const velocityStorage = storage(velocityBuffer, 'vec3', PARTICLE_COUNT);

const computeParticles = Fn(() => {
    const p = positionStorage.element(instanceIndex);
    const v = velocityStorage.element(instanceIndex);

    const centerAttraction = p.mul(-0.01);
    
    v.addAssign(centerAttraction);
    v.mulAssign(0.97);
    p.addAssign(v);
});

const computeNode = computeParticles().compute(PARTICLE_COUNT);

const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1); 
const material = new MeshBasicNodeMaterial();

const velocityLen = velocityStorage.element(instanceIndex).length();
material.colorNode = velocityLen.remap(0, 1.0, 0.0, 1.0).mix(color(0x0055ff), color(0xff0055));

material.positionNode = positionLocal.add(positionStorage.element(instanceIndex));

const mesh = new THREE.InstancedMesh(geometry, material, PARTICLE_COUNT);
mesh.frustumCulled = false; 
scene.add(mesh);

function animate() {
    renderer.compute(computeNode);
    renderer.render(scene, camera);
    controls.update();
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});