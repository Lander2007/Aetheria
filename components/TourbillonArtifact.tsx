"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TourbillonProps {
  scrollProgressRef?: React.RefObject<number>;
  scrollProgress?: number; // fallback
  isOutOfView?: boolean;
}

function TourbillonModel({ scrollProgressRef, scrollProgress = 0 }: TourbillonProps) {
  const outerRingRef = useRef<THREE.Group>(null);
  const middleRingRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const gimbalGroupRef = useRef<THREE.Group>(null);

  // Initial luxury horological tilt angles
  const initialOuterTilt = new THREE.Euler(0.38, 0.2, 0);
  const initialMiddleTilt = new THREE.Euler(-0.32, 0.45, 0.18);
  const initialInnerTilt = new THREE.Euler(0.25, -0.35, 0.5);

  useFrame((state, delta) => {
    // Read directly from ref for zero React re-render overhead
    const progress = scrollProgressRef?.current ?? scrollProgress;

    // 1. Interactive Mouse Parallax Lerp
    const pointerX = (state.pointer.x * Math.PI) / 5;
    const pointerY = (-state.pointer.y * Math.PI) / 5;

    // As user scrolls past 30%, rings progressively square up for the camera dive
    const alignFactor = Math.max(0, 1 - Math.min(1, progress * 1.8));

    if (gimbalGroupRef.current) {
      gimbalGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        gimbalGroupRef.current.rotation.x,
        pointerY * alignFactor,
        delta * 3.5
      );
      gimbalGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        gimbalGroupRef.current.rotation.y,
        pointerX * alignFactor,
        delta * 3.5
      );
    }

    // 2. Horological Rotations & Dynamic Ring Alignment
    const speed = 1 + progress * 2.8;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.4 * speed;
      outerRingRef.current.rotation.x = THREE.MathUtils.lerp(
        initialOuterTilt.x + Math.sin(state.clock.elapsedTime * 0.4) * 0.12,
        0,
        Math.min(1, progress * 1.5)
      );
      outerRingRef.current.rotation.y = THREE.MathUtils.lerp(
        initialOuterTilt.y,
        0,
        Math.min(1, progress * 1.5)
      );
    }

    if (middleRingRef.current) {
      middleRingRef.current.rotation.y -= delta * 0.6 * speed;
      middleRingRef.current.rotation.z += delta * 0.3 * speed;
      middleRingRef.current.rotation.x = THREE.MathUtils.lerp(
        initialMiddleTilt.x,
        0,
        Math.min(1, progress * 1.5)
      );
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.x += delta * 0.85 * speed;
      innerRingRef.current.rotation.y += delta * 0.45 * speed;
      innerRingRef.current.rotation.z = THREE.MathUtils.lerp(
        initialInnerTilt.z,
        0,
        Math.min(1, progress * 1.5)
      );
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.4;
      coreRef.current.rotation.x -= delta * 0.25;

      // Expand core as user dives into the center aperture
      if (progress > 0.45) {
        const expansion = 1 + Math.pow((progress - 0.45) / 0.55, 2.2) * 8;
        coreRef.current.scale.set(expansion, expansion, expansion);
      } else {
        coreRef.current.scale.set(1, 1, 1);
      }
    }

    // 3. Scroll Camera Dive (from z = 12.0 down to z = 0.85)
    const targetZ = THREE.MathUtils.lerp(12.0, 0.85, Math.min(1, progress * 1.15));
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * 7);
  });

  return (
    <group ref={gimbalGroupRef}>
      {/* ============================================================= */}
      {/* RING 1 (OUTER): Brushed Titanium Silver (#D4D7DA)             */}
      {/* ============================================================= */}
      <group ref={outerRingRef}>
        <mesh>
          <torusGeometry args={[2.35, 0.05, 32, 120]} />
          <meshStandardMaterial
            color="#D4D7DA"
            metalness={0.96}
            roughness={0.16}
          />
        </mesh>

        {/* 12 Horology Hour Studs Along Titanium Bezel */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          const x = 2.35 * Math.cos(angle);
          const y = 2.35 * Math.sin(angle);
          return (
            <mesh key={i} position={[x, y, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.08, 16]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? "#FF4F00" : "#141416"}
                metalness={0.92}
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>

      {/* ============================================================= */}
      {/* RING 2 (MIDDLE): Anodized Matte Carbon (#141416)              */}
      {/* ============================================================= */}
      <group ref={middleRingRef}>
        <mesh>
          <torusGeometry args={[1.82, 0.042, 32, 120]} />
          <meshStandardMaterial
            color="#141416"
            metalness={0.88}
            roughness={0.32}
          />
        </mesh>

        {/* 24 Precision Horological Calibrations */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 24;
          const x = 1.82 * Math.cos(angle);
          const y = 1.82 * Math.sin(angle);
          return (
            <mesh key={i} position={[x, y, 0]}>
              <boxGeometry args={[0.02, 0.085, 0.05]} />
              <meshStandardMaterial
                color={i % 6 === 0 ? "#FF4F00" : "#D4D7DA"}
                metalness={0.9}
                roughness={0.25}
              />
            </mesh>
          );
        })}
      </group>

      {/* ============================================================= */}
      {/* RING 3 (INNER): International Signal Orange (#FF4F00)         */}
      {/* ============================================================= */}
      <group ref={innerRingRef}>
        <mesh>
          <torusGeometry args={[1.34, 0.035, 32, 100]} />
          <meshStandardMaterial
            color="#FF4F00"
            emissive="#FF4F00"
            emissiveIntensity={0.45}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* ============================================================= */}
      {/* INNER CORE RELIC: Dark Glass / Carbon Sphere with Orange Glow */}
      {/* ============================================================= */}
      <group ref={coreRef}>
        {/* Deep Carbon Relic Sphere */}
        <mesh>
          <sphereGeometry args={[0.7, 64, 64]} />
          <meshStandardMaterial
            color="#111113"
            metalness={0.95}
            roughness={0.14}
          />
        </mesh>

        {/* Orbiting Geodesic Meridian Cage */}
        <mesh>
          <sphereGeometry args={[0.75, 20, 20]} />
          <meshBasicMaterial
            color="#FF4F00"
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* Inner Core Point Light */}
        <pointLight
          color="#FF4F00"
          intensity={5.0}
          distance={5.0}
          decay={2}
        />
      </group>
    </group>
  );
}

export function TourbillonArtifact({
  scrollProgressRef,
  scrollProgress = 0,
  isOutOfView = false,
}: TourbillonProps) {
  return (
    <div className="absolute inset-0 h-full w-full pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0, 12.0], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        frameloop={isOutOfView ? "demand" : "always"}
      >
        {/* Studio Lighting Architecture */}
        <ambientLight intensity={0.75} />
        
        {/* Overhead Key White Light */}
        <directionalLight position={[6, 9, 6]} intensity={2.4} color="#FFFFFF" />
        
        {/* Signal Orange Rim Light for High-Angle Specular Bevels */}
        <directionalLight position={[-6, -6, -4]} intensity={3.0} color="#FF4F00" />
        
        {/* Titanium Soft Fill Light */}
        <pointLight position={[0, -4, 4]} intensity={1.2} color="#E2E4E6" />

        {/* 3D Tourbillon Model */}
        <TourbillonModel
          scrollProgressRef={scrollProgressRef}
          scrollProgress={scrollProgress}
        />
      </Canvas>
    </div>
  );
}

export default TourbillonArtifact;
