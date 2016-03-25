require ['log','Compass','WebPage','InputMixer'], (log, Compass, WebPage, InputMixer) ->
    canvas = null
    scene = null

    camera = null
    pCam = null
    oCam = null

    renderer = null

    clock = new THREE.Clock
    stopTime = 5
    mixer = null    # animation player
    mixerActions = []   # animation actions list

    # helper
    ccw = -> canvas.clientWidth
    cch = -> canvas.clientHeight
    cas = -> ccw() / cch()

    # camera
    initCamera = ->
        # Perspective
        pCam = new THREE.PerspectiveCamera 75, ccw()/cch(),1,100
        pCam.update = ->
            pCam.aspect = ccw()/cch()
            pCam.updateProjectionMatrix()
        pCam.tgt = new THREE.Vector3

        # Orthographic
        oCam = new THREE.OrthographicCamera ccw()/-2, ccw()/2, cch()/2, cch()/-2, -1000, 1000
        oCam.update = ->
            oCam.left   = - ccw()/2
            oCam.right  = + ccw()/2
            oCam.top    = + cch()/2
            oCam.bottom = - cch()/2
            oCam.updateProjectionMatrix()
        oCam.tgt = new THREE.Vector3

        camera = pCam

    switchCam = (type) ->
        a2b = (a,b) ->
            b.tgt.copy a.tgt
            b.position.copy a.position
            camera = b
        switch type
            when 'oCam'
                a2b pCam,oCam if camera != oCam
            when 'pCam'
                a2b oCam,pCam if camera != pCam
            when 'nextCam'
                if camera == pCam then a2b pCam,oCam
                else a2b oCam,pCam
        return camera

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


    init = ->
        # canvas
        canvas = document.getElementById("3jscanvas")

        # renderer
        renderer = new THREE.WebGLRenderer {canvas:canvas}
        renderer.setClearColor new THREE.Color 0x003366

        # camera
        initCamera().position.set 0,5,20

        # reset view
        resetCameraView()

        # Watch vanvas resize
        watchResize canvas, resetCameraView

        # navigation input & camera control
        InputMixer.decorate canvas # cavas now has 'zoom','rotate' ev
        camera.lookAt camera.tgt

        # move camera close to tgt
        canvas.addEventListener 'zoom', (e) ->
            camera.zoom += e.detail if camera.zoom+e.detail>0.1
            camera.updateProjectionMatrix()

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

        # change camera
        canvas.addEventListener 'cam', (e) ->
            switchCam e.detail

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
        for i in [0..9]
            for j in [0..9]
                geometry = new THREE.BoxGeometry( 1, 1, 1 )
                material = new THREE.MeshBasicMaterial( {color: 0x55ff00} )
                cube = new THREE.Mesh( geometry, material )
                cube.position.x = i * 2
                cube.position.z = - j * 2
                scene.add( cube )

        scene.add( new Compass )
        scene.add( new WebPage("wikipedia.org") )

        #TODO calculate WebPage position

        init()
        # scene.add(camera)
        animate()
    , (xhr) -> console.log xhr.loaded/xhr.total*100+'% loaded'
    )
