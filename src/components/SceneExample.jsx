import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/* КОД НЕ РАБОЧИЙ, НУ КАК, НЕЗАЧЕМ ЕГО ЗАПУСКАТЬ) */

function loadGLTFModel(scene, glbPath, options) {
  const { receiveShadow, castShadow } = options;
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      glbPath,
      (gltf) => {
        const obj = gltf.scene;
        obj.name = "dinosaur";
        obj.position.y = 0;
        obj.position.x = 0;
        obj.receiveShadow = receiveShadow;
        obj.castShadow = castShadow;
        scene.add(obj);

        obj.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = castShadow;
            child.receiveShadow = receiveShadow;
          }
        });

        resolve(obj);
      },
      undefined,
      function (error) {
        console.log(error);
        reject(error);
      }
    );
  });
}

function easeOutCirc(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 4));
}

const Scene = () => {
  const refContainer = useRef();
  const canvasRef = useRef()
  const [renderer, setRenderer] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { current: container } = refContainer;
    if (container && !renderer) {
      const scW = container.clientWidth;
      const scH = container.clientHeight;
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas: canvasRef,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(scW, scH);
      renderer.outputEncoding = THREE.sRGBEncoding;
      container.appendChild(renderer.domElement);
      setRenderer(renderer);
      const scene = new THREE.Scene();
      const scale = 5.6;
      const camera = new THREE.OrthographicCamera(
        -scale,
        scale,
        scale,
        -scale,
        0.01,
        50000
      );
      const target = new THREE.Vector3(-0.5, 1.2, 0);
      const initialCameraPosition = new THREE.Vector3(
        20 * Math.sin(0.2 * Math.PI),
        10,
        20 * Math.cos(0.2 * Math.PI)
      );
      const ambientLight = new THREE.AmbientLight(0xcccccc, 1);
      scene.add(ambientLight);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.autoRotate = true;
      controls.target = target;
      loadGLTFModel(scene, "/Dinosaur.glb", {
        receiveShadow: false,
        castShadow: false,
      }).then(() => {
        animate();
        setLoading(false);
      });

      let req = null;
      let frame = 0;
      function setThreeBSP() {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(3, 2, 2),
          new THREE.MeshNormalMaterial({ color: "red" })
        );
        box.position.set(0,0.2,0)
        const insideBox = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshNormalMaterial({ color: "red" })
        );
        
        
        const insideBox2 = new THREE.Mesh(
          new THREE.BoxGeometry(2, 1.5, 3),
          new THREE.MeshNormalMaterial({ color: "red" })
        );
        const insideBox3 = new THREE.Mesh(
          new THREE.BoxGeometry(3, 1.5, 1),
          new THREE.MeshNormalMaterial({ color: "red" })
        );
        const insideBoxes = CSG.union(insideBox, insideBox2);
        const insideBoxes2 = CSG.union(insideBoxes, insideBox3);
        insideBoxes2.position.set(0,1,0)
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(1.25, 32, 32, 0, Math.PI * 2, 0, Math.PI)
        );
        /* box.updateMatrix();
        sphere.updateMatrix(); */
        const subRes = CSG.subtract(box, insideBoxes2);
        subRes.position.set(0, 0, 0);
        const uniRes = CSG.union(box, sphere);
        uniRes.position.set(-4, 0, 0);
        const intRes = CSG.intersect(box, sphere);
        intRes.position.set(4, 0, 0);
        scene.add(/* box, sphere,*/ subRes, uniRes, intRes);
        console.log(subRes);
      }
      setThreeBSP();
      const animate = () => {
        req = requestAnimationFrame(animate);
        frame = frame <= 100 ? frame + 1 : frame;

        if (frame <= 100) {
          const p = initialCameraPosition;
          const rotSpeed = -easeOutCirc(frame / 120) * Math.PI * 20;

          camera.position.y = 10;
          camera.position.x = p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed);
          camera.position.z = p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed);
          camera.lookAt(target);
        } else {
          controls.update();
        }

        renderer.render(scene, camera);

      };

      return () => {
        cancelAnimationFrame(req);
        renderer.dispose();
      };
    }
  }, []);
  return (
    <div style={{ height: "540px", width: "540px", position: "relative" }} ref={refContainer}>
      <canvas ref={canvasRef}/>
      {loading && (
        <span style={{ position: "absolute", left: "50%", top: "50%" }}>Loading...</span>
      )}
    </div>
  );
};

export default Scene;
