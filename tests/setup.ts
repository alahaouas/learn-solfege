import '@testing-library/jest-dom';

// Mock VexFlow (browser-only lib)
vi.mock('vexflow', () => ({
  Renderer: class {
    static Backends = { SVG: 'svg', CANVAS: 'canvas' };
    constructor() {}
    resize() { return this; }
    getContext() {
      return { setFont: vi.fn(), setStrokeStyle: vi.fn(), setFillStyle: vi.fn() };
    }
  },
  Stave: class {
    constructor() {}
    addClef() { return this; }
    addTimeSignature() { return this; }
    setContext() { return this; }
    draw() { return this; }
  },
  StaveNote: class {
    constructor(public opts: unknown) {}
    addModifier() { return this; }
    setStyle() { return this; }
    getBoundingBox() { return { x: 0, y: 0, w: 30, h: 40 }; }
  },
  Voice: class {
    constructor() {}
    setStrict() { return this; }
    addTickables() { return this; }
    draw() { return this; }
  },
  Formatter: class {
    joinVoices() { return this; }
    format() { return this; }
  },
  Accidental: class {
    constructor(public type: string) {}
  },
}));

// Mock Tone.js
vi.mock('tone', () => ({
  start: vi.fn().mockResolvedValue(undefined),
  Synth: class {
    constructor() {}
    toDestination() { return this; }
    triggerAttackRelease() {}
    get volume() { return { value: 0 }; }
  },
  MembraneSynth: class {
    constructor() {}
    toDestination() { return this; }
    triggerAttackRelease() {}
    get volume() { return { value: 0 }; }
  },
  Sequence: class {
    constructor() {}
    start() {}
    stop() {}
    dispose() {}
  },
  gainToDb: (v: number) => 20 * Math.log10(v),
  getTransport: () => ({
    bpm: { value: 120 },
    start: vi.fn(),
    stop: vi.fn(),
    cancel: vi.fn(),
    schedule: vi.fn(),
  }),
}));

// Mock UUID pour des IDs déterministes dans les tests
let uuidCounter = 0;
vi.mock('uuid', () => ({
  v4: () => `test-uuid-${++uuidCounter}`,
}));

// Réinitialiser le compteur UUID entre les tests
beforeEach(() => {
  uuidCounter = 0;
});
