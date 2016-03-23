(function() {
  require(['log', 'axis', 'navinput'], function(log, Axis, navinput) {
    var animate, camera, canvas, cch, ccw, clock, init, loader, mixer, mixerActions, render, renderer, resetCameraView, scene, stopTime, watchResize;
    canvas = null;
    scene = null;
    camera = null;
    renderer = null;
    clock = new THREE.Clock;
    stopTime = 5;
    mixer = null;
    mixerActions = [];
    watchResize = function(el, callback) {
      var h, w;
      h = el.clientHeight;
      w = el.clientWidth;
      return setInterval(function() {
        if (el.clientHeight !== h || el.clientWidth !== w) {
          h = el.clientHeight;
          w = el.clientWidth;
          callback();
        }
      }, 500);
    };
    resetCameraView = function() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
      return camera.update();
    };
    ccw = function() {
      return canvas.clientWidth;
    };
    cch = function() {
      return canvas.clientHeight;
    };
    init = function() {
      var oCam, pCam;
      canvas = document.getElementById("3jscanvas");
      renderer = new THREE.WebGLRenderer({
        canvas: canvas
      });
      renderer.setClearColor(new THREE.Color(0x003366));
      pCam = new THREE.PerspectiveCamera(75, ccw() / cch(), 1, 100);
      pCam.update = function() {
        pCam.aspect = ccw() / cch();
        return pCam.updateProjectionMatrix();
      };
      oCam = new THREE.OrthographicCamera(ccw() / -2, ccw() / 2, cch() / 2, cch() / -2, 1, 100);
      oCam.update = function() {
        oCam.zoom = 5000 / ccw();
        return oCam.updateProjectionMatrix();
      };
      camera = pCam;
      camera.position.set(20, 15, 0);
      resetCameraView();
      watchResize(canvas, resetCameraView);
      navinput.decorate(canvas);
      camera.tgt = new THREE.Vector3;
      camera.lookAt(camera.tgt);
      canvas.addEventListener('zoom', function(e) {
        var newpos, pos, u, v;
        pos = camera.position.clone();
        u = pos.clone().sub(camera.tgt).normalize();
        newpos = pos.add(u.multiplyScalar(e.detail));
        v = newpos.clone().sub(camera.tgt);
        if (v.length() > 0.1) {
          return camera.position.copy(newpos);
        }
      });
      canvas.addEventListener('rotate', function(e) {
        var axis;
        axis = camera.position.clone().sub(camera.tgt);
        axis.applyAxisAngle(new THREE.Vector3(0, 1, 0), -e.detail);
        camera.position.copy(axis.add(camera.tgt));
        return camera.lookAt(camera.tgt);
      });
      return canvas.addEventListener('pan', function(e) {
        var camRight, camUp, q, v;
        camUp = new THREE.Vector3(0, 1, 0);
        camRight = new THREE.Vector3(1, 0, 0);
        q = new THREE.Quaternion;
        q.setFromRotationMatrix(camera.matrixWorld);
        camUp.applyQuaternion(q);
        camRight.applyQuaternion(q);
        v = camera.tgt.clone().sub(camera.position);
        camera.position.add(camRight.multiplyScalar(e.detail.deltaX));
        camera.position.add(camUp.multiplyScalar(-e.detail.deltaY));
        return camera.tgt.copy(v.add(camera.position));
      });
    };
    animate = function() {
      requestAnimationFrame(animate);
      return render();
    };
    render = function() {
      var c, delta, i, len, results;
      delta = clock.getDelta();
      renderer.render(scene, camera);
      scene.traverse(function(obj) {
        return typeof obj.update === "function" ? obj.update() : void 0;
      });
      mixer.update(delta);
      if (clock.elapsedTime > stopTime) {
        results = [];
        for (i = 0, len = mixerActions.length; i < len; i++) {
          c = mixerActions[i];
          results.push((function(c) {
            return c.stop();
          })(c));
        }
        return results;
      }
    };
    loader = new THREE.ObjectLoader;
    return loader.load("models/untitled.json", function(loadedScene) {
      var V3, a, cube, fn, geometry, i, len, material, o, ref;
      scene = loadedScene;
      scene.fog = new THREE.Fog(0xffffff, 2000, 10000);
      mixer = new THREE.AnimationMixer(scene);
      ref = loadedScene.animations;
      fn = function(a) {
        return mixerActions.push(mixer.clipAction(a).play());
      };
      for (i = 0, len = ref.length; i < len; i++) {
        a = ref[i];
        fn(a);
      }
      geometry = new THREE.BoxGeometry(1, 1, 1);
      material = new THREE.MeshBasicMaterial({
        color: 0x00ff00
      });
      cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      V3 = THREE.Vector3;
      o = new THREE.Vector3;
      scene.add(new Axis(o, new V3(10, 0, 0), 0, 10, 'Time', 'red', [10, 5, 1]));
      scene.add(new Axis(o, new V3(0, 10, 0), 0, 10, 'y', 'green', [10, 5, 1]));
      scene.add(new Axis(o, new V3(0, 0, 10), 0, 10, 'z', 'blue', [10, 5, 1]));
      init();
      return animate();
    }, function(xhr) {
      return console.log(xhr.loaded / xhr.total * 100 + '% loaded');
    });
  });

}).call(this);
