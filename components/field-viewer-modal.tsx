"use client";

import { useEffect, useEffectEvent, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const palette = {
  red: "#b40e0e",
  lime: "#d9ff1f",
  green: "#20c61a",
  orange: "#f97316",
  gray: "#94a3b8",
  navy: "#0f3d3f",
  white: "#f8fafc",
  dark: "#0f172a",
  field: "#117a32",
  bg: "#07111f",
  active: "#94a3b8",
};

const roleOrder = [
  "GK", "SW", "LB", "CB", "RB", "LWB", "DM", "CM", "AM", "RWB",
  "LM", "RM", "LW", "RW", "ST", "CF",
] as const;

const roleLabels: Record<string, string> = {
  GK: "Goalkeeper",
  SW: "Sweeper",
  LB: "Left Back",
  CB: "Center Back",
  RB: "Right Back",
  LWB: "Left Wing Back",
  RWB: "Right Wing Back",
  DM: "Defensive Mid",
  CM: "Center Mid",
  AM: "Attacking Mid",
  LM: "Left Mid",
  RM: "Right Mid",
  LW: "Left Wing",
  RW: "Right Wing",
  ST: "Striker",
  CF: "Center Forward",
};

const roleMarkers = [
  { role: "GK", x: 30.75, z: -0.13 },
  { role: "SW", x: 35.35, z: -0.13 },
  { role: "LB", x: 38.44, z: -10.05 },
  { role: "CB", x: 38.44, z: -4.19 },
  { role: "CB", x: 38.44, z: 3.86 },
  { role: "RB", x: 38.44, z: 9.97 },
  { role: "LWB", x: 45.22, z: -10.29 },
  { role: "RWB", x: 45.22, z: 9.76 },
  { role: "DM", x: 47.27, z: -0.09 },
  { role: "LM", x: 51.78, z: -10.2 },
  { role: "CM", x: 51.8, z: -4.26 },
  { role: "CM", x: 51.8, z: 3.84 },
  { role: "RM", x: 51.75, z: 9.78 },
  { role: "AM", x: 58.26, z: -0.09 },
  { role: "LW", x: 60.6, z: -10.09 },
  { role: "RW", x: 60.6, z: 9.78 },
  { role: "ST", x: 65.69, z: -4.2 },
  { role: "ST", x: 65.67, z: 4.01 },
  { role: "CF", x: 69.58, z: -0.09 },
] as const;

type RoleMarker = (typeof roleMarkers)[number];

function markerKey(marker: { role: string; x: number; z: number }) {
  return `${marker.role}:${marker.x.toFixed(2)}:${marker.z.toFixed(2)}`;
}

function markerStyleForRole(role: string) {
  if (["LW", "RW", "ST", "CF"].includes(role))
    return { fill: palette.green, text: palette.white };
  if (["SW"].includes(role))
    return { fill: palette.red, text: palette.white };
  if (["GK"].includes(role))
    return { fill: palette.orange, text: palette.white };
  if (["LB", "CB", "RB", "LWB", "RWB"].includes(role))
    return { fill: palette.red, text: palette.white };
  if (["LM", "DM", "CM", "AM", "RM"].includes(role))
    return { fill: palette.lime, text: palette.dark };
  return { fill: palette.navy, text: palette.white };
}

function roleForPosition(x: number, z: number) {
  let nearest: RoleMarker = roleMarkers[0];
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const marker of roleMarkers) {
    const dx = marker.x - x;
    const dz = marker.z - z;
    const distance = dx * dx + dz * dz;
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = marker;
    }
  }
  return nearest.role;
}

/* ── Color helpers for role category ── */
function roleCategoryColor(role: string) {
  if (["GK"].includes(role)) return "bg-orange-500/15 text-orange-700 border-orange-300";
  if (["SW", "LB", "CB", "RB", "LWB", "RWB"].includes(role)) return "bg-red-500/15 text-red-700 border-red-300";
  if (["LM", "DM", "CM", "AM", "RM"].includes(role)) return "bg-lime-500/15 text-lime-800 border-lime-400";
  if (["LW", "RW", "ST", "CF"].includes(role)) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/40";
  return "bg-white/8 text-white/60 border border-slate-300";
}

/* ── 3D Field Viewer (inline) ── */
function FieldViewer({
  onSelectionChange,
  initialSelection,
}: {
  onSelectionChange?: (roles: string[]) => void;
  initialSelection?: string[];
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const selectedMarkerKeysRef = useRef<string[]>([]);
  const initialSelectionRef = useRef(initialSelection ?? []);
  const [isVerticalView, setIsVerticalView] = useState(false);
  const emitSelectionChangeEvent = useEffectEvent((roles: string[]) => {
    onSelectionChange?.(roles);
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette.bg);

    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 2000);
    camera.position.set(0, 8, 16);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.1, 0);
    controls.minDistance = 4;
    controls.maxDistance = 35;
    controls.maxPolarAngle = Math.PI / 2.02;
    controls.enabled = false;

    const hemi = new THREE.HemisphereLight("#dff7ff", "#0d3b20", 1.8);
    scene.add(hemi);
    const key = new THREE.DirectionalLight("#ffffff", 2.2);
    key.position.set(10, 18, 10);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#8bd3ff", 1.2);
    rim.position.set(-8, 10, -12);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(18, 64),
      new THREE.MeshBasicMaterial({ color: "#0a1322" }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.08;
    scene.add(floor);

    const loader = new GLTFLoader();
    const box = new THREE.Box3();
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    const worldPosition = new THREE.Vector3();

    const fieldMaterial = new THREE.MeshStandardMaterial({ color: palette.field, roughness: 0.92, metalness: 0.02 });
    const lineMaterial = new THREE.MeshStandardMaterial({ color: palette.white, roughness: 0.8, metalness: 0.02 });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const clickableMeshes: THREE.Mesh[] = [];
    const textMeshes: THREE.Mesh[] = [];
    const textEntries: Array<{ mesh: THREE.Mesh; textMesh: THREE.Mesh }> = [];
    let pointerDownX = 0;
    let pointerDownY = 0;
    let frameId = 0;
    let disposed = false;

    loader.load(
      "/lapangan/untitled.gltf",
      (gltf) => {
        if (disposed) return;

        const root = gltf.scene;
        scene.add(root);
        root.updateMatrixWorld(true);

        let largestMesh: THREE.Mesh | null = null;
        let largestArea = -1;
        const markerEntries: Array<{
          key: string;
          mesh: THREE.Mesh;
          textMesh?: THREE.Mesh;
          role: string;
          x: number;
          z: number;
          style: { fill: string; text: string };
        }> = [];

        const applyMarkerStyle = (
          entry: { mesh: THREE.Mesh; textMesh?: THREE.Mesh; style: { fill: string; text: string } },
          isActive: boolean,
        ) => {
          const markerMaterial = entry.mesh.material;
          if (markerMaterial instanceof THREE.MeshStandardMaterial) {
            markerMaterial.color.set(isActive ? palette.active : entry.style.fill);
          }
          if (entry.textMesh) {
            const textMaterial = entry.textMesh.material;
            if (textMaterial instanceof THREE.MeshStandardMaterial) {
              textMaterial.color.set(isActive ? palette.dark : entry.style.text);
            }
          }
          entry.mesh.scale.setScalar(isActive ? 1.08 : 1);
          entry.textMesh?.scale.setScalar(isActive ? 1.04 : 1);
        };

        const activeEntries = new Set<(typeof markerEntries)[number]>();

        const emitSelectionChange = () => {
          selectedMarkerKeysRef.current = Array.from(activeEntries).map((e) => e.key);
          const roles = Array.from(new Set(Array.from(activeEntries).map((e) => e.role))).sort(
            (a, b) => roleOrder.indexOf(a as (typeof roleOrder)[number]) - roleOrder.indexOf(b as (typeof roleOrder)[number]),
          );
          emitSelectionChangeEvent(roles);
        };

        const toggleEntry = (entry: (typeof markerEntries)[number]) => {
          if (activeEntries.has(entry)) {
            activeEntries.delete(entry);
            applyMarkerStyle(entry, false);
          } else {
            activeEntries.add(entry);
            applyMarkerStyle(entry, true);
          }
          emitSelectionChange();
        };

        const clearActiveEntries = () => {
          for (const entry of activeEntries) applyMarkerStyle(entry, false);
          activeEntries.clear();
          emitSelectionChange();
        };

        root.traverse((child) => {
          if (!(child instanceof THREE.Mesh) || !child.geometry) return;
          child.geometry.computeBoundingBox();
          const bounds = child.geometry.boundingBox;
          if (!bounds) return;
          const width = bounds.max.x - bounds.min.x;
          const depth = bounds.max.z - bounds.min.z;
          const area = width * depth;
          if (area > largestArea) {
            largestArea = area;
            largestMesh = child;
          }
          child.getWorldPosition(worldPosition);
          if ((child.name || "").toLowerCase().includes("ellipse")) {
            const role = roleForPosition(worldPosition.x, worldPosition.z);
            if (child.name === "Ellipse") return;
            markerEntries.push({
              key: markerKey({ role, x: worldPosition.x, z: worldPosition.z }),
              mesh: child,
              role,
              x: worldPosition.x,
              z: worldPosition.z,
              style: markerStyleForRole(role),
            });
          }
        });

        root.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const name = (child.name || "").toLowerCase();
          let material: THREE.MeshStandardMaterial = lineMaterial;

          if (child === largestMesh) {
            material = fieldMaterial;
          } else if (name.includes("ellipse")) {
            const marker = markerEntries.find((e) => e.mesh === child);
            material = new THREE.MeshStandardMaterial({
              color: marker ? marker.style.fill : palette.white,
              roughness: 0.72,
              metalness: 0.02,
            });
            clickableMeshes.push(child);
          } else if (name.includes("text")) {
            child.getWorldPosition(worldPosition);
            let nearest: (typeof markerEntries)[number] | undefined = markerEntries[0];
            let nearestDistance = Number.POSITIVE_INFINITY;
            for (const marker of markerEntries) {
              const dx = marker.x - worldPosition.x;
              const dz = marker.z - worldPosition.z;
              const distance = dx * dx + dz * dz;
              if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = marker;
              }
            }
            material = new THREE.MeshStandardMaterial({
              color: nearest ? nearest.style.text : palette.white,
              roughness: 0.9,
              metalness: 0.01,
              depthTest: false,
              depthWrite: false,
            });
            if (nearest) {
              nearest.textMesh = child;
              textEntries.push({ mesh: nearest.mesh, textMesh: child });
            }
            child.renderOrder = 12;
            textMeshes.push(child);
            clickableMeshes.push(child);
          } else if (name.includes("rectangle") || name.includes("path") || name.includes("shape")) {
            material = lineMaterial;
          }

          child.material = material.clone();
          child.castShadow = false;
          child.receiveShadow = false;
        });

        // Restore initial selection
        const initRoles = initialSelectionRef.current;
        if (initRoles.length > 0) {
          for (const entry of markerEntries) {
            if (initRoles.includes(entry.role)) {
              activeEntries.add(entry);
              applyMarkerStyle(entry, true);
            }
          }
          selectedMarkerKeysRef.current = Array.from(activeEntries).map((e) => e.key);
        }

        // Restore by keys
        for (const entry of markerEntries) {
          if (!selectedMarkerKeysRef.current.includes(entry.key)) continue;
          activeEntries.add(entry);
          applyMarkerStyle(entry, true);
        }

        box.setFromObject(root);
        box.getSize(size);
        box.getCenter(center);
        root.position.sub(center);
        root.position.y += size.y * 0.5;

        for (const textMesh of textMeshes) {
          textMesh.userData.basePosition = textMesh.position.clone();
          textMesh.userData.baseQuaternion = textMesh.quaternion.clone();
        }

        const fieldWidth = size.x;
        const fieldDepth = size.z;
        const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);

        const fitHeight = isVerticalView
          ? Math.max(fieldWidth, fieldDepth / camera.aspect) / (2 * Math.tan(halfFov))
          : Math.max(fieldWidth / camera.aspect, fieldDepth) / (2 * Math.tan(halfFov));

        camera.position.set(0, fitHeight * 1.05, fieldDepth * 0.04);
        if (isVerticalView) {
          camera.up.set(1, 0, 0);
        } else {
          camera.up.set(0, 0, -1);
        }
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.minDistance = fitHeight * 0.45;
        controls.maxDistance = fitHeight * 2.5;
        controls.maxPolarAngle = THREE.MathUtils.degToRad(88);
        controls.update();

        const findEntryForMesh = (mesh: THREE.Object3D) =>
          markerEntries.find((e) => e.mesh === mesh || e.textMesh === mesh) ?? null;

        const handlePointerMove = (event: PointerEvent) => {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(clickableMeshes, false)[0];
          renderer.domElement.style.cursor = hit ? "pointer" : "grab";
        };

        const updatePointer = (event: PointerEvent) => {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };

        const handlePointerDown = (event: PointerEvent) => {
          pointerDownX = event.clientX;
          pointerDownY = event.clientY;
        };

        const handlePointerUp = (event: PointerEvent) => {
          const dragDistance = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
          if (dragDistance > 6) return;
          updatePointer(event);
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(clickableMeshes, false)[0];
          const entry = hit ? findEntryForMesh(hit.object) : null;
          if (!entry) {
            clearActiveEntries();
            return;
          }
          toggleEntry(entry);
        };

        renderer.domElement.style.cursor = "grab";
        renderer.domElement.addEventListener("pointermove", handlePointerMove);
        renderer.domElement.addEventListener("pointerdown", handlePointerDown);
        renderer.domElement.addEventListener("pointerup", handlePointerUp);

        root.userData.cleanupInteractions = () => {
          renderer.domElement.removeEventListener("pointermove", handlePointerMove);
          renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
          renderer.domElement.removeEventListener("pointerup", handlePointerUp);
        };
      },
      undefined,
      () => {
        if (!disposed) {
          mount.innerHTML =
            '<div style="display:grid;place-items:center;height:100%;color:#fca5a5;padding:24px;text-align:center;font:500 14px Segoe UI,sans-serif;">Gagal memuat model 3D.</div>';
        }
      },
    );

    const handleResize = () => {
      if (!mount) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const tick = () => {
      if (isVerticalView) {
        for (const entry of textEntries) {
          entry.textMesh.position.copy(entry.mesh.position);
          entry.textMesh.position.y += 0.03;
          entry.textMesh.quaternion.copy(camera.quaternion);
          entry.textMesh.renderOrder = 12;
        }
      }
      controls.update();
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(tick);
    };

    window.addEventListener("resize", handleResize);
    tick();

    return () => {
      disposed = true;
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frameId);
      controls.dispose();
      renderer.dispose();
      scene.traverse((child) => {
        if (typeof child.userData.cleanupInteractions === "function") child.userData.cleanupInteractions();
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
          return;
        }
        child.material.dispose();
      });
      mount.innerHTML = "";
    };
  }, [isVerticalView]);

  return (
    <div className="relative h-full w-full">
      <button
        type="button"
        title={isVerticalView ? "Tampilan horizontal" : "Tampilan vertikal"}
        onClick={() => setIsVerticalView((c) => !c)}
        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#1E1E1E] text-white shadow-lg backdrop-blur transition hover:border-emerald-500/40/40 hover:bg-[#2A2A2A]"
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 transition-transform duration-300 ${isVerticalView ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 11a8 8 0 1 0 2 5.3" />
          <path d="M20 4v7h-7" />
        </svg>
      </button>
      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
}

/* ── Modal wrapper ── */
type FieldViewerModalProps = {
  open: boolean;
  onClose: () => void;
  selectedRoles: string[];
  onConfirm: (roles: string[]) => void;
};

export function FieldViewerModal({ open, onClose, selectedRoles, onConfirm }: FieldViewerModalProps) {
  const [localRoles, setLocalRoles] = useState<string[]>(selectedRoles);

  useEffect(() => {
    if (open) setLocalRoles(selectedRoles);
  }, [open, selectedRoles]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const handleConfirm = useCallback(() => {
    onConfirm(localRoles);
    onClose();
  }, [localRoles, onConfirm, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 flex w-[95vw] max-w-[900px] flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#0c1929] shadow-2xl max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div>
            <h3 className="text-base font-bold text-white">Pilih Role Pemain</h3>
            <p className="text-[0.72rem] text-slate-400">Klik posisi di lapangan untuk memilih role</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 3D Viewer */}
        <div className="h-[70vh] min-h-[400px] w-full">
          <FieldViewer
            initialSelection={selectedRoles}
            onSelectionChange={(roles) => setLocalRoles(roles)}
          />
        </div>

        {/* Selected roles display */}
        <div className="border-t border-white/10 px-5 py-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[0.72rem] font-semibold text-slate-400">Role terpilih:</span>
            {localRoles.length === 0 && (
              <span className="text-[0.72rem] text-slate-500">Belum ada role dipilih</span>
            )}
          </div>
          {localRoles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {localRoles.map((role) => (
                <span
                  key={role}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-bold ${roleCategoryColor(role)}`}
                >
                  {role}
                  <span className="text-[0.6rem] font-normal opacity-70">
                    {roleLabels[role] ?? role}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-white/10 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-2 text-[0.8rem] font-semibold text-white/70 transition hover:bg-white/5"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl px-5 py-2 text-[0.8rem] font-bold text-white shadow-md transition hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #FF3B30 0%, #B22A22 100%)" }}
          >
            Konfirmasi {localRoles.length > 0 ? `(${localRoles.length} role)` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
