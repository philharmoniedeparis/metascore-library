import "geometry-polyfill";

(function () {
  if (
    typeof window.convertPointFromPageToNode === "function" &&
    typeof window.convertPointFromNodeToPage === "function"
  ) {
    return;
  }

  const I = new window.DOMMatrix();

  function getTransformationMatrix(element) {
    let transformationMatrix = I;
    let x = element;

    while (typeof x !== "undefined" && x !== x.ownerDocument.documentElement) {
      const computedStyle = window.getComputedStyle(x);
      const transform = computedStyle.transform || "none";
      const c = transform === "none" ? I : new window.DOMMatrix(transform);

      transformationMatrix = c.multiply(transformationMatrix);
      x = x.parentNode;
    }

    const w = element.offsetWidth;
    const h = element.offsetHeight;
    const p0 = new window.DOMPoint(0, 0, 0).matrixTransform(
      transformationMatrix
    );
    const p1 = new window.DOMPoint(w, 0, 0).matrixTransform(
      transformationMatrix
    );
    const p2 = new window.DOMPoint(w, h, 0).matrixTransform(
      transformationMatrix
    );
    const p3 = new window.DOMPoint(0, h, 0).matrixTransform(
      transformationMatrix
    );
    const left = Math.min(p0.x, p1.x, p2.x, p3.x);
    const top = Math.min(p0.y, p1.y, p2.y, p3.y);
    const rect = element.getBoundingClientRect();

    transformationMatrix = I.translate(
      window.pageXOffset + rect.left - left,
      window.pageYOffset + rect.top - top,
      0
    ).multiply(transformationMatrix);

    return transformationMatrix;
  }

  /**
   * Helper function to convert coordinates from the page's coordinate system to an element's local coordinate system
   * (works properly with css transforms without perspective projection)
   *
   * @param {DOMElement} element The dom element
   * @param {Number} pageX The x postion in the page's coordinate system
   * @param {Number} pageY The y postion in the page's coordinate system
   * @returns {Object} The x and y position in the element's local coordinate system
   */
  window.convertPointFromPageToNode =
    window.convertPointFromPageToNode ||
    function (element, pageX, pageY) {
      return new window.DOMPoint(pageX, pageY, 0).matrixTransform(
        getTransformationMatrix(element).inverse()
      );
    };

  /**
   * Helper function to convert coordinates from the page's coordinate system to an element's local coordinate system
   * (works properly with css transforms without perspective projection)
   *
   * @param {DOMElement} element The dom element
   * @param {Number} offsetX The x postion in the element's local coordinate system
   * @param {Number} offset> The y postion in the element's local coordinate system
   * @returns {Object} The x and y position in the page's coordinate system
   */
  window.convertPointFromNodeToPage =
    window.convertPointFromNodeToPage ||
    function (element, offsetX, offsetY) {
      return new window.DOMPoint(offsetX, offsetY, 0).matrixTransform(
        getTransformationMatrix(element)
      );
    };
})();
