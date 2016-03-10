define(function(){
    var zoomRatio = 0.01;
    function decorate(el){
        el.addEventListener('wheel', function(e){
            el.dispatchEvent(
                new CustomEvent('zoom', {'detail':e.deltaY*zoomRatio})
            );
        });
    }
    return {decorate: decorate};
});

