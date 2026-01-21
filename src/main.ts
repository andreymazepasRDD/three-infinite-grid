import "./style.css";

import {
  AmbientLight,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TeapotGeometry } from "three/examples/jsm/geometries/TeapotGeometry.js";
import ThreeInfiniteGrid from "../lib/three-infinite-grid";
import GUI from "lil-gui";

type Lang = "EN" | "JP";

const STRINGS: Record<Lang, Record<string, string>> = {
  EN: {
    background: "Background",
    gridPlane: "Grid Plane",
    sizeSettings: "Size Settings",
    colorSettings: "Color Settings",
    cellSize: "Cell Size",
    majorGridFactor: "Major Grid Factor",
    minorLineWidth: "Minor Line Width",
    majorLineWidth: "Major Line Width",
    axisLineWidth: "Axis Line Width",
    minorLineColor: "Minor Line Color",
    majorLineColor: "Major Line Color",
    xAxisColor: "X Axis Color",
    yAxisColor: "Y Axis Color",
    zAxisColor: "Z Axis Color",
    centerColor: "Center Color",
    showXAxis: "Show X Axis",
    showYAxis: "Show Y Axis",
    showZAxis: "Show Z Axis",
    opacity: "Opacity",
    planeXZ: "XZ",
    planeXY: "XY",
    planeZY: "ZY",
  },
  JP: {
    background: "背景",
    gridPlane: "グリッド平面",
    sizeSettings: "サイズ設定",
    colorSettings: "色設定",
    cellSize: "セルサイズ",
    majorGridFactor: "メジャー分割",
    minorLineWidth: "マイナー線幅",
    majorLineWidth: "メジャー線幅",
    axisLineWidth: "軸線幅",
    minorLineColor: "マイナー線色",
    majorLineColor: "メジャー線色",
    xAxisColor: "X軸の色",
    yAxisColor: "Y軸の色",
    zAxisColor: "Z軸の色",
    centerColor: "中心の色",
    showXAxis: "X軸を表示",
    showYAxis: "Y軸を表示",
    showZAxis: "Z軸を表示",
    opacity: "不透明度",
    planeXZ: "XZ",
    planeXY: "XY",
    planeZY: "ZY",
  },
};

const resolveLang = (): Lang => {
  const query = new URLSearchParams(window.location.search);
  const langParam = query.get("lang")?.toUpperCase();
  if (langParam === "EN" || langParam === "JP") {
    return langParam;
  }

  const browserLang = navigator.language?.toLowerCase() ?? "";
  return browserLang.startsWith("ja") ? "JP" : "EN";
};

const LANG = resolveLang();
const t = (key: keyof (typeof STRINGS)["EN"]) => STRINGS[LANG][key];

// Z-up world (Three defaults to Y-up)
Object3D.DEFAULT_UP.set(0, 0, 1);

const scene = new Scene();

const camera = new PerspectiveCamera(
  40,
  document.body.offsetWidth / document.body.offsetHeight,
  0.01,
  4000,
);
camera.position.set(10, 10, 10);

scene.add(camera);

//#region Renderer setup
const renderer = new WebGLRenderer();
const rendererSettings = {
  backgroundColor: "rgba(51, 51, 51, 1)",
};
renderer.setClearColor(new Color(rendererSettings.backgroundColor));

const handleResize = () => {
  renderer.setSize(document.body.offsetWidth, document.body.offsetHeight);
  renderer.setPixelRatio(devicePixelRatio);

  camera.aspect = document.body.offsetWidth / document.body.offsetHeight;
  camera.updateProjectionMatrix();
};

handleResize();
window.addEventListener("resize", handleResize);
document.body.append(renderer.domElement);
//#endregion

//#region Basic scene
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

const ambientLight = new AmbientLight(new Color("#ffffff"), 1.5);
const directionalLight = new DirectionalLight(new Color("#ffffff"), 1.5);
directionalLight.position.set(15, -10, 25);

const hemisphereLight = new HemisphereLight(
  new Color("#ffffff"),
  new Color("#777777"),
  0.6,
);
scene.add(hemisphereLight);

const keyLight = new PointLight(new Color("#ffffff"), 60, 300);
keyLight.position.set(18, -18, 22);
scene.add(keyLight);


const cube = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
// Place the cube on the floor (XY plane) with Z-up
cube.position.set(0, 0, 0.5);
//scene.add(cube);

scene.add(ambientLight, directionalLight);

// Single center teapot for depth cues
const teapot = new Mesh(
  new TeapotGeometry(3, 10, true, true, true, false, true),
  new MeshStandardMaterial({
    color: new Color("#e6e6e6"),
    roughness: 0.35,
    metalness: 0.15,
  }),
);
teapot.position.set(0, 0, 4);
// TeapotGeometry is authored for Y-up; rotate so it stands in Z-up
teapot.rotation.x = Math.PI / 2;
teapot.rotation.z = Math.PI / 6;
scene.add(teapot);

// With Z-up, the floor is the XY plane (z = 0)
const grid = new ThreeInfiniteGrid({ plane: 1 });
scene.add(grid);

// 3D axis helper that reuses the grid's axis colors + axisLineWidth
const axisLength = 1000;
const axisGeometry = new CylinderGeometry(1, 1, 1, 12);
//const xAxisMesh = new Mesh(axisGeometry, new MeshBasicMaterial());
//const yAxisMesh = new Mesh(axisGeometry, new MeshBasicMaterial());
const zAxisMesh = new Mesh(axisGeometry, new MeshBasicMaterial());
scene.add(zAxisMesh);

// CylinderGeometry is Y-aligned; rotate to match each world axis
//xAxisMesh.rotation.z = -Math.PI / 2;
zAxisMesh.rotation.x = Math.PI / 2;

const syncAxisHelperFromGrid = () => {
  const width = grid.axisLineWidth * grid.cellSize;
  const radius = Math.max(0.0001, width / 2);

  //xAxisMesh.scale.set(radius, axisLength, radius);
  //yAxisMesh.scale.set(radius, axisLength, radius);
  zAxisMesh.scale.set(radius, axisLength, radius);

  //(xAxisMesh.material as MeshBasicMaterial).color.set(grid.xAxisColor);
  //(yAxisMesh.material as MeshBasicMaterial).color.set(grid.yAxisColor);
  (zAxisMesh.material as MeshBasicMaterial).color.set(grid.zAxisColor);

  //xAxisMesh.visible = grid.showXAxis;
  //yAxisMesh.visible = grid.showYAxis;
  zAxisMesh.visible = grid.showZAxis;
};
syncAxisHelperFromGrid();

const gui = new GUI();
gui
  .addColor(rendererSettings, "backgroundColor")
  .name(t("background"))
  .onChange((value: string) => {
    renderer.setClearColor(new Color(value));
  });

//gui
//  .add(grid, "plane")
//  .name(t("gridPlane"))
//  .options({ [t("planeXZ")]: 0, [t("planeXY")]: 1, [t("planeZY")]: 2 });

const sizeSettings = gui.addFolder(t("sizeSettings"));
sizeSettings
  .add(grid, "cellSize")
  .name(t("cellSize"))
  .min(0.1)
  .max(48)
  .step(0.1)
  .onChange(syncAxisHelperFromGrid);
sizeSettings
  .add(grid, "majorGridFactor")
  .name(t("majorGridFactor"))
  .min(2)
  .max(10)
  .step(1);
sizeSettings
  .add(grid, "minorLineWidth")
  .name(t("minorLineWidth"))
  .min(0.001)
  .max(0.1)
  .step(0.001);
sizeSettings
  .add(grid, "majorLineWidth")
  .name(t("majorLineWidth"))
  .min(0.001)
  .max(0.1)
  .step(0.001);
const axisLineWidthController = sizeSettings
  .add(grid, "axisLineWidth")
  .name(t("axisLineWidth"))
  .min(0.001)
  .max(0.2)
  .step(0.001);
axisLineWidthController.onChange(syncAxisHelperFromGrid);

const colorSettings = gui.addFolder(t("colorSettings"));
colorSettings.addColor(grid, "minorLineColor").name(t("minorLineColor"));
colorSettings.addColor(grid, "majorLineColor").name(t("majorLineColor"));
colorSettings
  .addColor(grid, "xAxisColor")
  .name(t("xAxisColor"))
  .onChange(syncAxisHelperFromGrid);
colorSettings
  .addColor(grid, "yAxisColor")
  .name(t("yAxisColor"))
  .onChange(syncAxisHelperFromGrid);
colorSettings
  .addColor(grid, "zAxisColor")
  .name(t("zAxisColor"))
  .onChange(syncAxisHelperFromGrid);
colorSettings.addColor(grid, "centerColor").name(t("centerColor"));
colorSettings
  .add(grid, "showXAxis")
  .name(t("showXAxis"))
  .onChange(syncAxisHelperFromGrid);
colorSettings
  .add(grid, "showYAxis")
  .name(t("showYAxis"))
  .onChange(syncAxisHelperFromGrid);
colorSettings
  .add(grid, "showZAxis")
  .name(t("showZAxis"))
  .onChange(syncAxisHelperFromGrid);
colorSettings.add(grid, "opacity").name(t("opacity")).min(0).max(1).step(0.05).onChange((value: number) => {
  zAxisMesh.material.opacity = value;
  zAxisMesh.material.transparent = value < 1;
  zAxisMesh.material.depthTest = value === 1;;
    zAxisMesh.material.needsUpdate = true;

});

//#endregion

const loop = () => {
  renderer.render(scene, camera);
  if (controls.enabled) {
    controls.update();
  }
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);
