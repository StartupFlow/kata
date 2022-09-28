const { prettyBytes } = require('./pretty-bytes');

describe('pretty-bytes', () => {
  it('O byte renders to 0B', () => {
    expect(prettyBytes(0)).toBe('0B');
  });

  it('1 byte renders to 1B', () => {
    expect(prettyBytes(1)).toBe('1B');
  });

  it('42 bytes render to 42B', () => {
    expect(prettyBytes(42)).toBe('42B');
  });

  it('1024 bytes render to 1KB', () => {
    expect(prettyBytes(1024)).toBe('1KB');
  });

  it('2048 bytes render to 2KB', () => {
    expect(prettyBytes(2048)).toBe('2KB');
  });

  it('3000 bytes render to 2.93KB', () => {
    expect(prettyBytes(3000)).toBe('2.93KB');
  });

  it('1048576 bytes render to 1MB', () => {
    expect(prettyBytes(1048576)).toBe('1MB');
  });

  it('1073741824 bytes render to 1GB', () => {
    expect(prettyBytes(1073741824)).toBe('1GB');
  });

  it('2199023256000 bytes render to 2TB', () => {
    expect(prettyBytes(2199023256000)).toBe('2TB');
  });

  it('2251799814000000 bytes render to 2PB', () => {
    expect(prettyBytes(2251799814000000)).toBe('2PB');
  });
});
