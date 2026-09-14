"use client";

import { geoCentroid, geoContains, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { useReducedMotion } from "framer-motion";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import { useEffect, useRef, useState } from "react";

import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";

const topology = world as unknown as Topology<{ countries: GeometryCollection }>;
const countries = feature(topology, topology.objects.countries) as unknown as FeatureCollection<Geometry>;
const iran = countries.features.find((country) => String(country.id) === "364") as Feature<Geometry> | undefined;
const iranCenter = iran ? geoCentroid(iran) : ([53, 32] as [number, number]);
const DRAG_SCALE = 0.24;
const INERTIA_FRICTION = 0.945;

type IranGlobeProps = {
  locale: "fa" | "en";
  selected: boolean;
  onSelect: () => void;
};

type DragState = {
  active: boolean;
  pointerId: number | null;
  lastX: number;
  lastY: number;
  lastTime: number;
  distance: number;
};

export function IranGlobe({ locale, selected, onSelect }: IranGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const rotationRef = useRef<[number, number, number]>([-iranCenter[0], -iranCenter[1], 0]);
  const velocityRef = useRef<[number, number]>([0, 0]);
  const idleUntilRef = useRef(0);
  const suppressClickRef = useRef(false);
  const kineticRef = useRef(false);
  const dragRef = useRef<DragState>({ active: false, pointerId: null, lastX: 0, lastY: 0, lastTime: 0, distance: 0 });
  const [hoveringIran, setHoveringIran] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [kinetic, setKinetic] = useState(false);
  const reducedMotion = useReducedMotion();
  const label = locale === "fa"
    ? "کره تعاملی؛ بکشید تا بچرخد و خود ایران را برای ورود انتخاب کنید"
    : "Interactive globe; drag to rotate, then select Iran itself to enter";

  const updateKinetic = (next: boolean) => {
    if (kineticRef.current === next) return;
    kineticRef.current = next;
    setKinetic(next);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const projection = geoOrthographic().clipAngle(90).precision(0.35);
    const path = geoPath(projection, context);
    const graticule = geoGraticule10();
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      projection.translate([width / 2, height / 2]).scale(Math.min(width, height) * 0.42);
    };

    const draw = (time: number) => {
      const velocity = velocityRef.current;

      if (!selected && !dragRef.current.active) {
        if (!reducedMotion && Math.hypot(velocity[0], velocity[1]) > 0.012) {
          rotationRef.current[0] += velocity[0];
          rotationRef.current[1] = Math.max(-78, Math.min(78, rotationRef.current[1] + velocity[1]));
          velocity[0] *= INERTIA_FRICTION;
          velocity[1] *= INERTIA_FRICTION;
        } else {
          velocity[0] = 0;
          velocity[1] = 0;
          updateKinetic(false);
          if (!reducedMotion && time > idleUntilRef.current) rotationRef.current[0] += 0.018;
        }
      }

      const rotation = rotationRef.current;
      const speed = reducedMotion ? 0 : Math.min(1, Math.hypot(velocity[0], velocity[1]) / 2.8);
      projection.rotate(rotation);
      context.clearRect(0, 0, width, height);

      const glow = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.min(width, height) * 0.47);
      glow.addColorStop(0, `rgba(17, 46, 72, ${0.2 + speed * 0.1})`);
      glow.addColorStop(0.62, "rgba(3, 13, 27, .3)");
      glow.addColorStop(1, "rgba(2, 8, 16, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      context.beginPath();
      path({ type: "Sphere" });
      context.fillStyle = "rgba(2, 10, 22, .96)";
      context.fill();
      context.strokeStyle = "rgba(76, 136, 160, .23)";
      context.lineWidth = 0.9;
      context.stroke();

      context.beginPath();
      path(graticule);
      context.strokeStyle = "rgba(91, 127, 151, .11)";
      context.lineWidth = 0.55;
      context.stroke();

      if (speed > 0.035) {
        context.save();
        context.globalCompositeOperation = "screen";
        for (let wake = 5; wake >= 1; wake -= 1) {
          projection.rotate([
            rotation[0] - velocity[0] * wake * 1.7,
            rotation[1] - velocity[1] * wake * 1.7,
            0,
          ]);
          context.beginPath();
          path(countries);
          context.globalAlpha = speed * (0.035 + (6 - wake) * 0.014);
          context.strokeStyle = wake % 2 === 0 ? "#ffd400" : "#4de3c1";
          context.lineWidth = 0.75 + speed * 0.8;
          context.stroke();
        }
        context.restore();
        projection.rotate(rotation);
      }

      context.beginPath();
      path(countries);
      context.fillStyle = "rgba(12, 31, 50, .78)";
      context.fill();

      for (const country of countries.features) {
        context.beginPath();
        path(country);
        const isIran = String(country.id) === "364";
        context.save();
        if (isIran && hoveringIran) {
          context.shadowColor = "#ffd400";
          context.shadowBlur = 22;
        }
        if (isIran) {
          context.fillStyle = "#FFD400";
          context.fill();
        }
        context.strokeStyle = isIran ? "rgba(255, 246, 175, .98)" : "rgba(106, 149, 174, .22)";
        context.lineWidth = isIran ? (hoveringIran ? 2.15 : 1.45) : 0.5;
        context.stroke();
        context.restore();
      }

      if (speed > 0.035) {
        const radius = Math.min(width, height) * 0.42;
        context.save();
        context.beginPath();
        context.arc(width / 2, height / 2, radius + 2 + speed * 4, 0, Math.PI * 2);
        context.strokeStyle = `rgba(77, 227, 193, ${0.18 + speed * 0.45})`;
        context.lineWidth = 1 + speed * 2.2;
        context.shadowColor = speed > 0.55 ? "#ffd400" : "#4de3c1";
        context.shadowBlur = 8 + speed * 26;
        context.stroke();
        context.restore();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    frameRef.current = requestAnimationFrame(draw);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [hoveringIran, reducedMotion, selected]);

  const isIranAtPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !iran) return false;
    const rect = canvas.getBoundingClientRect();
    const projection = geoOrthographic()
      .clipAngle(90)
      .translate([rect.width / 2, rect.height / 2])
      .scale(Math.min(rect.width, rect.height) * 0.42)
      .rotate(rotationRef.current);
    const coordinate = projection.invert?.([clientX - rect.left, clientY - rect.top]);
    return coordinate ? geoContains(iran, coordinate) : false;
  };

  const endDrag = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    drag.active = false;
    drag.pointerId = null;
    suppressClickRef.current = drag.distance > 6;
    setDragging(false);
    idleUntilRef.current = performance.now() + 2600;
    if (!reducedMotion && Math.hypot(...velocityRef.current) > 0.08) updateKinetic(true);
    else velocityRef.current = [0, 0];
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setHoveringIran(isIranAtPoint(event.clientX, event.clientY));
  };

  return (
    <div className={`iran-globe ${selected ? "is-selected" : ""} ${dragging ? "is-dragging" : ""} ${kinetic ? "is-kinetic" : ""}`}>
      <canvas
        ref={canvasRef}
        className={hoveringIran ? "is-targeting" : ""}
        role="button"
        tabIndex={selected ? -1 : 0}
        aria-label={label}
        onPointerDown={(event) => {
          if (selected || event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            active: true,
            pointerId: event.pointerId,
            lastX: event.clientX,
            lastY: event.clientY,
            lastTime: performance.now(),
            distance: 0,
          };
          velocityRef.current = [0, 0];
          suppressClickRef.current = false;
          updateKinetic(false);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (selected) return;
          const drag = dragRef.current;
          if (!drag.active || drag.pointerId !== event.pointerId) {
            setHoveringIran(isIranAtPoint(event.clientX, event.clientY));
            return;
          }
          const now = performance.now();
          const dx = event.clientX - drag.lastX;
          const dy = event.clientY - drag.lastY;
          const frameFactor = Math.min(2.4, 16.67 / Math.max(8, now - drag.lastTime));
          rotationRef.current[0] += dx * DRAG_SCALE;
          rotationRef.current[1] = Math.max(-78, Math.min(78, rotationRef.current[1] - dy * DRAG_SCALE));
          velocityRef.current = [dx * DRAG_SCALE * frameFactor, -dy * DRAG_SCALE * frameFactor];
          drag.lastX = event.clientX;
          drag.lastY = event.clientY;
          drag.lastTime = now;
          drag.distance += Math.hypot(dx, dy);
          setHoveringIran(false);
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(event) => {
          if (!dragRef.current.active) setHoveringIran(false);
          if (event.pointerType === "mouse" && event.buttons === 0 && dragRef.current.active) endDrag(event);
        }}
        onClick={(event) => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          if (!selected && isIranAtPoint(event.clientX, event.clientY)) onSelect();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
      />
    </div>
  );
}
