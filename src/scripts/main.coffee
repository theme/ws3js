require ['log','axis','navinput'], (log, Axis, navinput) ->
    canvas = null
    scene = null
    camera = null
    renderer = null
    clock = new THREE.Clock
    stopTime = 5
    mixer = null    # animation player
    mixerActions = []   # animation actions list

    # test el size after 500 ms, callback if size changed
    watchResize = (el, callback) ->
        h = el.clientHeight # remember value of now
        w = el.clientWidth
        return setInterval( -> # check value after 500ms
            if (el.clientHeight != h || el.clientWidth != w)
                h = el.clientHeight
                w = el.clientWidth
                callback()
                return
        , 500)

    resetCameraView = ->
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        renderer.setViewport(0,0,canvas.clientWidth, canvas.clientHeight)
        camera.update()

    # helper
    ccw = -> canvas.clientWidth
    cch = -> canvas.clientHeight

    init = ->
        # canvas
        canvas = document.getElementById("3jscanvas")

        # renderer
        renderer = new THREE.WebGLRenderer {canvas:canvas}
        renderer.setClearColor new THREE.Color 0x003366

        # camera
        # Perspective
        pCam = new THREE.PerspectiveCamera 75, ccw()/cch(),1,100
        pCam.update = ->
            pCam.aspect = ccw()/cch()
            pCam.updateProjectionMatrix()

        # Orthographic
        oCam = new THREE.OrthographicCamera ccw()/-2, ccw()/2, cch()/2, cch()/-2, 1, 100
        oCam.update = ->
            oCam.zoom = 5000 / ccw()
            oCam.updateProjectionMatrix()

        camera = pCam
        camera.position.set 20,15,0

        # reset view
        resetCameraView()

        # Watch vanvas resize
        watchResize canvas, resetCameraView

        # navigation input & camera control
        navinput.decorate canvas # cavas now has 'zoom','rotate' ev
        camera.tgt = new THREE.Vector3
        camera.lookAt camera.tgt

        # move camera close to tgt
        canvas.addEventListener 'zoom', (e) ->
            pos = camera.position.clone()
            u = pos.clone().sub(camera.tgt).normalize()
            newpos = pos.add u.multiplyScalar e.detail
            v = newpos.clone().sub camera.tgt
            camera.position.copy newpos if v.length() > 0.1

        # rotate
        canvas.addEventListener 'rotate', (e) ->
            axis = camera.position.clone().sub camera.tgt
            axis.applyAxisAngle(
                new THREE.Vector3(0,1,0),
                -e.detail
            )
            camera.position.copy axis.add camera.tgt
            camera.lookAt camera.tgt

        # pan
        canvas.addEventListener 'pan', (e) ->
            camUp = new THREE.Vector3 0,1,0
            camRight = new THREE.Vector3 1,0,0
            q = new THREE.Quaternion
            q.setFromRotationMatrix camera.matrixWorld
            camUp.applyQuaternion q
            camRight.applyQuaternion q

            v = camera.tgt.clone().sub camera.position
            camera.position.add camRight.multiplyScalar e.detail.deltaX
            camera.position.add camUp.multiplyScalar -e.detail.deltaY
            camera.tgt.copy v.add camera.position

    animate = ->
        requestAnimationFrame animate
        render()
        
    render = ->
        delta = clock.getDelta()
        renderer.render(scene, camera)
        scene.traverse (obj) -> obj.update?()

        mixer.update delta # animation

        # stop play after stopTime
        if clock.elapsedTime > stopTime
            for c in mixerActions
                do (c) -> c.stop()

    # load scene & start render
    loader = new THREE.ObjectLoader
    loader.load("models/untitled.json", (loadedScene) ->
        scene = loadedScene
        scene.fog = new THREE.Fog 0xffffff, 2000, 10000

        mixer = new THREE.AnimationMixer scene
        for a in loadedScene.animations
            do (a) ->
                mixerActions.push mixer.clipAction(a).play()
        # a box
        geometry = new THREE.BoxGeometry( 1, 1, 1 )
        material = new THREE.MeshBasicMaterial( {color: 0x00ff00} )
        cube = new THREE.Mesh( geometry, material )
        scene.add( cube )

        # Axis 3d object
        V3 = THREE.Vector3 # helper
        o = new THREE.Vector3
        scene.add new Axis(o, new V3(10,0,0),0,10,'Time','red',[10,5,1])
        scene.add new Axis(o, new V3(0,10,0),0,10,'y','green',[10,5,1])
        scene.add new Axis(o, new V3(0,0,10),0,10,'z','blue',[10,5,1])

        init()
        # scene.add(camera)
        animate()
    , (xhr) -> console.log xhr.loaded/xhr.total*100+'% loaded'
    )
