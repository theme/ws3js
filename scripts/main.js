require(['log','axis','navi'],
function(log, Axis, Navi){
    // a test scene
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
    renderer.setClearColor( new THREE.Color(0x003366) );    // bg color

    // scene
    scene = new THREE.Scene();

    // camera ( in the scene )
    var cameraRatio = 2* 50/window.innerWidth;
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 200 );
    camera.position.set( 10, 5, 10 );
    camera.lookAt(scene.position); // (0,0,0)
    log("cameraRatio: ", cameraRatio);

    // scene objects parent
    
    // cube
    function mkCube(){

        var geometry = new THREE.BoxGeometry( 5, 6, 10 );
        var mesh = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent: true, opacity: 0.4 } );
        var cube = new THREE.Mesh( geometry, mesh );

        // edge helper
        var egh = new THREE.EdgesHelper( cube, 0x00ffff );
        egh.matrix = new THREE.Matrix4();

        cube.add(egh);

        cube.update = function(){
            cube.rotation.x += 0.01;
        };

        return cube;
    }
    var cube = mkCube();
    // scene.add( cube );

    // time line arraow
    function mkArrow(i,j,k, x,y,z, c){
        var material_line = new THREE.LineBasicMaterial({ color: c});
        var geometry_line = new THREE.Geometry();
        geometry_line.vertices.push(
            new THREE.Vector3(i,j,k),
            new THREE.Vector3(x,y,z)
        ); 
        var line = new THREE.Line(geometry_line, material_line);

        var arrow_g = new THREE.CylinderGeometry(0, 1, 5, 8, 8);
        var arrow_m = new THREE.Mesh(arrow_g, material_line);
        arrow_m.position.set(x,y,z);
        var line_unitv = new THREE.Vector3(x-i, y-j, z-k);
        arrow_m.quaternion.setFromUnitVectors(
            new THREE.Vector3(0,1,0), 
            line_unitv.normalize()
        )

        line.add(arrow_m);
        return line;
    }
    var origin = new THREE.Vector3();
    scene.add(new Axis(origin, new THREE.Vector3(10,0,0), 0,10,'Time','red',[10,5,1]));
    scene.add(new Axis(origin, new THREE.Vector3(0,10,0), 0,10,'y','green',[10,5,1]));
    scene.add(new Axis(origin, new THREE.Vector3(0,0,10), 0,10,'z','blue',[10,5,1]));

    // event point
    function mkEventPoint(time, place, story){
        // calculate x,y,z

        // make 
    }

    function onResize(element, callback) {  // delayed resize watcher
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

    onResize(canvas, function () {  // handle canvas resize
        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    });

    // listen navigator event
    Navi.decorate(canvas);
    canvas.addEventListener('zoom', function(e){
        var pos = camera.position;
        var u = pos.clone().normalize();
        camera.position.add(u.multiplyScalar(e.detail));
    });

    // drag in canvas
    canvas.cursor = {};

    function onDragCanvas(e){
        var cursor = canvas.cursor;
        cursor.deltaClientX = e.clientX - cursor.prevClientX;
        cursor.deltaClientY = e.clientY - cursor.prevClientY;
        cursor.prevClientX = e.clientX;
        cursor.prevClientY = e.clientY;
    }

    function onMouseDownCanvas(e){
        var cursor = canvas.cursor;
        cursor.prevClientX = e.clientX;
        cursor.prevClientY = e.clientY;

        // when mouse down, register drag event
        var onMouseMoveCanvas = function(e){
            onDragCanvas(e);
        };
        canvas.addEventListener("mousemove", onMouseMoveCanvas);

        // when mouse up / out, un-register drag event
        var onMouseOutCanvas = function(e){
            canvas.cursor.deltaClientX = 0;
            canvas.cursor.deltaClientY = 0;
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

    // render loop: self reinstall every frame
    function render() {
        requestAnimationFrame( render );
        renderer.render( scene, camera );

        scene.traverse( function(obj){ 
            if( obj.hasOwnProperty("update") && typeof obj.update === "function" ){
                obj.update(); 
            }
        } );

        // drag camera, according to canvas mouseDown-Move event
        if ( typeof canvas.cursor.deltaClientX === "number"){
            var pos = camera.position;

            camera.position.x = pos.x + canvas.cursor.deltaClientX;
            // log(camera.position.x);
        }
        // fps();
    }

    render();
});

