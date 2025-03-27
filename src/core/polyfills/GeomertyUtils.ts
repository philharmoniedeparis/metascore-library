import "geometry-polyfill";

declare global {
  interface Window { convertPointFromPageToNode: (element: HTMLElement, pageX: number, pageY: number) => DOMPoint }
  interface Window { convertPointFromNodeToPage: (element: HTMLElement, pageX: number, pageY: number) => DOMPoint }
}

(function () {
  if (
    typeof window.convertPointFromPageToNode === "function" &&
    typeof window.convertPointFromNodeToPage === "function"
  ) {
    return;
  }

  const I = new window.DOMMatrix();

  function getTransformationMatrix(element: HTMLElement) {
    let transformationMatrix = I;
    let x = element as HTMLElement|null;

    while (x && x !== x.ownerDocument.documentElement) {
      const computedStyle = window.getComputedStyle(x);
      const transform = computedStyle.transform || "none";
      const c = transform === "none" ? I : new window.DOMMatrix(transform);

      transformationMatrix = c.multiply(transformationMatrix);
      x = x.parentNode as HTMLElement|null;
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
      window.scrollX + rect.left - left,
      window.scrollY + rect.top - top,
      0
    ).multiply(transformationMatrix);

    return transformationMatrix;
  }

  /**
   * Helper function to convert coordinates from the page's coordinate system to an element's local coordinate system
   * (works properly with css transforms without perspective projection)
   *
   * @param element The HTML element
   * @param pageX The x postion in the page's coordinate system
   * @param pageY The y postion in the page's coordinate system
   * @returns The x and y position in the element's local coordinate system
   */
  window.convertPointFromPageToNode =
    window.convertPointFromPageToNode ||
    function (element: HTMLElement, pageX: number, pageY: number) {
      return new window.DOMPoint(pageX, pageY, 0).matrixTransform(
        getTransformationMatrix(element).inverse()
      );
    };

  /**
   * Helper function to convert coordinates from the page's coordinate system to an element's local coordinate system
   * (works properly with css transforms without perspective projection)
   *
   * @param element The HTML element
   * @param offsetX The x postion in the element's local coordinate system
   * @param offset> The y postion in the element's local coordinate system
   * @returns The x and y position in the page's coordinate system
   */
  window.convertPointFromNodeToPage =
    window.convertPointFromNodeToPage ||
    function (element: HTMLElement, offsetX: number, offsetY: number) {
      return new window.DOMPoint(offsetX, offsetY, 0).matrixTransform(
        getTransformationMatrix(element)
      );
    };
})();
