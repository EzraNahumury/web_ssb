"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Color,
  Scene,
  Fog,
  PerspectiveCamera,
  Vector3,
  AmbientLight,
  DirectionalLight,
  PointLight,
  WebGLRenderer,
} from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GlobeConfig {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: { lat: number; lng: number };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export interface ArcData {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const defaultGlobeConfig: Required<GlobeConfig> = {
  pointSize: 1,
  globeColor: "#1d072e",
  showAtmosphere: true,
  atmosphereColor: "#ffffff",
  atmosphereAltitude: 0.1,
  emissive: "#000000",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.7)",
  ambientLight: "#ffffff",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 2000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 22.3193, lng: 114.1694 },
  autoRotate: true,
  autoRotateSpeed: 0.5,
};

// ---------------------------------------------------------------------------
// Hex color helpers
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
}

function genRandomNumbers(min: number, max: number, count: number): number[] {
  const arr: number[] = [];
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
}

// ---------------------------------------------------------------------------
// World component
// ---------------------------------------------------------------------------

export function World({
  globeConfig,
  data,
}: {
  globeConfig: GlobeConfig;
  data: ArcData[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const rendererRef = useRef<WebGLRenderer | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const globeRef = useRef<ThreeGlobe | null>(null);
  const frameIdRef = useRef<number>(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  });

  // Merge config with defaults
  const cfg = { ...defaultGlobeConfig, ...globeConfig } as Required<GlobeConfig>;

  // ---------------------------
  // Build the ThreeGlobe instance
  // ---------------------------
  const buildGlobe = useCallback(async () => {
    const globe = new ThreeGlobe({
      waitForGlobeReady: true,
      animateIn: true,
    })
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(cfg.showAtmosphere)
      .atmosphereColor(cfg.atmosphereColor)
      .atmosphereAltitude(cfg.atmosphereAltitude)
      .hexPolygonColor(() => cfg.polygonColor);

    // Fetch country polygons
    try {
      const res = await fetch("https://unpkg.com/world-atlas@2/countries-110m.json");
      const topology = (await res.json()) as Topology;
      const countries = feature(topology, topology.objects.countries as any);
      globe.hexPolygonsData((countries as any).features);
    } catch {
      // silently fail — globe renders without country outlines
    }

    // Override globe material
    const globeMaterial = globe.globeMaterial() as unknown as {
      color: Color;
      emissive: Color;
      emissiveIntensity: number;
      shininess: number;
    };
    globeMaterial.color = new Color(cfg.globeColor);
    globeMaterial.emissive = new Color(cfg.emissive);
    globeMaterial.emissiveIntensity = cfg.emissiveIntensity;
    globeMaterial.shininess = cfg.shininess;

    return globe;
  }, [
    cfg.showAtmosphere,
    cfg.atmosphereColor,
    cfg.atmosphereAltitude,
    cfg.polygonColor,
    cfg.globeColor,
    cfg.emissive,
    cfg.emissiveIntensity,
    cfg.shininess,
  ]);

  // ---------------------------
  // Seed arcs in staggered waves
  // ---------------------------
  const seedArcs = useCallback(
    (globe: ThreeGlobe, arcData: ArcData[]) => {
      // Clear any previous timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      let curNumberOfRings = 0;

      const playArcsBatch = (batch: ArcData[]) => {
        globe
          .arcsData(batch)
          .arcStartLat((d: any) => d.startLat)
          .arcStartLng((d: any) => d.startLng)
          .arcEndLat((d: any) => d.endLat)
          .arcEndLng((d: any) => d.endLng)
          .arcColor((d: any) => d.color)
          .arcAltitude((d: any) => d.arcAlt)
          .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
          .arcDashLength(cfg.arcLength)
          .arcDashInitialGap((d: any) => d.order)
          .arcDashGap(15)
          .arcDashAnimateTime(() => cfg.arcTime);

        // Rings at arc endpoints
        globe
          .ringsData(batch)
          .ringColor(() => (t: number) => {
            const rgb = hexToRgb(cfg.atmosphereColor);
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`;
          })
          .ringMaxRadius(cfg.maxRings)
          .ringPropagationSpeed(cfg.rings)
          .ringRepeatPeriod((cfg.arcTime * cfg.arcLength) / cfg.rings)
          .ringLat((d: any) => d.endLat)
          .ringLng((d: any) => d.endLng);
      };

      // Group data by `order` and fire batches sequentially
      const orders = Array.from(new Set(arcData.map((d) => d.order))).sort(
        (a, b) => a - b
      );

      orders.forEach((order, idx) => {
        const t = setTimeout(() => {
          const batch = arcData.filter((d) => d.order === order);
          playArcsBatch(batch);
        }, idx * 1000);
        timeoutsRef.current.push(t);
      });

      // Loop: restart arcs after all batches played
      const loopTimeout = setTimeout(
        () => seedArcs(globe, arcData),
        orders.length * 1000 + cfg.arcTime
      );
      timeoutsRef.current.push(loopTimeout);
    },
    [cfg.arcLength, cfg.arcTime, cfg.atmosphereColor, cfg.maxRings, cfg.rings]
  );

  // ---------------------------
  // Main effect: set up scene, renderer, camera, controls, animate
  // ---------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // ---------- Renderer ----------
    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ---------- Scene ----------
    const scene = new Scene();
    scene.fog = new Fog(0x000000, 400, 2000);
    sceneRef.current = scene;

    // ---------- Camera ----------
    const camera = new PerspectiveCamera(50, width / height, 1, 2000);
    camera.position.set(0, 0, 300);
    cameraRef.current = camera;

    // ---------- Lights ----------
    const ambientLightObj = new AmbientLight(cfg.ambientLight, 0.6);
    scene.add(ambientLightObj);

    const dirLightLeft = new DirectionalLight(cfg.directionalLeftLight, 1);
    dirLightLeft.position.set(-400, 100, 400);
    scene.add(dirLightLeft);

    const dirLightTop = new DirectionalLight(cfg.directionalTopLight, 1);
    dirLightTop.position.set(-200, 500, 200);
    scene.add(dirLightTop);

    const ptLight = new PointLight(cfg.pointLight, 0.8);
    ptLight.position.set(-200, 500, 200);
    scene.add(ptLight);

    // ---------- Controls ----------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 200;
    controls.maxDistance = 500;
    controls.autoRotate = cfg.autoRotate;
    controls.autoRotateSpeed = cfg.autoRotateSpeed;
    controls.minPolarAngle = Math.PI / 3.5;
    controls.maxPolarAngle = Math.PI - Math.PI / 3;
    controlsRef.current = controls;

    // ---------- Animation loop (starts immediately) ----------
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ---------- Globe (async — loads country data) ----------
    buildGlobe().then((globe) => {
      globe.rotateY(
        -Math.PI * (cfg.initialPosition.lng / 180) +
          Math.PI / 2.2
      );
      globe.rotateZ(
        -Math.PI * (cfg.initialPosition.lat / 180)
      );
      scene.add(globe);
      globeRef.current = globe;

      if (data.length > 0) {
        seedArcs(globe, data);
      }
    });

    // ---------- Resize handler ----------
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      setWindowSize({ width: w, height: h });
    };
    window.addEventListener("resize", handleResize);

    // ---------- Cleanup ----------
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameIdRef.current);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      controls.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      globeRef.current = null;
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    />
  );
}

export default World;
