/**
 * Tiny pointer-based drag-and-drop sorter that works on any document
 * (including the preview iframe). Markup contract:
 *
 *   <ul data-sortable="pages.home" data-sortable-axis="y">
 *     <li data-sortable-item> ... <button data-drag-handle /> ... </li>
 *   </ul>
 *
 * `data-sortable` holds the list path that will be passed back to onReorder.
 * `data-sortable-axis` is "y" for vertical stacks or "xy" (default) for grids.
 */
export type ReorderHandler = (listPath: string, from: number, to: number) => void;

const THRESHOLD = 5;
const EDGE = 64;
const SCROLL_STEP = 14;

function itemsOf(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-sortable-item]")).filter(
    (el) => el.closest("[data-sortable]") === container,
  );
}

export function attachSortable(doc: Document, onReorder: ReorderHandler): () => void {
  let active: {
    pointerId: number;
    startX: number;
    startY: number;
    handle: HTMLElement;
    source: HTMLElement;
    container: HTMLElement;
    axis: "y" | "xy";
    dragging: boolean;
    from: number;
    insertAt: number;
    indicator: HTMLDivElement | null;
    lastX: number;
    lastY: number;
    raf: number;
  } | null = null;

  function computeInsert(
    x: number,
    y: number,
  ): { index: number; rect: DOMRect; before: boolean } | null {
    if (!active) return null;
    const items = itemsOf(active.container);
    if (items.length === 0) return null;
    if (active.axis === "y") {
      for (let i = 0; i < items.length; i++) {
        const r = items[i].getBoundingClientRect();
        if (y < r.top + r.height / 2) return { index: i, rect: r, before: true };
      }
      const last = items[items.length - 1].getBoundingClientRect();
      return { index: items.length, rect: last, before: false };
    }
    // Grid: prefer the item under the pointer, else the nearest centre.
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect();
      const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = inside ? 0 : Math.hypot(x - cx, y - cy);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    const r = items[best].getBoundingClientRect();
    const sameRow = y >= r.top && y <= r.bottom;
    const before = sameRow ? x < r.left + r.width / 2 : y < r.top;
    return { index: before ? best : best + 1, rect: r, before };
  }

  function paintIndicator(hit: { rect: DOMRect; before: boolean }) {
    if (!active) return;
    if (!active.indicator) {
      const el = doc.createElement("div");
      el.className = "tfs-drop-indicator";
      doc.body.appendChild(el);
      active.indicator = el;
    }
    const el = active.indicator;
    const r = hit.rect;
    if (active.axis === "y") {
      const top = hit.before ? r.top : r.bottom;
      el.style.cssText = `left:${r.left}px;top:${top - 2}px;width:${r.width}px;height:4px;`;
    } else {
      const left = hit.before ? r.left : r.right;
      el.style.cssText = `left:${left - 2}px;top:${r.top}px;width:4px;height:${r.height}px;`;
    }
  }

  function autoScroll() {
    if (!active || !active.dragging) return;
    const win = doc.defaultView;
    if (win) {
      const h = win.innerHeight;
      if (active.lastY < EDGE) win.scrollBy(0, -SCROLL_STEP);
      else if (active.lastY > h - EDGE) win.scrollBy(0, SCROLL_STEP);
    }
    active.raf = win ? win.requestAnimationFrame(autoScroll) : 0;
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    const handle = target?.closest<HTMLElement>("[data-drag-handle]");
    if (!handle) return;
    const source = handle.closest<HTMLElement>("[data-sortable-item]");
    const container = source?.closest<HTMLElement>("[data-sortable]");
    if (!source || !container) return;
    const items = itemsOf(container);
    const from = items.indexOf(source);
    if (from < 0) return;
    e.preventDefault();
    active = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      handle,
      source,
      container,
      axis: container.dataset.sortableAxis === "y" ? "y" : "xy",
      dragging: false,
      from,
      insertAt: from,
      indicator: null,
      lastX: e.clientX,
      lastY: e.clientY,
      raf: 0,
    };
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      // capture is best-effort
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (!active || e.pointerId !== active.pointerId) return;
    active.lastX = e.clientX;
    active.lastY = e.clientY;
    if (!active.dragging) {
      if (Math.hypot(e.clientX - active.startX, e.clientY - active.startY) < THRESHOLD) return;
      active.dragging = true;
      active.source.classList.add("tfs-drag-source");
      doc.body.classList.add("tfs-dragging");
      autoScroll();
    }
    const hit = computeInsert(e.clientX, e.clientY);
    if (!hit) return;
    active.insertAt = hit.index;
    paintIndicator(hit);
  }

  function finish(commit: boolean) {
    if (!active) return;
    const { source, container, from, insertAt, dragging, indicator, raf } = active;
    source.classList.remove("tfs-drag-source");
    doc.body.classList.remove("tfs-dragging");
    indicator?.remove();
    if (raf && doc.defaultView) doc.defaultView.cancelAnimationFrame(raf);
    try {
      active.handle.releasePointerCapture(active.pointerId);
    } catch {
      // ignore
    }
    active = null;
    if (!commit || !dragging) return;
    const to = insertAt > from ? insertAt - 1 : insertAt;
    const listPath = container.dataset.sortable;
    if (listPath && to !== from) onReorder(listPath, from, to);
  }

  function onPointerUp(e: PointerEvent) {
    if (!active || e.pointerId !== active.pointerId) return;
    // Swallow the click that follows a real drag so nothing underneath toggles.
    if (active.dragging) {
      const stop = (ev: Event) => {
        ev.stopPropagation();
        ev.preventDefault();
      };
      doc.addEventListener("click", stop, { capture: true, once: true });
      setTimeout(() => doc.removeEventListener("click", stop, { capture: true }), 0);
    }
    finish(true);
  }

  function onPointerCancel(e: PointerEvent) {
    if (!active || e.pointerId !== active.pointerId) return;
    finish(false);
  }

  doc.addEventListener("pointerdown", onPointerDown, true);
  doc.addEventListener("pointermove", onPointerMove, true);
  doc.addEventListener("pointerup", onPointerUp, true);
  doc.addEventListener("pointercancel", onPointerCancel, true);
  return () => {
    finish(false);
    doc.removeEventListener("pointerdown", onPointerDown, true);
    doc.removeEventListener("pointermove", onPointerMove, true);
    doc.removeEventListener("pointerup", onPointerUp, true);
    doc.removeEventListener("pointercancel", onPointerCancel, true);
  };
}
