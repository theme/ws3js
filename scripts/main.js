require(['log','axis','navinput'],
function(log, Axis, navinput){
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
    function mkCube(pos, s, c){
        var color = ( c !== undefined ) ? c : 0x00ff00;
        var size = ( s !== undefined ) ? s : 1;
        var geometry = new THREE.BoxGeometry( size*5, size*6, size*10 );
        var mesh = new THREE.MeshBasicMaterial(
            { color: color,
                transparent: true,
                opacity: 0.4
            });
        var cube = new THREE.Mesh( geometry, mesh );
        cube.position.copy(pos);

        // edge helper
        var egh = new THREE.EdgesHelper( cube, 0x00ffff );
        egh.matrix = new THREE.Matrix4();

        cube.add(egh);

        cube.update = function(){
            cube.rotation.x += 0.01;
        };

        return cube;
    }
    var cube = mkCube(new THREE.Vector3());
    scene.add( cube );

    // Axis
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

    // navigation input & response
    navinput.decorate(canvas);  // canvas now has 'zoom', 'rotate' event
    camera.tgt = new THREE.Vector3();

    // zoom
    canvas.addEventListener('zoom', function(e){
        var v = camera.position.clone().sub(camera.tgt);
        var u = v.clone().normalize();
        var pos = camera.position.clone();
        pos.add(u.multiplyScalar(e.detail));
        v = pos.clone().sub(camera.tgt);
        if( v.length() > 0.1 )
            camera.position.copy(pos);
    });
    // rotate
    canvas.addEventListener('rotate', function(e){
        var v = camera.position.clone().sub(camera.tgt);
        v.applyAxisAngle(
            new THREE.Vector3(0,1,0),
            e.detail
        );
        camera.position.copy(v.add(camera.tgt));
        camera.lookAt(camera.tgt);
        log('rotate');
    });
    // pan
    var tgtCube = mkCube(new THREE.Vector3, 0.1, 'red');
    scene.add(tgtCube);

    canvas.addEventListener('panstop', function(e){

    });

    canvas.addEventListener('pan', function(e){
        var camUp = new THREE.Vector3(0,1,0);
        var camRight = new THREE.Vector3(1,0,0);
        var q = new THREE.Quaternion();
        q.setFromRotationMatrix(camera.matrixWorld);

        camUp.applyQuaternion(q);
        camRight.applyQuaternion(q);

        var v = camera.tgt.clone().sub(camera.position);
        camera.position.add(camRight.multiplyScalar(e.detail.deltaX));
        camera.tgt.copy(v.add(camera.position));
        tgtCube.position.copy(camera.tgt);
    });

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

        // fps();
    }

    render();
});

