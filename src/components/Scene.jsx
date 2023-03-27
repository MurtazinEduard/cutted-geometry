import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSG } from "three-csg-ts";
const Scene = () => {
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  useEffect(() => {
    const { current } = canvasRef;
    const scene = new THREE.Scene();
    const color2 = new THREE.Color(0xff0000);
    /* scene.add(color2); */
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(0, 1, 5);
    camera.lookAt(THREE.Vector3);
    console.log(canvasRef);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: current,
    });
    renderer.setSize(window.innerWidth * 0.98, window.innerHeight * 0.97);
    renderer.outputEncoding = THREE.sRGBEncoding;
    /* Контролс */
    const controls = new OrbitControls(camera, renderer.domElement);
    /* Амбиан лайт */
    const ambientLight = new THREE.AmbientLight(0xededed, 0.3);
    scene.add(ambientLight);
    /* Куб */
    /* const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x545454 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube); */
    /* Lines */
    function setLines() {
      const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
      const points = [];
      points.push(new THREE.Vector3(-10, 0, 0));
      points.push(new THREE.Vector3(0, 0, 0));
      points.push(new THREE.Vector3(10, 0, 0));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }
    setLines();
    /* Plane */
    /* function setPlane() {
      const geometry = new THREE.PlaneGeometry(10, 10);
      const material = new THREE.MeshNormalMaterial({
        color: "grey",
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(geometry, material);
      scene.add(plane);
      plane.rotation.set(Math.PI / 2, 0, 0);
      plane.position.set(0, 0, 0);
    } */
    /* setPlane(); */

    /* function constructGeometry() {
      const mainBox = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshNormalMaterial()
      );
      //scene.add(mainBox)
      const secondaryBox = new THREE.Mesh(
        new THREE.BoxGeometry(1, 3, 1),
        new THREE.MeshNormalMaterial()
      );
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.25, 32, 32, 0, Math.PI * 2, 0, Math.PI)
      );
      const sphereBox = CSG.union(secondaryBox, sphere) 
      sphereBox.updateMatrix()
      //sphere.position.set(0, 2, 0);
      //sphere.scale.set(1.1, 1.1, 1.1);
      sphere.updateMatrixWorld(); //ВАЖНО ОБНОВИТЬ МАТРИЦУ
      const subtractGeometry = CSG.subtract(mainBox, sphereBox);
      renderer.render(scene, camera);
        console.log(subtractGeometry)
      scene.add(subtractGeometry );
    }
    constructGeometry(); */

    function addTable() {
      const thickness = 0.05; // толщина стенок, столешницы
      const tableLength = 2; //Длина стола стола
      const tableHeight = 1; //Высота стола
      const tabletop = new THREE.Mesh(
        new THREE.BoxGeometry(tableLength, thickness, 1),
        new THREE.MeshNormalMaterial()
      );
      tabletop.position.set(0, -0.025, 0);
      function createLegs() {
        const legsLength = tableHeight - thickness / 2; // Длина ножек, чтобы снизу были
        const legsHeight = tableHeight - legsLength / 2 - thickness / 2; // Высота ножек
        const leg = new THREE.Mesh(
          new THREE.BoxGeometry(thickness, legsLength, 1),
          new THREE.MeshNormalMaterial()
        );
        leg.position.set(-tableLength / 2 + thickness / 2, legsHeight, -0);
        const leg2 = new THREE.Mesh(
          new THREE.BoxGeometry(thickness, legsLength, 1),
          new THREE.MeshNormalMaterial()
        );
        leg2.position.set(tableLength / 2 - thickness / 2, legsHeight, 0);
        const legs = [leg, leg2];
        scene.add(...legs);
      }
      function getCuttedTabletop() {
        //---Стол с круглым отверстием---
        //Сфера, которой будут делать отверстие
        const insideSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 32, 32, 0, Math.PI * 2, 0, Math.PI),
          new THREE.MeshNormalMaterial()
        );
        insideSphere.position.set(-0.5, 0, 0); //
        insideSphere.updateMatrixWorld(); // Позиционирование отверстия
        const subtractedSphere = CSG.subtract(tabletop, insideSphere);
        /* subtractedSphere.position.set(0, tableHeight, 0); */
        //Сфера которая будет выше стола
        const outsideUpperSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 32, 32, 0, Math.PI * 2, 0, Math.PI),
          new THREE.MeshNormalMaterial()
        );
        outsideUpperSphere.position.set(-0.5, tableHeight + 1, 0); //Позиционирование
        //---Стол с квадратным отверстием---
        const insideBox = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.5, 0.5),
          new THREE.MeshNormalMaterial()
        );
        insideBox.position.set(0.5, 0, 0); //
        insideBox.updateMatrixWorld(); // Позиционирование отверстия
        const subtractedBox = CSG.subtract(subtractedSphere, insideBox);
        subtractedBox.position.set(0, tableHeight, 0);
        //Куб над столом
        const outsideUpperBox = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.5, 0.5),
          new THREE.MeshNormalMaterial()
        );
        outsideUpperBox.position.set(0.5, tableHeight + 1, 0);
        //Все геометрические фигуры, которые нужно добавить в сцену
        const meshes = [outsideUpperSphere, outsideUpperBox, subtractedBox];
        scene.add(...meshes);
      }
      const meshes = [
        tabletop //столешница без отверстий, правда она сейчас служит полом
      ];
      createLegs();
      getCuttedTabletop();
      scene.add(...meshes);
    }
    addTable();

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
    setLoading(false);
  }, []);
  return (
    <div
    /* style={{ height: "90vh", width: "90vw", position: "relative" }} */
    /* ref={refContainer} */
    >
      <canvas ref={canvasRef}></canvas>
      {loading && (
        <>
          <span style={{ position: "absolute", left: "50%", top: "50%" }}>
            Loading...
          </span>
        </>
      )}
    </div>
  );
};

export default Scene;
