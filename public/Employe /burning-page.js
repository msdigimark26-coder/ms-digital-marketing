const burnCanvasEl = document.getElementById('fire-overlay');
const burnTargets = [
  '.back-btn',
  '.qr-cube-shell',
  '.qr-scroll-prompt',
  '.logo',
  '.names',
  '.wrapper',
  '.visit-bio',
  '.qr-full-view-copy',
  '.mouse'
];

if (burnCanvasEl) {
  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealDuration = prefersReducedMotion ? 800 : 4200;

  let uniforms;
  let screenshotTexture;
  let gl;
  let startTime = 0;
  let rafId = 0;

  function waitForImages() {
    const images = Array.from(document.images);
    return Promise.all(images.map((image) => {
      if (image.complete) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    }));
  }

  function createTextTexture(canvas) {
    screenshotTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, screenshotTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      canvas
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  function createShader(glContext, sourceCode, type) {
    const shader = glContext.createShader(type);
    glContext.shaderSource(shader, sourceCode);
    glContext.compileShader(shader);

    if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
      console.error('Shader compile error:', glContext.getShaderInfoLog(shader));
      glContext.deleteShader(shader);
      return null;
    }

    return shader;
  }

  function initShader() {
    const vsSource = document.getElementById('vertShader')?.textContent;
    const fsSource = document.getElementById('fragShader')?.textContent;

    gl =
      burnCanvasEl.getContext('webgl', { alpha: true, premultipliedAlpha: false }) ||
      burnCanvasEl.getContext('experimental-webgl');

    if (!gl || !vsSource || !fsSource) {
      return null;
    }

    const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Shader program link error:', gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.useProgram(shaderProgram);

    const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    uniforms = {
      u_resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
      u_progress: gl.getUniformLocation(shaderProgram, 'u_progress'),
      u_time: gl.getUniformLocation(shaderProgram, 'u_time'),
      u_text: gl.getUniformLocation(shaderProgram, 'u_text'),
    };

    return gl;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function resizeCanvas() {
    if (!gl) {
      return;
    }

    burnCanvasEl.width = window.innerWidth * devicePixelRatio;
    burnCanvasEl.height = window.innerHeight * devicePixelRatio;
    gl.viewport(0, 0, burnCanvasEl.width, burnCanvasEl.height);
    gl.uniform2f(uniforms.u_resolution, burnCanvasEl.width, burnCanvasEl.height);
  }

  function finishAnimation() {
    cancelAnimationFrame(rafId);
    document.body.classList.remove('burn-reveal-pending');
    document.body.classList.add('burn-reveal-complete');
    burnCanvasEl.classList.remove('is-active');
    burnCanvasEl.style.display = 'none';
  }

  function render(now) {
    if (!startTime) {
      startTime = now;
    }

    const elapsed = (now - startTime) / revealDuration;
    const progress = Math.min(elapsed, 1);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uniforms.u_time, now);
    gl.uniform1f(uniforms.u_progress, easeInOut(progress));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, screenshotTexture);
    gl.uniform1i(uniforms.u_text, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (progress >= 1) {
      finishAnimation();
      return;
    }

    rafId = requestAnimationFrame(render);
  }

  async function captureViewport() {
    if (typeof window.html2canvas !== 'function') {
      return null;
    }

    return window.html2canvas(document.body, {
      backgroundColor: null,
      width: window.innerWidth,
      height: window.innerHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });
  }

  async function startBurnReveal() {
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await waitForImages();

      const capturedCanvas = await captureViewport();
      const shader = initShader();

      if (!capturedCanvas || !shader) {
        return;
      }

      createTextTexture(capturedCanvas);
      document.body.classList.add('burn-reveal-pending');
      burnCanvasEl.style.display = 'block';
      burnCanvasEl.classList.add('is-active');
      resizeCanvas();
      rafId = requestAnimationFrame(render);
    } catch (error) {
      console.error('Burn reveal failed:', error);
      document.body.classList.remove('burn-reveal-pending');
    }
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('load', startBurnReveal, { once: true });
}
