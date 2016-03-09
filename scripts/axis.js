define(function(){
    // a -> b, Range[m,n], name, color, rulerMarks[r1, r2 ...] 
    var Axis = function(a, b, m, n, name, c, r){

        // core
        THREE.Object3D.call(this);

        var startPoint = ( a !== undefined ) ? a.clone() : new THREE.Vector3();
        var endPoint = ( b !== undefined ) ? b.clone() : new THREE.Vector3(10,0,0);
        this.lower = ( m !== undefined) ? m : 0;
        this.upper = ( n !== undefined) ? n : 0;
        this.name = ( name !== undefined) ? name : '';
        this.color = ( c !== undefined) ? c : 'yellow';

        // porperty
        this.vector = endPoint.clone().sub(startPoint);
        this.length = this.vector.length();
        this.rangeLength = this.upper - this.lower;
        this.scale = this.length / this.rangeLength;

        // 3D object
        var material = new THREE.LineBasicMaterial({color:this.color});

        var lineGeo = new THREE.Geometry();
        lineGeo.vertices.push(startPoint, endPoint);
        var line = new THREE.Line( lineGeo, material);
        this.add(line);

        var arrowGeo = new THREE.CylinderGeometry(0, 1, 5, 8, 8);
        var arrow = new THREE.Mesh(arrowGeo, material);
        arrow.position.copy(endPoint);
        arrow.quaternion.setFromUnitVectors(
            new THREE.Vector3(0,1,0), 
            this.vector.normalize()
        );
        this.add(arrow);

        // ruler marks
        var marks = new THREE.Object3D();
        this.rulerMarks = (r !== undefined ) ?  r.sort(function(a,b){return a < b}) : [10,5,1]; 
        this.rulerMarks.map(function(u){    // for every ruler unit
            var t = this.rangeLength / (this.length / this.scale);
            // draw the scale marks
            for(var i = 0; i < t ; i++){
                var lineGeo = new THREE.Geometry();
                lineGeo.vertices.push(
                    new THREE.Vector3(i*u,0,0),
                    new THREE.Vector3(i*u,-u*0.1,0)
                );
                marks.add(new THREE.Line(lineGeo, material));
            }
        });
        this.add(marks);
    }
    Axis.prototype = Object.create(THREE.Object3D.prototype);
    Axis.prototype.constructor = Axis;

    return Axis;
});

