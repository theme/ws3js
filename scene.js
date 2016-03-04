// a test scene

log = console.log.bind(console);    // logger

var camera, scene, renderer, canvas, callbackID;

// canvas
function mkCanvas( elid ) {
    if (typeof elid === "string"){
        log( "render tgt: ", elid);
        canvas = document.getElementById(elid);
    }
    else {
        log( "warn : render tgt not found : ", elid);
        canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
    }
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
};
mkCanvas("3jscanvas");

// renderer
renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
renderer.setClearColor( new THREE.Color(0x003366) ); // ±³¾°É«¤òÖ¸¶¨

// scene
scene = new THREE.Scene();

// camera ( in the scene )
var cameraRatio = 2* 50/window.innerWidth;
camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 200 );
camera.position.set( 10, 5, 10 );
camera.lookAt(scene.position); // (0,0,0)
log("cameraRatio: ", cameraRatio);

// cube
var geometry = new THREE.BoxGeometry( 5, 6, 10 );
var mesh = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent: true, opacity: 0.4 } );
var cube = new THREE.Mesh( geometry, mesh );
scene.add( cube );
// edge helper
var egh = new THREE.EdgesHelper( cube, 0x00ffff );
egh.material.linewidth = 2;
scene.add( egh );

// render loop: self reinstall every frame
function render() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
    cube.rotation.x += 0.01;

    // fps();
}

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

// drag
var onMouseDownCanvas = function(e){

    // when mouse down, register drag event
    var onMouseMoveCanvas = function(e){
        log("drag!");
    };
    canvas.addEventListener("mousemove", onMouseMoveCanvas);

    // when mouse up / out, un-register drag event
    var onMouseOutCanvas = function(e){
        log("mouse out!");
        canvas.removeEventListener("mousemove", onMouseMoveCanvas);
        canvas.removeEventListener("mouseout", onMouseOutCanvas);
        canvas.removeEventListener("mouseup", onMouseOutCanvas);
    };
    canvas.addEventListener("mouseup", onMouseOutCanvas );
    canvas.addEventListener("mouseout", onMouseOutCanvas);
}
canvas.addEventListener("mousedown", onMouseDownCanvas);

// log fps
var msec = 0;
var frame = 0;
function fps() {
    frame += 1;
    if (Date.now() - msec > 1000){ // new seconds
        log("fps: " + frame);
        frame = 0;
        msec = Date.now();
    }
}

render();
