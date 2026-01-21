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
import { ViewportGizmo, type GizmoOptions } from "three-viewport-gizmo";
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

    roundedCubeGizmo: "Rounded Cube Gizmo",
    gizmoFaceColor: "Face Color",
    gizmoEdgeColor: "Edge Color",
    gizmoCornerColor: "Corner Color",
    gizmoHoverColor: "Hover Color",
    gizmoLabelColor: "Label Color",

    sphereGizmo: "Sphere Gizmo",
    gizmoPlacement: "Placement",
    gizmoSize: "Size",
    gizmoAnimated: "Animated",
    gizmoSpeed: "Speed",
    gizmoResolution: "Resolution",
    gizmoOffset: "Offset",
    gizmoBackground: "Background",
    gizmoBackgroundOpacity: "Background Opacity",
    gizmoBackgroundHover: "Background (Hover)",
    gizmoBackgroundHoverOpacity: "Background Hover Opacity",
    gizmoLineWidth: "Line Width",

    gizmoRightLabel: "Right",
    gizmoLeftLabel: "Left",
    gizmoTopLabel: "Top",
    gizmoBottomLabel: "Bottom",
    gizmoFrontLabel: "Front",
    gizmoBackLabel: "Back",
    gizmoPosXLabel: "+X",
    gizmoNegXLabel: "-X",
    gizmoPosYLabel: "+Y",
    gizmoNegYLabel: "-Y",
    gizmoPosZLabel: "+Z",
    gizmoNegZLabel: "-Z",
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

    roundedCubeGizmo: "角丸キューブ（Gizmo）",
    gizmoFaceColor: "面の色",
    gizmoEdgeColor: "エッジの色",
    gizmoCornerColor: "コーナーの色",
    gizmoHoverColor: "ホバー時の色",
    gizmoLabelColor: "ラベルの色",

    sphereGizmo: "球体（Gizmo）",
    gizmoPlacement: "配置",
    gizmoSize: "サイズ",
    gizmoAnimated: "アニメーション",
    gizmoSpeed: "速度",
    gizmoResolution: "解像度",
    gizmoOffset: "オフセット",
    gizmoBackground: "背景",
    gizmoBackgroundOpacity: "背景の不透明度",
    gizmoBackgroundHover: "背景（ホバー）",
    gizmoBackgroundHoverOpacity: "背景ホバーの不透明度",
    gizmoLineWidth: "線の太さ",

    gizmoRightLabel: "右",
    gizmoLeftLabel: "左",
    gizmoTopLabel: "上",
    gizmoBottomLabel: "下",
    gizmoFrontLabel: "前",
    gizmoBackLabel: "後",
    gizmoPosXLabel: "+X",
    gizmoNegXLabel: "-X",
    gizmoPosYLabel: "+Y",
    gizmoNegYLabel: "-Y",
    gizmoPosZLabel: "+Z",
    gizmoNegZLabel: "-Z",
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
camera.up.set(0, 0, 1);
camera.position.set(14, 14, 14);

scene.add(camera);

//#region Renderer setup
const renderer = new WebGLRenderer();
const gizmos: ViewportGizmo[] = [];
const rendererSettings = {
  backgroundColor: "rgba(51, 51, 51, 1)",
};
renderer.setClearColor(new Color(rendererSettings.backgroundColor));

const handleResize = () => {
  renderer.setSize(document.body.offsetWidth, document.body.offsetHeight);
  renderer.setPixelRatio(devicePixelRatio);

  camera.aspect = document.body.offsetWidth / document.body.offsetHeight;
  camera.updateProjectionMatrix();

  for (const gizmo of gizmos) {
    gizmo.update();
  }
};

handleResize();
window.addEventListener("resize", handleResize);
document.body.append(renderer.domElement);
//#endregion

//#region Basic scene
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0, 2);
controls.update();

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
//teapot.rotation.z = Math.PI / 6;
scene.add(teapot);

// With Z-up, the floor is the XY plane (z = 0)
const grid = new ThreeInfiniteGrid({ plane: 1 });
scene.add(grid);

// Viewport gizmos (sphere, cube, rounded cube) connected to OrbitControls
const sphereGizmoSettings = {
  backgroundColor: "#2b2b2b",
  backgroundOpacity: 0.35,
  backgroundHoverColor: "#3a3a3a",
  backgroundHoverOpacity: 0.55,
  lineWidth: 2,
  labelColor: "#ffffff",
  hoverColor: "#4bac84",
  xColor: "#ff3653",
  yColor: "#28d16f",
  zColor: "#2c7dff",
  nxColor: "#a32030",
  nyColor: "#1b7f42",
  nzColor: "#1a4fa8",
};

const buildSphereGizmoOptions = () => {
  const axis = (label: string, color: string) => ({
    //label,
    color,
    labelColor: sphereGizmoSettings.labelColor,
    line: true,
    hover: {
      color: sphereGizmoSettings.hoverColor,
      labelColor: sphereGizmoSettings.labelColor,
    },
  });

  return {
    container: document.body,
    type: "sphere",
    placement: "bottom-right",
    lineWidth: sphereGizmoSettings.lineWidth,
    background: {
      enabled: true,
      color: sphereGizmoSettings.backgroundColor,
      opacity: sphereGizmoSettings.backgroundOpacity,
      hover: {
        color: sphereGizmoSettings.backgroundHoverColor,
        opacity: sphereGizmoSettings.backgroundHoverOpacity,
      },
    },
    x: axis(t("gizmoPosXLabel"), sphereGizmoSettings.xColor),
    y: axis(t("gizmoPosYLabel"), sphereGizmoSettings.yColor),
    z: axis(t("gizmoPosZLabel"), sphereGizmoSettings.zColor),
    nx: axis(t("gizmoNegXLabel"), sphereGizmoSettings.nxColor),
    ny: axis(t("gizmoNegYLabel"), sphereGizmoSettings.nyColor),
    nz: axis(t("gizmoNegZLabel"), sphereGizmoSettings.nzColor),
  };
};

const gizmoSphere = new ViewportGizmo(camera, renderer, buildSphereGizmoOptions());
gizmoSphere.attachControls(controls);

const applySphereGizmoOptions = () => {
  gizmoSphere.set(buildSphereGizmoOptions());
  gizmoSphere.attachControls(controls);
  gizmoSphere.update();
};

const roundedCubeGizmoSettings = {
  faceColor: "#444444",
  edgeColor: "#555555",
  cornerColor: "#444444",
  hoverColor: "#4bac84",
  labelColor: "#ffffff",
};

const buildRoundedCubeGizmoOptions = () => {
  const faceConfig = {
    color: roundedCubeGizmoSettings.faceColor,
    labelColor: roundedCubeGizmoSettings.labelColor,
    hover: {
      color: roundedCubeGizmoSettings.hoverColor,
    },
  };
  const edgeConfig = {
    color: roundedCubeGizmoSettings.edgeColor,
    opacity: 1,
    hover: {
      color: roundedCubeGizmoSettings.hoverColor,
    },
  };
  const cornerConfig = {
    ...faceConfig,
    color: roundedCubeGizmoSettings.cornerColor,
    hover: {
      color: roundedCubeGizmoSettings.hoverColor,
    },
  };

  return {
    container: document.body,
    // NOTE: this library supports "rounded-cube" at runtime (even if typings only mention sphere/cube)
    type: "rounded-cube",
    placement: "bottom-center",
    corners: cornerConfig,
    edges: edgeConfig,
    right: { ...faceConfig,  },
    top: { ...faceConfig,  },
    front: { ...faceConfig, },
    left: { ...faceConfig,  },
    bottom: { ...faceConfig,  },
    back: { ...faceConfig,  },
  };
};

// Rounded cube = cube gizmo with increased corner/edge rounding
const gizmoRoundedCube = new ViewportGizmo(
  camera,
  renderer,
  buildRoundedCubeGizmoOptions() as never,
);
gizmoRoundedCube.attachControls(controls);

const applyRoundedCubeGizmoOptions = () => {
  gizmoRoundedCube.set(buildRoundedCubeGizmoOptions() as never);
  gizmoRoundedCube.attachControls(controls);
  gizmoRoundedCube.update();
};

gizmos.push(gizmoSphere, gizmoRoundedCube);

for (const gizmo of gizmos) {
  gizmo.update();
}

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

// const sphereGizmoFolder = gui.addFolder(t("sphereGizmo"));
// sphereGizmoFolder
//   .addColor(sphereGizmoSettings, "backgroundColor")
//   .name(t("gizmoBackground"))
//   .onChange(applySphereGizmoOptions);
// sphereGizmoFolder
//   .add(sphereGizmoSettings, "backgroundOpacity")
//   .name(t("gizmoBackgroundOpacity"))
//   .min(0)
//   .max(1)
//   .step(0.01)
//   .onChange(applySphereGizmoOptions);
// sphereGizmoFolder
//   .addColor(sphereGizmoSettings, "backgroundHoverColor")
//   .name(t("gizmoBackgroundHover"))
//   .onChange(applySphereGizmoOptions);
// sphereGizmoFolder
//   .add(sphereGizmoSettings, "backgroundHoverOpacity")
//   .name(t("gizmoBackgroundHoverOpacity"))
//   .min(0)
//   .max(1)
//   .step(0.01)
//   .onChange(applySphereGizmoOptions);
// sphereGizmoFolder
//   .add(sphereGizmoSettings, "lineWidth")
//   .name(t("gizmoLineWidth"))
//   .min(0)
//   .max(10)
//   .step(0.1)
//   .onChange(applySphereGizmoOptions);
// sphereGizmoFolder
//   .addColor(sphereGizmoSettings, "labelColor")
//   .name(t("gizmoLabelColor"))
//   .onChange(applySphereGizmoOptions);
// sphereGizmoFolder
//   .addColor(sphereGizmoSettings, "hoverColor")
//   .name(t("gizmoHoverColor"))
//   .onChange(applySphereGizmoOptions);

// const roundedCubeFolder = gui.addFolder(t("roundedCubeGizmo"));
// roundedCubeFolder
//   .addColor(roundedCubeGizmoSettings, "faceColor")
//   .name(t("gizmoFaceColor"))
//   .onChange(applyRoundedCubeGizmoOptions);
// roundedCubeFolder
//   .addColor(roundedCubeGizmoSettings, "edgeColor")
//   .name(t("gizmoEdgeColor"))
//   .onChange(applyRoundedCubeGizmoOptions);
// roundedCubeFolder
//   .addColor(roundedCubeGizmoSettings, "cornerColor")
//   .name(t("gizmoCornerColor"))
//   .onChange(applyRoundedCubeGizmoOptions);
// roundedCubeFolder
//   .addColor(roundedCubeGizmoSettings, "hoverColor")
//   .name(t("gizmoHoverColor"))
//   .onChange(applyRoundedCubeGizmoOptions);
// roundedCubeFolder
//   .addColor(roundedCubeGizmoSettings, "labelColor")
//   .name(t("gizmoLabelColor"))
//   .onChange(applyRoundedCubeGizmoOptions);

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

  for (const gizmo of gizmos) {
    gizmo.render();
  }

  if (controls.enabled) {
    controls.update();
  }
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);
