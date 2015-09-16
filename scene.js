var canvas = document.getElementById("canvas");
console.log(canvas);

var renderer = new THREE.WebGLRenderer({canvas: canvas});
canvas.width  = canvas.clientWidth;
canvas.height = canvas.clientHeight;
renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);

var scene = new THREE.Scene();

// var renderer = new THREE.WebGLRenderer();
//     renderer.setSize( window.innerWidth, window.innerHeight );
//     document.body.appendChild( renderer.domElement );
    // renderer.setClearColor( new THREE.Color(0x003366) ); // ±³¾°É«¤òÖ¸¶¨

var cameraRatio = 2* 50/window.innerWidth;
    console.log(cameraRatio);
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 200 );
    camera.position.set( 10, 5, 10 );

// var tgt = new THREE.Vector3(0,0,0);
//     tgt.sub(camera.position);
//     camera.lookAt(tgt);
    // same to :
    camera.lookAt(scene.position); // TODO : what is object's local position ?

// cube
var geometry = new THREE.BoxGeometry( 5, 6, 10 );
// var mesh = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
var mesh = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent: true, opacity: 0.4 } );
var cube = new THREE.Mesh( geometry, mesh );
scene.add( cube );

// wrieframe cube
// http://stackoverflow.com/questions/20153705/three-js-wireframe-material-all-polygons-vs-just-edges
// var cubehelper = new THREE.BoxHelper( cube );
// cubehelper.material.color.set( 0x00ff00 );
// scene.add( cubehelper);

// edge helper
var egh = new THREE.EdgesHelper( cube, 0x00ffff );
egh.material.linewidth = 2;
scene.add( egh );

// log fps
var msec = 0;
var frame = 0;
function fps() {
    frame += 1;
    if (Date.now() - msec > 1000){ // new seconds
        console.log("fps " + frame);
        frame = 0;
        msec = Date.now();
    }
}

// render loop
function render() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
    cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    // fps();
}

var text2 = document.createElement('div');
text2.style.position = 'absolute';
//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
text2.style.width = 100;
text2.style.height = 100;
text2.style.color = "white";
text2.innerHTML = "hi there!";
text2.style.top = 200 + 'px';
text2.style.left = 200 + 'px';
document.body.appendChild(text2);

// add reaction to window resize
// window.addEventListener('resize', function () {
//   renderer.setSize( window.innerWidth, window.innerHeight );
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
// });

// better way for canvas in HTML
function onResize(element, callback) {
  var height = element.clientHeight;
  var width  = element.clientWidth;

  return setInterval(function() {
	  if (element.clientHeight != height || element.clientWidth != width) {
		height = element.clientHeight;
		width  = element.clientWidth;
		callback();
	  }
  }, 500);
}

onResize(canvas, function () {
  canvas.width  = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
});

render();
