// navigation input events
// on a DOM element (that has: wheel, mousedown, mousemove)
define(function(){
    var zoomRatio = 0.01;
    var rotateRatio = 0.1;
    var cursor = {};

    function decorate(el){
        // helper
        function dispatch(el, na, val){
            el.dispatchEvent(new CustomEvent(na, {'detail': val}));
        }
        // wheel zoom
        el.addEventListener('wheel', function(e){
            dispatch(el, 'zoom', e.deltaY * zoomRatio);
        });

        // drag rotate
        function onDrag(e){
            cursor.deltaClientX = e.clientX - cursor.prevClientX;
            cursor.deltaClientY = e.clientY - cursor.prevClientY;
            cursor.prevClientX = e.clientX;
            cursor.prevClientY = e.clientY;
            dispatch(el,'rotate', cursor.deltaClientX * rotateRatio);
        }

        function onMouseDown(e){
            cursor.prevClientX = e.clientX;
            cursor.prevClientY = e.clientY;

            // when mouse down, register drag event
            var onMouseMove = function(e){
                onDrag(e);
            };
            el.addEventListener("mousemove", onMouseMove);

            // when mouse up / out, un-register drag event
            var onMouseOut = function(e){
                cursor.deltaClientX = 0;
                cursor.deltaClientY = 0;
                el.removeEventListener("mousemove", onMouseMove);
                el.removeEventListener("mouseout", onMouseOut);
                el.removeEventListener("mouseup", onMouseOut);
            };
            el.addEventListener("mouseup", onMouseOut );
            el.addEventListener("mouseout", onMouseOut);
        }
        el.addEventListener("mousedown", onMouseDown);
    }
    return {decorate: decorate};
});

