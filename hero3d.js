import * as THREE from 'three';

/**
 * Checks if WebGL is supported by the current browser.
 */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

/**
 * Generates a procedural high-dynamic-range studio environment map.
 * Uses softbox gradients (electric cyan key, warm amber rim, white overhead strip)
 * to give metallic and crystalline surfaces genuine specular reflections and depth.
 */
function createStudioEnvMap(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep cosmic slate gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, '#020617');
  bgGrad.addColorStop(0.5, '#071329');
  bgGrad.addColorStop(1, '#030816');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Key Studio Softbox: Electric Cyan & Crisp Pure White
  const keyGrad = ctx.createRadialGradient(740, 150, 15, 740, 150, 240);
  keyGrad.addColorStop(0, '#ffffff');
  keyGrad.addColorStop(0.22, '#93c5fd');
  keyGrad.addColorStop(0.55, '#0284c7');
  keyGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
  ctx.fillStyle = keyGrad;
  ctx.beginPath();
  ctx.arc(740, 150, 240, 0, Math.PI * 2);
  ctx.fill();

  // Warm Amber / Champagne Gold Rim Softbox (opposite angle)
  const rimGrad = ctx.createRadialGradient(240, 360, 15, 240, 360, 260);
  rimGrad.addColorStop(0, '#fffbeb');
  rimGrad.addColorStop(0.25, '#fbbf24');
  rimGrad.addColorStop(0.6, '#b45309');
  rimGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(240, 360, 260, 0, Math.PI * 2);
  ctx.fill();

  // Top overhead glint strip for crisp rim highlights
  const topGrad = ctx.createLinearGradient(300, 0, 700, 0);
  topGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  topGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
  topGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(300, 35, 400, 30);

  const canvasTexture = new THREE.CanvasTexture(canvas);
  canvasTexture.mapping = THREE.EquirectangularReflectionMapping;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const renderTarget = pmremGenerator.fromEquirectangular(canvasTexture);
  pmremGenerator.dispose();
  canvasTexture.dispose();

  return renderTarget.texture;
}

/**
 * Initializes the premium interactive 3D hero visualization.
 * @param {string|HTMLElement} container - The container element or selector.
 */
export function initHero3D(container) {
  const containerEl =
    typeof container === 'string'
      ? document.querySelector(container)
      : container;

  if (!containerEl) {
    return;
  }

  // Graceful fallback for non-WebGL environments
  if (!isWebGLAvailable()) {
    containerEl.classList.add('hero-3d-fallback');
    containerEl.innerHTML = `
      <div class="fallback-glow"></div>
      <div class="fallback-badge">Interactive 3D Visualizer</div>
    `;
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Scene setup
  const scene = new THREE.Scene();

  const width = containerEl.clientWidth || 450;
  const height = containerEl.clientHeight || 490;

  // Perspective camera with calibrated focal distance (dynamic distance for mobile)
  const isMobileInitial = width < 520;
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(0, 0, isMobileInitial ? 7.6 : 6.7);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    console.warn('WebGLRenderer initialization failed, activating fallback:', err);
    containerEl.classList.add('hero-3d-fallback');
    containerEl.innerHTML = `
      <div class="fallback-glow"></div>
      <div class="fallback-badge">Interactive 3D Visualizer</div>
    `;
    return;
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // Transparent background
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  containerEl.appendChild(renderer.domElement);

  // Attach procedural studio environment map for photorealistic reflections
  try {
    const envTexture = createStudioEnvMap(renderer);
    scene.environment = envTexture;
  } catch (e) {
    console.warn('Could not generate studio env map:', e);
  }

  // Root group for all rotatable elements
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // 1. MAIN CENTERPIECE: HIGH-GLOSS CYBERNETIC TITANIUM TORUS KNOT
  // Deep chiaroscuro: midnight titanium base with brilliant specular highlights
  const knotGroup = new THREE.Group();
  rootGroup.add(knotGroup);

  const knotGeom = new THREE.TorusKnotGeometry(1.05, 0.28, 220, 32, 2, 3);

  const knotMat = new THREE.MeshPhysicalMaterial({
    color: 0x051329,
    roughness: 0.08,
    metalness: 0.96,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 1.0,
    iridescence: 0.35,
    iridescenceIOR: 1.35,
    sheen: 0.4,
    sheenColor: 0x38bdf8,
  });
  const knotMesh = new THREE.Mesh(knotGeom, knotMat);
  knotGroup.add(knotMesh);

  // Elegant sparse holographic latitude rings around the knot instead of dense noisy wireframe
  const haloAccentGeom = new THREE.TorusGeometry(1.22, 0.008, 16, 100);
  const haloAccentMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.65,
  });
  const haloAccent1 = new THREE.Mesh(haloAccentGeom, haloAccentMat);
  haloAccent1.rotation.x = Math.PI / 4;
  knotGroup.add(haloAccent1);

  const haloAccent2 = new THREE.Mesh(haloAccentGeom, haloAccentMat);
  haloAccent2.rotation.y = Math.PI / 3;
  knotGroup.add(haloAccent2);

  // 2. INNER LUMINOUS CRYSTAL CORE (Faceted Icosahedron with individual sparkling faces)
  const coreGroup = new THREE.Group();
  rootGroup.add(coreGroup);

  const heartGeom = new THREE.IcosahedronGeometry(0.48, 0);
  const heartMat = new THREE.MeshPhysicalMaterial({
    color: 0x0369a1,
    emissive: 0x0284c7,
    emissiveIntensity: 0.55,
    roughness: 0.1,
    metalness: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    flatShading: true, // Crucial: gives individual glistening 3D facets
  });
  const heartMesh = new THREE.Mesh(heartGeom, heartMat);
  coreGroup.add(heartMesh);

  // Delicate glowing wireframe frame for the crystal core
  const heartWireGeom = new THREE.WireframeGeometry(heartGeom);
  const heartWireMat = new THREE.LineBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.85,
  });
  const heartWire = new THREE.LineSegments(heartWireGeom, heartWireMat);
  heartWire.scale.set(1.04, 1.04, 1.04);
  coreGroup.add(heartWire);

  // Internal pulsing point light casting illumination through the torus loops
  const coreLight = new THREE.PointLight(0x38bdf8, 3.5, 7);
  coreLight.position.set(0, 0, 0);
  coreGroup.add(coreLight);

  // 3. PRECISION ORBITAL ASTROLABE GIMBAL RINGS
  const ringsGroup = new THREE.Group();
  rootGroup.add(ringsGroup);

  // Ring 1: Equatorial Midnight Titanium Gimbal
  const ring1Geom = new THREE.TorusGeometry(1.85, 0.026, 24, 128);
  const ring1Mat = new THREE.MeshPhysicalMaterial({
    color: 0x0f2b48,
    metalness: 0.95,
    roughness: 0.08,
    clearcoat: 1.0,
    emissive: 0x0369a1,
    emissiveIntensity: 0.25,
  });
  const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
  ringsGroup.add(ring1);

  // 4 Sleek sensor nodes on Ring 1
  const nodeGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.09, 16);
  const nodeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.98,
    roughness: 0.1,
  });
  const nodeLedMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const ledGeom = new THREE.SphereGeometry(0.022, 12, 12);

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const nodeHolder = new THREE.Group();
    nodeHolder.position.set(1.85 * Math.cos(angle), 1.85 * Math.sin(angle), 0);
    nodeHolder.rotation.z = angle + Math.PI / 2;

    const nodeBody = new THREE.Mesh(nodeGeom, nodeMat);
    const nodeLed = new THREE.Mesh(ledGeom, nodeLedMat);
    nodeLed.position.set(0, 0.05, 0);

    nodeHolder.add(nodeBody);
    nodeHolder.add(nodeLed);
    ring1.add(nodeHolder);
  }

  // Ring 2: Polar Champagne Gold Alloy Ring (tilted at 52°)
  const ring2Geom = new THREE.TorusGeometry(1.68, 0.022, 24, 128);
  const ring2Mat = new THREE.MeshStandardMaterial({
    color: 0xd4b483,
    metalness: 0.94,
    roughness: 0.14,
    emissive: 0x78350f,
    emissiveIntensity: 0.22,
  });
  const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
  ring2.rotation.x = Math.PI / 3.2;
  ring2.rotation.y = Math.PI / 6;
  ringsGroup.add(ring2);

  // Ring 3: Inner Cobalt Blue Alloy Gimbal (tilted at 80°)
  const ring3Geom = new THREE.TorusGeometry(1.48, 0.018, 24, 128);
  const ring3Mat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    metalness: 0.92,
    roughness: 0.12,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.28,
  });
  const ring3 = new THREE.Mesh(ring3Geom, ring3Mat);
  ring3.rotation.y = (Math.PI * 2) / 3.4;
  ringsGroup.add(ring3);

  // 4. FLOATING OCCLUSION SHADOW (Anchors the 3D object in space)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  const sGrad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
  sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  sGrad.addColorStop(0.35, 'rgba(2, 6, 23, 0.25)');
  sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 128, 128);

  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3.8), shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -2.15;
  scene.add(shadowMesh);

  // 5. AMBIENT DATA PARTICLES (Tasteful, restrained constellation)
  const particleCount = 80;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const radius = 2.2 + Math.random() * 2.0;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePositions[i * 3 + 2] = radius * Math.cos(phi);
  }

  const particleGeom = new THREE.BufferGeometry();
  particleGeom.setAttribute(
    'position',
    new THREE.BufferAttribute(particlePositions, 3)
  );

  const particleMat = new THREE.PointsMaterial({
    color: 0x7dd3fc,
    size: 0.045,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });
  const particleSystem = new THREE.Points(particleGeom, particleMat);
  scene.add(particleSystem);

  // 6. CINEMATIC MULTI-POINT LIGHTING WITH REAL DEPTH (Chiaroscuro)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambientLight);

  // Specular key light from upper-right
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
  keyLight.position.set(5, 7, 5);
  scene.add(keyLight);

  // Electric cyan fill light from left
  const fillLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
  fillLight.position.set(-6, 2, 4);
  scene.add(fillLight);

  // Warm amber rim backlight from behind
  const rimLight = new THREE.DirectionalLight(0xf59e0b, 3.2);
  rimLight.position.set(-4, -5, -4);
  scene.add(rimLight);

  // Dynamic light tracking the cursor across the reflective metallic curves
  const cursorLight = new THREE.PointLight(0x38bdf8, 3.6, 14);
  cursorLight.position.set(3, 3, 4);
  scene.add(cursorLight);

  // 7. INTERACTION SYSTEM: PARALLAX + FREE DRAG ROTATION
  let isDragging = false;
  let prevPointerX = 0;
  let prevPointerY = 0;
  let dragVelocityX = 0;
  let dragVelocityY = 0;

  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let isInteracting = false;

  function fadeHint() {
    if (!isInteracting) {
      isInteracting = true;
      const hint = containerEl.querySelector('.hero-3d-hint');
      if (hint) {
        hint.style.opacity = '0';
      }
    }
  }

  // Pointer move handler (updates hover parallax & cursor light position)
  function handlePointerMove(clientX, clientY) {
    const rect = containerEl.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    targetTiltY = x * 0.42;
    targetTiltX = -y * 0.42;

    // Glide cursor light to cast moving specular glints across metallic curves
    cursorLight.position.x = x * 4.2;
    cursorLight.position.y = -y * 4.2;
  }

  // Interactive Drag & Parallax Event Listeners
  containerEl.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;
    dragVelocityX = 0;
    dragVelocityY = 0;
    containerEl.style.cursor = 'grabbing';
    fadeHint();
  });

  window.addEventListener('pointermove', (e) => {
    const rect = containerEl.getBoundingClientRect();
    const inRange =
      e.clientY >= rect.top - 150 &&
      e.clientY <= rect.bottom + 150 &&
      e.clientX >= rect.left - 150 &&
      e.clientX <= rect.right + 150;

    if (inRange) {
      handlePointerMove(e.clientX, e.clientY);
    }

    if (isDragging) {
      const deltaX = e.clientX - prevPointerX;
      const deltaY = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      dragVelocityX = deltaX * 0.0055;
      dragVelocityY = deltaY * 0.0055;

      rootGroup.rotation.y += dragVelocityX;
      rootGroup.rotation.x += dragVelocityY;
    }
  });

  window.addEventListener('pointerup', () => {
    if (isDragging) {
      isDragging = false;
      containerEl.style.cursor = 'grab';
    }
  });

  // Touch listener (passive so vertical scrolling is uninterrupted)
  containerEl.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches && e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  // Resize handler using ResizeObserver
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const newWidth = entry.contentRect.width || 320;
      const newHeight = entry.contentRect.height || 380;

      camera.aspect = newWidth / newHeight;
      camera.position.z = newWidth < 520 ? 7.6 : 6.7;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  });
  resizeObserver.observe(containerEl);

  // IntersectionObserver to pause loop when off-screen
  let isVisible = true;
  let animationFrameId = null;

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          clock.start();
          animate();
        }
      });
    },
    { threshold: 0.05 }
  );
  intersectionObserver.observe(containerEl);

  const clock = new THREE.Clock();

  // 8. ANIMATION LOOP
  function animate() {
    if (!isVisible) {
      animationFrameId = null;
      return;
    }

    animationFrameId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      // Smooth lerp damping for pointer parallax
      currentTiltX += (targetTiltX - currentTiltX) * 0.06;
      currentTiltY += (targetTiltY - currentTiltY) * 0.06;

      // Inertial damping from user drag
      if (!isDragging) {
        dragVelocityX *= 0.94;
        dragVelocityY *= 0.94;
        rootGroup.rotation.y += dragVelocityX;
        rootGroup.rotation.x += dragVelocityY;
      }

      // Smooth multi-axis rotation for the Torus Knot centerpiece
      knotGroup.rotation.x += delta * 0.32;
      knotGroup.rotation.y += delta * 0.42;
      knotGroup.rotation.z += delta * 0.18;

      // Floating bobbing motion on Y
      rootGroup.position.y = Math.sin(elapsedTime * 0.9) * 0.08;

      // Parallax tilt application
      rootGroup.rotation.x = currentTiltX + Math.sin(elapsedTime * 0.3) * 0.04;
      rootGroup.rotation.z = currentTiltY + Math.cos(elapsedTime * 0.25) * 0.03;

      // Independent counter-rotational velocities for metallic gimbal rings
      ring1.rotation.z += delta * 0.28;
      ring2.rotation.y -= delta * 0.32;
      ring2.rotation.z += delta * 0.18;
      ring3.rotation.x += delta * 0.4;
      ring3.rotation.y += delta * 0.22;

      // Faceted crystal core: counter-rotates and sparkles
      coreGroup.rotation.x -= delta * 0.55;
      coreGroup.rotation.y += delta * 0.65;
      const heartPulse = 1.0 + Math.sin(elapsedTime * 2.6) * 0.08;
      heartMesh.scale.set(heartPulse, heartPulse, heartPulse);
      coreLight.intensity = 2.8 + Math.sin(elapsedTime * 3.0) * 0.9;

      // Ambient particle constellation rotation
      particleSystem.rotation.y = -elapsedTime * 0.04;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.1) * 0.03;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Clean-up hook
  return function destroy() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}
