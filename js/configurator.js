// ==========================================
// 3D CONFIGURATOR LOGIC (Three.js)
// ==========================================

// 1. Setup Scene
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0f1115');
scene.fog = new THREE.Fog('#0f1115', 10, 50);

// 2. Setup Camera
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(8, 5, 8);

// 3. Setup Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// 4. Setup Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground

// 5. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
scene.add(dirLight);

const backLight = new THREE.DirectionalLight(0xaabbff, 0.3);
backLight.position.set(-5, 5, -5);
scene.add(backLight);

// 6. Ground plane
const groundGeo = new THREE.PlaneGeometry(50, 50);
const groundMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.1, metalness: 0.5 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const grid = new THREE.GridHelper(50, 50, 0x333333, 0x222222);
grid.position.y = 0.01;
scene.add(grid);

// 7. Build the Truck (Placeholder Geometry)
const truck = new THREE.Group();
scene.add(truck);

// Materials
const matCabin = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
const matBody = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.2 });
const matDark = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
const matGlass = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.8 });

// Chassis (Rama)
const chassisGeo = new THREE.BoxGeometry(1.2, 0.2, 6);
const chassis = new THREE.Mesh(chassisGeo, matDark);
chassis.position.y = 0.6;
chassis.castShadow = true;
truck.add(chassis);

// Cabin (Kabina)
const cabinGroup = new THREE.Group();
const cabinMainGeo = new THREE.BoxGeometry(1.8, 1.5, 1.5);
const cabinMain = new THREE.Mesh(cabinMainGeo, matCabin);
cabinMain.position.set(0, 1.45, 2);
cabinMain.castShadow = true;
cabinGroup.add(cabinMain);

// Windshield
const windowGeo = new THREE.BoxGeometry(1.6, 0.8, 0.1);
const windshield = new THREE.Mesh(windowGeo, matGlass);
windshield.position.set(0, 1.7, 2.76);
cabinGroup.add(windshield);

truck.add(cabinGroup);

// Refuse Body (Zabudowa) - This will change size
const bodyGeo = new THREE.BoxGeometry(1.9, 1.8, 3.5);
const refuseBody = new THREE.Mesh(bodyGeo, matBody);
refuseBody.position.set(0, 1.6, -0.6);
refuseBody.castShadow = true;
truck.add(refuseBody);

// Wheels
const createWheel = (x, z) => {
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
  const wheel = new THREE.Mesh(wheelGeo, matDark);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(x, 0.4, z);
  wheel.castShadow = true;
  truck.add(wheel);
};

createWheel(0.9, 2);
createWheel(-0.9, 2);
createWheel(0.9, -1.5);
createWheel(-0.9, -1.5);
createWheel(0.9, -2.5);
createWheel(-0.9, -2.5);

// 8. Animation Loop
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};
animate();

// 9. Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// 10. UI Logic
const btnCapacity = document.querySelectorAll('.btn-option');
const priceDisplay = document.getElementById('price-display');

const basePrices = {
  '12': 180000,
  '18': 240000,
  '22': 290000
};

btnCapacity.forEach(btn => {
  btn.addEventListener('click', () => {
    btnCapacity.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const cap = btn.dataset.cap;
    priceDisplay.textContent = basePrices[cap].toLocaleString('pl-PL') + ' PLN';

    // Animate scale
    const targetScaleZ = cap === '12' ? 0.8 : (cap === '22' ? 1.2 : 1.0);
    const targetPosZ = cap === '12' ? -0.2 : (cap === '22' ? -1.0 : -0.6);
    
    // Simple interpolation (can use GSAP in real app)
    const updateScale = () => {
      refuseBody.scale.z += (targetScaleZ - refuseBody.scale.z) * 0.1;
      refuseBody.position.z += (targetPosZ - refuseBody.position.z) * 0.1;
      if (Math.abs(refuseBody.scale.z - targetScaleZ) > 0.01) {
        requestAnimationFrame(updateScale);
      }
    };
    updateScale();
  });
});

const bodyColors = document.querySelectorAll('#body-colors .color-btn');
bodyColors.forEach(btn => {
  btn.addEventListener('click', () => {
    bodyColors.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    matBody.color.set(btn.dataset.color);
  });
});

const cabinColors = document.querySelectorAll('#cabin-colors .color-btn');
cabinColors.forEach(btn => {
  btn.addEventListener('click', () => {
    cabinColors.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    matCabin.color.set(btn.dataset.color);
  });
});
