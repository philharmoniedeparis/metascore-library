/**
 * Check if an element is visible.
 *
 * @param {HTMLElement} [element] The element
 * @returns {Boolean} True if the element is visible, false otherwise
 */
export function isVisible(element) {
  return Boolean(
    element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
  );
}

/**
 * Get keyboard-focusable elements within a specified element.
 *
 * @param {HTMLElement} [root=document] The root element
 * @returns {Array}
 */
export function getKeyboardFocusableElements(root = document) {
  if (!root) return null;

  let selectors = [
    "a[href]:not([inert]):not([inert] *):not([tabindex^='-']):not([aria-hidden])",
    "area[href]:not([inert]):not([inert] *):not([tabindex^='-']):not([aria-hidden])",
    "input:not([type='hidden']):not([type='radio']):not([inert]):not([inert] *):not([tabindex^='-']):not(:disabled):not([aria-hidden])",
    "input[type='radio']:not([inert]):not([inert] *):not([tabindex^='-']):not(:disabled):not([aria-hidden])",
    "select:not([inert]):not([inert] *):not([tabindex^='-']):not(:disabled):not([aria-hidden])",
    "textarea:not([inert]):not([inert] *):not([tabindex^='-']):not(:disabled):not([aria-hidden])",
    "button:not([inert]):not([inert] *):not([tabindex^='-']):not(:disabled):not([aria-hidden])",
    "details:not([inert]):not([inert] *) > summary:first-of-type:not([tabindex^='-']):not([aria-hidden])",
    "iframe:not([inert]):not([inert] *):not([tabindex^='-']):not([aria-hidden])",
    "audio[controls]:not([inert]):not([inert] *):not([tabindex^='-']):not([aria-hidden])",
    "video[controls]:not([inert]):not([inert] *):not([tabindex^='-']):not([aria-hidden])",
    "[contenteditable]:not([inert]):not([inert] *):not([tabindex^='-']):not([aria-hidden])",
    "[tabindex]:not([inert]):not([inert] *):not([tabindex^='-']):not([aria-hidden])",
  ];

  return Array.from(root.querySelectorAll(selectors.join(","))).filter((el) => {
    return isVisible(el);
  });
}

/**
 * Trap focus inside an element when tabbing.
 *
 * @param {HTMLElement} element The element to trap focus on
 * @param {KeyboardEvent} evt The keyboard event
 */
export function trapTabFocus(element, evt) {
  const focusables = getKeyboardFocusableElements(element);
  if (!focusables || focusables.length === 0) return;

  if (evt.shiftKey) {
    const first = focusables.at(0);
    if (evt.target === first) {
      evt.preventDefault();
      focusables.at(-1).focus();
    }
  } else {
    const last = focusables.at(-1);
    if (evt.target === last) {
      evt.preventDefault();
      focusables.at(0).focus();
    }
  }
}

/**
 * Get an element's rect without CSS transforms.
 *
 * @param {HTMLElement} element The element
 * @returns {DOMRect} The element's rect
 */
export function getRectWithoutTransforms(el) {
  const { offsetWidth, offsetHeight } = el;
  let offsetLeft = 0;
  let offsetTop = 0;

  while (el) {
    offsetLeft += el.offsetLeft - el.scrollLeft;
    offsetTop += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }

  return new DOMRect(offsetLeft, offsetTop, offsetWidth, offsetHeight);
}
