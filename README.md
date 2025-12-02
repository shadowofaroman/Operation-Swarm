#OPERATION SWARM: WebGPU Particle System

**Status:** ACTIVE
**Tech Stack:** Three.js (WebGPU), TSL (Three Shading Language), Vite.

## Mission Objective
To demonstrate mastery over GPGPU (General-Purpose computing on Graphics Processing Units) by rendering 400,000+ interactive particles at 60FPS. This project bypasses the CPU bottleneck by offloading physics calculations entirely to the GPU via Compute Shaders.

## The Intelligence (How it Works)

### 1. The Architecture
Unlike standard WebGL where the CPU updates every particle position, Operation Swarm uses **Compute Shaders**. The CPU sends the initial data once, and the GPU maintains the simulation loop internally.

### 2. The Data (Storage Buffers)
We utilize `StorageInstancedBufferAttribute`.
- **Standard Attributes:** Read-Only for the GPU.
- **Storage Attributes:** Read/Write. This allows the Compute Shader to update particle `Position` and `Velocity` and save the state for the next frame.

### 3. The Logic (TSL)
We use **TSL (Three Shading Language)** to write shader logic in JavaScript/TypeScript nodes, avoiding raw WGSL strings.
- **Velocity:** `New Velocity = Old Velocity + Forces (Gravity/Noise)`
- **Position:** `New Position = Old Position + Velocity`

## 4. The Simulations

### 4.1. Gravity Swarm
A physics attraction model where particles are pulled towards a singularity but maintain momentum, creating an orbiting swarm effect.
- **Physics:** Central Attraction, Velocity Decay.
- **Visuals:** Velocity-based color mapping (Blue -> Red).

### 4.2. Atomic Bomb (Project Manhattan)
- **Physics:** High-Impulse Radial Velocity, Air Resistance (Drag), Gravity fall-off.
- **Visuals:** Thermal Gradient (White Hot -> Orange Fire -> Black Ash).

## Deployment

1. **Install Dependencies:**
   ```bash
   npm install
   npm run dev

Requirements
A browser with WebGPU support (Latest Chrome, Edge, or Firefox Nightly).
Roadmap
