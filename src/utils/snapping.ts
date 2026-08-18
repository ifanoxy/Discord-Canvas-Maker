const SNAP_DISTANCE = 7;
const ALIGN_LINE_COLOR = '#57F287'; // Bright Discord Green

export interface GuideLine {
  type: 'vertical' | 'horizontal';
  pos: number;
  start: number;
  end: number;
}

export const initAligningGuidelines = (canvas: any) => {
  let verticalLines: GuideLine[] = [];
  let horizontalLines: GuideLine[] = [];

  // Track ctrl key globally in case canvas events miss it
  let isCtrlDown = false;
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Control' || e.ctrlKey) isCtrlDown = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Control' || !e.ctrlKey) {
      isCtrlDown = false;
      if (verticalLines.length > 0 || horizontalLines.length > 0) {
        verticalLines = [];
        horizontalLines = [];
        if (canvas.contextTop) canvas.clearContext(canvas.contextTop);
        canvas.requestRenderAll();
      }
    }
  });

  canvas.on('mouse:down', function () {
    verticalLines = [];
    horizontalLines = [];
  });

  canvas.on('object:moving', function (e: any) {
    const activeObj = e.target;
    if (!activeObj) return;

    const hasCtrl = (e.e && e.e.ctrlKey) || isCtrlDown;
    
    // Only snap & show guidelines when Ctrl is held
    if (!hasCtrl) {
      if (verticalLines.length > 0 || horizontalLines.length > 0) {
        verticalLines = [];
        horizontalLines = [];
        if (canvas.contextTop) canvas.clearContext(canvas.contextTop);
      }
      return;
    }

    verticalLines = [];
    horizontalLines = [];

    const cW = canvas.getWidth();
    const cH = canvas.getHeight();

    // Active object bounding points
    const aW = activeObj.getScaledWidth();
    const aH = activeObj.getScaledHeight();
    const aLeft = activeObj.left;
    const aTop = activeObj.top;
    const aCenterX = aLeft + aW / 2;
    const aCenterY = aTop + aH / 2;
    const aRight = aLeft + aW;
    const aBottom = aTop + aH;

    let snappedX = false;
    let snappedY = false;

    // 1. CANVAS CENTER & EDGES ALIGNMENT
    // Canvas Center X
    if (Math.abs(aCenterX - cW / 2) < SNAP_DISTANCE) {
      activeObj.set('left', cW / 2 - aW / 2);
      verticalLines.push({ type: 'vertical', pos: cW / 2, start: 0, end: cH });
      snappedX = true;
    }
    // Canvas Center Y
    if (Math.abs(aCenterY - cH / 2) < SNAP_DISTANCE) {
      activeObj.set('top', cH / 2 - aH / 2);
      horizontalLines.push({ type: 'horizontal', pos: cH / 2, start: 0, end: cW });
      snappedY = true;
    }

    // 2. OBJECT-TO-OBJECT ALIGNMENT (Start, Center, End / Left, Center, Right, Top, Bottom)
    const objects = canvas.getObjects().filter((obj: any) => obj !== activeObj && obj.visible !== false);

    for (let i = 0; i < objects.length; i++) {
      const other = objects[i];
      const oW = other.getScaledWidth();
      const oH = other.getScaledHeight();
      const oLeft = other.left;
      const oTop = other.top;
      const oCenterX = oLeft + oW / 2;
      const oCenterY = oTop + oH / 2;
      const oRight = oLeft + oW;
      const oBottom = oTop + oH;

      const spanYMin = Math.min(aTop, oTop) - 10;
      const spanYMax = Math.max(aBottom, oBottom) + 10;
      const spanXMin = Math.min(aLeft, oLeft) - 10;
      const spanXMax = Math.max(aRight, oRight) + 10;

      // --- VERTICAL GUIDES (X AXIS) ---
      if (!snappedX) {
        // A. Start to Start (Left to Left)
        if (Math.abs(aLeft - oLeft) < SNAP_DISTANCE) {
          activeObj.set('left', oLeft);
          verticalLines.push({ type: 'vertical', pos: oLeft, start: spanYMin, end: spanYMax });
          snappedX = true;
        }
        // B. Center to Center
        else if (Math.abs(aCenterX - oCenterX) < SNAP_DISTANCE) {
          activeObj.set('left', oCenterX - aW / 2);
          verticalLines.push({ type: 'vertical', pos: oCenterX, start: spanYMin, end: spanYMax });
          snappedX = true;
        }
        // C. End to End (Right to Right)
        else if (Math.abs(aRight - oRight) < SNAP_DISTANCE) {
          activeObj.set('left', oRight - aW);
          verticalLines.push({ type: 'vertical', pos: oRight, start: spanYMin, end: spanYMax });
          snappedX = true;
        }
        // D. Start to End (Left to Right)
        else if (Math.abs(aLeft - oRight) < SNAP_DISTANCE) {
          activeObj.set('left', oRight);
          verticalLines.push({ type: 'vertical', pos: oRight, start: spanYMin, end: spanYMax });
          snappedX = true;
        }
        // E. End to Start (Right to Left)
        else if (Math.abs(aRight - oLeft) < SNAP_DISTANCE) {
          activeObj.set('left', oLeft - aW);
          verticalLines.push({ type: 'vertical', pos: oLeft, start: spanYMin, end: spanYMax });
          snappedX = true;
        }
      }

      // --- HORIZONTAL GUIDES (Y AXIS) ---
      if (!snappedY) {
        // A. Top to Top (Start to Start)
        if (Math.abs(aTop - oTop) < SNAP_DISTANCE) {
          activeObj.set('top', oTop);
          horizontalLines.push({ type: 'horizontal', pos: oTop, start: spanXMin, end: spanXMax });
          snappedY = true;
        }
        // B. Center to Center
        else if (Math.abs(aCenterY - oCenterY) < SNAP_DISTANCE) {
          activeObj.set('top', oCenterY - aH / 2);
          horizontalLines.push({ type: 'horizontal', pos: oCenterY, start: spanXMin, end: spanXMax });
          snappedY = true;
        }
        // C. Bottom to Bottom (End to End)
        else if (Math.abs(aBottom - oBottom) < SNAP_DISTANCE) {
          activeObj.set('top', oBottom - aH);
          horizontalLines.push({ type: 'horizontal', pos: oBottom, start: spanXMin, end: spanXMax });
          snappedY = true;
        }
        // D. Top to Bottom (Start to End)
        else if (Math.abs(aTop - oBottom) < SNAP_DISTANCE) {
          activeObj.set('top', oBottom);
          horizontalLines.push({ type: 'horizontal', pos: oBottom, start: spanXMin, end: spanXMax });
          snappedY = true;
        }
        // E. Bottom to Top (End to Start)
        else if (Math.abs(aBottom - oTop) < SNAP_DISTANCE) {
          activeObj.set('top', oTop - aH);
          horizontalLines.push({ type: 'horizontal', pos: oTop, start: spanXMin, end: spanXMax });
          snappedY = true;
        }
      }
    }

    activeObj.setCoords();
    if (verticalLines.length > 0 || horizontalLines.length > 0) {
      canvas.renderTop();
    }
  });

  canvas.on('before:render', function () {
    const ctxTop = canvas.contextTop;
    if (ctxTop) {
      canvas.clearContext(ctxTop);
    }
  });

  canvas.on('after:render', function () {
    if (verticalLines.length > 0 || horizontalLines.length > 0) {
      const ctxTop = canvas.contextTop;
      if (!ctxTop) return;

      ctxTop.save();
      ctxTop.strokeStyle = ALIGN_LINE_COLOR;
      ctxTop.lineWidth = 1.5;
      ctxTop.setLineDash([4, 4]);

      verticalLines.forEach(line => {
        ctxTop.beginPath();
        ctxTop.moveTo(line.pos + 0.5, line.start);
        ctxTop.lineTo(line.pos + 0.5, line.end);
        ctxTop.stroke();
      });

      horizontalLines.forEach(line => {
        ctxTop.beginPath();
        ctxTop.moveTo(line.start, line.pos + 0.5);
        ctxTop.lineTo(line.end, line.pos + 0.5);
        ctxTop.stroke();
      });

      ctxTop.restore();
    }
  });

  canvas.on('mouse:up', function () {
    verticalLines = [];
    horizontalLines = [];
    if (canvas.contextTop) {
      canvas.clearContext(canvas.contextTop);
    }
  });
};
