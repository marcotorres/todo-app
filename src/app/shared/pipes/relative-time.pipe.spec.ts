import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  let pipe: RelativeTimePipe;

  beforeEach(() => {
    pipe = new RelativeTimePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null/undefined', () => {
    expect(pipe.transform(null as any)).toBe('');
    expect(pipe.transform(undefined as any)).toBe('');
  });

  it('should return "Just now" for dates less than 60 seconds ago', () => {
    const now = new Date();
    expect(pipe.transform(now)).toBe('Just now');
  });

  it('should return "1 minute ago" for dates 1 minute ago', () => {
    const date = new Date(Date.now() - 65 * 1000);
    expect(pipe.transform(date)).toBe('1 minute ago');
  });

  it('should return "X minutes ago" for dates less than 1 hour ago', () => {
    const date = new Date(Date.now() - 30 * 60 * 1000);
    expect(pipe.transform(date)).toMatch(/\d+ minutes ago/);
  });

  it('should return "1 hour ago" for dates 1 hour ago', () => {
    const date = new Date(Date.now() - 65 * 60 * 1000);
    expect(pipe.transform(date)).toBe('1 hour ago');
  });

  it('should return "X hours ago" for dates less than 24 hours ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toMatch(/\d+ hours ago/);
  });

  it('should return "Yesterday" for dates 1 day ago', () => {
    const date = new Date(Date.now() - 25 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toBe('Yesterday');
  });

  it('should return "X days ago" for dates less than 7 days ago', () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toMatch(/\d+ days ago/);
  });

  it('should return "1 week ago" for dates 1 week ago', () => {
    const date = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toBe('1 week ago');
  });

  it('should return "X weeks ago" for dates less than 4 weeks ago', () => {
    const date = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toMatch(/\d+ weeks ago/);
  });

  it('should return "1 month ago" for dates 1 month ago', () => {
    const date = new Date(Date.now() - 32 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toBe('1 month ago');
  });

  it('should return "X months ago" for dates less than 12 months ago', () => {
    const date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toMatch(/\d+ months ago/);
  });

  it('should return "1 year ago" for dates 1 year ago', () => {
    const date = new Date(Date.now() - 370 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toBe('1 year ago');
  });

  it('should return "X years ago" for dates more than 1 year ago', () => {
    const date = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(date)).toMatch(/\d+ years ago/);
  });

  it('should handle string dates', () => {
    const dateString = new Date(Date.now() - 65 * 1000).toISOString();
    expect(pipe.transform(dateString)).toBe('1 minute ago');
  });
});
