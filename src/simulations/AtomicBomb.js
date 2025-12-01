import * as THREE from 'three';
import { Fn, vec3, color, positionLocal, time, storage, instanceIndex, hash } from 'three/tsl';
import { MeshBasicNodeMaterial, StorageInstancedBufferAttribute } from 'three/webgpu';

export function createAtomicBomb(scene, particleCount) {
    const positionBuffer = new StorageInstancedBufferAttribute(particleCount, 3);
    const velocityBuffer = new StorageInstancedBufferAttribute(particleCount, 3);

     for (let i = 0; i < particleCount; i++) {
        const r = 2.0 * Math.cbrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        positionBuffer.setXYZ(i, x, y, z);

        const vx = x * (Math.random() + 0.5) * 5.0;
        const vy = y * (Math.random() + 0.5) * 5.0;
        const vz = z * (Math.random() + 0.5) * 5.0;

        velocityBuffer.setXYZ(i, vx, vy, vz);
     }

    const positionStorage = storage(positionBuffer, 'vec3', particleCount);
    const velocityStorage = storage(velocityBuffer, 'vec3', particleCount);

    const computeExplosion = Fn(() => {
        const p = positionStorage.element(instanceIndex);
        const v = velocityStorage.element(instanceIndex);

        v.mulAssign(0.98);
        v.y.subAssign(0.05);

        if (p.y < -30.0) { v.y = v.y * -0.5; }
        p.addAssign(v.mul(0.01));
    });

    const computeNode = computeExplosion().compute(particleCount);

    const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const material = new MeshBasicNodeMaterial();

    const speed = velocityStorage.element(instanceIndex).length();
    const heat = speed.remap(0.0, 10.0, 0.0, 1.0);

    const coldColor = color(0x101010);
    const midColor = color(0xff3300);
    const hotColor = color(0xffaa00);

    material.colorNode = heat.mix(coldColor, midColor, hotColor);
    material.positionNode = positionLocal.add(positionStorage.element(instanceIndex));

    const mesh = new THREE.InstancedMesh(geometry, material, particleCount);
    mesh.frustumCulled = false;
    scene.add(mesh);

    return { computeNode, mesh };
}