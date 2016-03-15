require(['log','axis','navinput'],
function(log, Axis, navinput){
    // a test scene
    var camera, scene, renderer, canvas;

    var clock = new THREE.Clock();
    var stopTime = 5;
    var mixer;
    var clipActions;
    
    // helper: make a cube
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

    // helper: Watch element resize, call callback
    function watchResize(element, callback) {
        var height = element.clientHeight;
        var width  = element.clientWidth;
        return setInterval(function() {     // add watcher
            if (element.clientHeight != height
                || element.clientWidth != width) {
                height = element.clientHeight;
                width  = element.clientWidth;
                callback();
                }
        }, 500);
    }

    function resetCameraView(){
        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    function init(){
        // canvas
        canvas = document.getElementById("3jscanvas");

        // renderer
        renderer = new THREE.WebGLRenderer({canvas:canvas});
        renderer.setClearColor(new THREE.Color(0x003366));

        // camera ( in the scene )
        var cameraRatio = 2 * 50 / window.innerWidth;
        camera = new THREE.PerspectiveCamera( 75, canvas.clientWidth / canvas.clientHeight, 1, 200 );
        camera.position.set( 10, 5, 10 );


        // reset view
        resetCameraView();

        // Watch canvas resize
        watchResize(canvas, resetCameraView);

        // navigation input & camara control
        navinput.decorate(canvas);  // canvas now has 'zoom', 'rotate' event
        camera.tgt = new THREE.Vector3();
        camera.lookAt(camera.tgt);

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
                -e.detail
            );
            camera.position.copy(v.add(camera.tgt));
            camera.lookAt(camera.tgt);
        });
        // pan
        canvas.addEventListener('pan', function(e){
            var camUp = new THREE.Vector3(0,1,0);
            var camRight = new THREE.Vector3(1,0,0);
            var q = new THREE.Quaternion();
            q.setFromRotationMatrix(camera.matrixWorld);

            camUp.applyQuaternion(q);
            camRight.applyQuaternion(q);

            var v = camera.tgt.clone().sub(camera.position);
            camera.position.add(camRight.multiplyScalar(e.detail.deltaX));
            camera.position.add(camUp.multiplyScalar(-e.detail.deltaY));
            camera.tgt.copy(v.add(camera.position));
        });
    }

    function animate(){
        requestAnimationFrame( animate);
        render();
    }

    // render loop: self reinstall every frame
    function render() {
        var delta = 10 * clock.getDelta();
        renderer.render( scene, camera );

        scene.traverse( function(obj){ 
            if( obj.hasOwnProperty("update")
               && typeof obj.update === "function" ){
                obj.update(); 
            }
        });

        if( mixer ) {
            // console.log( "updating mixer by " + delta );
            mixer.update( delta );
        }

        // stop play after stopTime secondes
        if (clock.elapsedTime < stopTime){
            // log(clock.elapsedTime);
        } else {
            clipActions.map(function(c){ c.stop(); });
        }
    }

    // load scene & start render
    var loader = new THREE.ObjectLoader();
    loader.load( "models/untitled.json", function ( loadedScene ) {

        scene = loadedScene;
        scene.fog = new THREE.Fog( 0xffffff, 2000, 10000 );

        mixer = new THREE.AnimationMixer( scene );
        clipActions = loadedScene.animations.map(function(a){
            var clip = mixer.clipAction(a);
            clip.play();
            return clip;
        });

        // a cube
        // scene.add( mkCube(new THREE.Vector3()));
        // Axis
        var origin = new THREE.Vector3();
        scene.add(new Axis(origin, new THREE.Vector3(10,0,0), 0,10,'Time','red',[10,5,1]));
        scene.add(new Axis(origin, new THREE.Vector3(0,10,0), 0,10,'y','green',[10,5,1]));
        scene.add(new Axis(origin, new THREE.Vector3(0,0,10), 0,10,'z','blue',[10,5,1]));
        
        init();
        scene.add( camera );
        animate();
    }, function(xhr){
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    });
});

