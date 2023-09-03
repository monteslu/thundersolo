const THREE = window.THREE;

let smokeParticles;
let smokeParticles2;
let gameLoc;
let camera, scene, renderer, clock, delta;

    
let wHeight = window.innerHeight;
let wWidth = window.innerWidth;
const textureLoader = new THREE.TextureLoader();
const villageSmokeTexture = textureLoader.load('/Smoke-Element2.png');
const villageSmokeMaterial = new THREE.MeshLambertMaterial({color: 0xFFFFFF, map: villageSmokeTexture, transparent: true});
const dungeonSmokeTexture = textureLoader.load('/Smoke-Element.png');
const dungeonSmokeMaterial = new THREE.MeshLambertMaterial({color: 0x444444, map: dungeonSmokeTexture, transparent: true});

function randomHeight() {
  return (Math.random() * wHeight) - (wHeight / 2);
}

function randomWidth() {
  return (Math.random() * wWidth) - (wWidth / 2);
}

function init() {
    if (renderer) {
      // cleanup?
    }
    let smokeGeo;
    if (wWidth > wHeight) {
      smokeGeo = new THREE.PlaneGeometry(wWidth * 0.3, wWidth * 0.3);
    } else {
      smokeGeo = new THREE.PlaneGeometry(wHeight * 0.3, wHeight * 0.3);
    }
    clock = new THREE.Clock();
    const canvas = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer({alpha: true, canvas});
    renderer.setSize( wWidth, wHeight );

    scene = new THREE.Scene();
 
    camera = new THREE.PerspectiveCamera( 75, wWidth / wHeight, 1, 10000 );
    camera.position.z = 1000;
    scene.add( camera );
 
    const light = new THREE.DirectionalLight(0xffffff,0.8);
    light.position.set(-1,0,1);
    scene.add(light);
  

    smokeParticles = [];
    smokeParticles2 = [];

    for (let p = 0; p < 75; p++) {
      const particle = new THREE.Mesh(smokeGeo, villageSmokeMaterial);
      particle.position.set(randomWidth(), randomHeight(),Math.random()*1000-100);
      particle.rotation.z = Math.random() * 360;
      if (gameLoc === 'village') {
        scene.add(particle);
      }
      smokeParticles.push(particle);
    }

    for (let p = 0; p < 150; p++) {
      const particle = new THREE.Mesh(smokeGeo, dungeonSmokeMaterial);
      particle.position.set(randomWidth(), randomHeight(), Math.random()*1000-100);
      particle.rotation.z = Math.random() * 360;
      if (gameLoc === 'dungeon') {
        scene.add(particle);
      }
      smokeParticles2.push(particle);
    }
 
}
 
function animate() {
  if (renderer && scene && camera && clock) {
    delta = clock.getDelta();
    evolveSmoke();
    renderer.render( scene, camera );
    // console.log('animate');
  }
  
  // console.log('animate');
  requestAnimationFrame( animate );
}
 
function evolveSmoke() {
  let sp = smokeParticles.length;
  while(sp--) {
    smokeParticles[sp].rotation.z += (delta * 0.08);
  }
  let sp2 = smokeParticles.length;
  while(sp2--) {
    smokeParticles2[sp2].rotation.z += (delta * 0.6);
  }
}

function addDungeonClouds(skipBG) {
  if (!skipBG) {
    document.body.style.backgroundColor = '#aa0000';
  }
  smokeParticles.forEach(particle => {
    scene.remove(particle);
  });
  smokeParticles2.forEach(particle => {
    scene.add(particle);
  });
}

function addVillageClouds(skipBG) {
  if (!skipBG) {
    document.body.style.backgroundColor = '#87CEEB';
  }
  smokeParticles2.forEach(particle => {
    scene.remove(particle);
  });
  smokeParticles.forEach(particle => {
    scene.add(particle);
  });
}

window.addEventListener("resize", (event) => {
  wHeight = window.innerHeight;
  wWidth = window.innerWidth;
  // console.log(event, window.innerWidth, window.innerHeight );
  init();
  // console.log('done initting', gameLoc);
  if (gameLoc === 'village') {
    // console.log('village', smokeParticles.length);
    addVillageClouds(true);
  } else if (gameLoc === 'dungeon') {
    // console.log('dungeon', smokeParticles2.length);
    addDungeonClouds(true);
  }
});


init();
animate();

export function toggleLoc(loc, skipBG = false) {
  gameLoc = loc;
  init();
  // console.log('done initting', gameLoc);
  if (gameLoc === 'village') {
    // console.log('village', smokeParticles.length);
    addVillageClouds(skipBG);
  } else if (gameLoc === 'dungeon') {
    // console.log('dungeon', smokeParticles2.length);
    addDungeonClouds(skipBG);
  }
}
