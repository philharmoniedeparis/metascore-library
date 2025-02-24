/**
 * Check if an element is visible.
 */
export function isVisible(element: HTMLElement) {
  return Boolean(
    element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
  );
}

/**
 * Get keyboard-focusable elements within a specified element.
 *
 * @param root The root element
 */
export function getKeyboardFocusableElements(root:HTMLElement|Document = document): HTMLElement[]|undefined {
  if (!root) return;

  const selectors = [
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

  const elements = Array.from(root.querySelectorAll(selectors.join(","))) as HTMLElement[];
  return elements.filter((el) => {
    return isVisible(el as HTMLElement);
  });
}

/**
 * Trap focus inside an element when tabbing.
 *
 * @param element The element to trap focus on
 * @param event The keyboard event
 */
export function trapTabFocus(element: HTMLElement, event: KeyboardEvent) {
  const focusables = getKeyboardFocusableElements(element);
  if (!focusables || focusables.length === 0) return;

  if (event.shiftKey) {
    const first = focusables.at(0);
    if (event.target === first) {
      event.preventDefault();
      focusables.at(-1)?.focus();
    }
  } else {
    const last = focusables.at(-1);
    if (event.target === last) {
      event.preventDefault();
      focusables.at(0)?.focus();
    }
  }
}

/**
 * Get an element's rect without CSS transforms.
 */
export function getRectWithoutTransforms(element: HTMLElement) {
  const { offsetWidth, offsetHeight } = element;
  let offsetLeft = 0;
  let offsetTop = 0;

  let el: HTMLElement|null = element;
  while (el) {
    offsetLeft += el.offsetLeft - el.scrollLeft;
    offsetTop += el.offsetTop - el.scrollTop;
    el = el.offsetParent as HTMLElement;
  }

  return new DOMRect(offsetLeft, offsetTop, offsetWidth, offsetHeight);
}
