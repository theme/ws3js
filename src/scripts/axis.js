(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(['log'], function(log) {
    var Axis, V3;
    V3 = THREE.Vector3;
    Axis = (function(superClass) {
      extend(Axis, superClass);

      function Axis(a, b, m, n, name, c, r) {
        var arrow, arrowGeo, endPoint, line, lineGeo, marks, material, startPoint;
        if (a == null) {
          a = new V3;
        }
        if (b == null) {
          b = new V3(10, 0, 0);
        }
        THREE.Object3D.call(this);
        startPoint = a;
        endPoint = b;
        this.lower = m ? m : 0;
        this.upper = n ? n : 0;
        this.name = name ? name : '';
        this.color = c ? c : 'yellow';
        this.vector = endPoint.clone().sub(startPoint);
        this.length = this.vector.length();
        this.rangeLength = this.upper - this.lower;
        this.scaleRatio = this.length / this.rangeLength;
        material = new THREE.LineBasicMaterial({
          color: this.color
        });
        lineGeo = new THREE.Geometry();
        lineGeo.vertices.push(startPoint, endPoint);
        line = new THREE.Line(lineGeo, material);
        this.add(line);
        arrowGeo = new THREE.CylinderGeometry(0, 1, 5, 8, 8);
        arrow = new THREE.Mesh(arrowGeo, material);
        arrow.position.set(0, 2.5, 0);
        arrow.updateMatrix();
        arrow.geometry.applyMatrix(arrow.matrix);
        arrow.matrix.identity();
        arrow.position.copy(endPoint);
        arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.vector.normalize());
        this.add(arrow);
        marks = new THREE.Object3D();
        this.rulerMarks = r ? r.sort(function(a, b) {
          return a < b;
        }) : [10, 5, 1];
        this.rulerMarks.map(function(u) {
          var j, ref, results;
          (function() {
            results = [];
            for (var j = 0, ref = this.rangeLength / u; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--){ results.push(j); }
            return results;
          }).apply(this).map(function(i) {
            var y;
            lineGeo = new THREE.Geometry;
            y = i * u * this.scaleRatio;
            lineGeo.vertices.push(new THREE.Vector3(0, y, 0), new THREE.Vector3(u * 0.1, y, 0));
            marks.add(new THREE.Line(lineGeo, material));
          });
        });
        marks.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.vector.normalize());
        this.add(marks);
        return;
      }

      return Axis;

    })(THREE.Object3D);
    return Axis;
  });

}).call(this);
