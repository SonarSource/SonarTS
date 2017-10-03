import throttleByAnimationFrame from '../throttleByAnimationFrame';

jest.useFakeTimers();

describe('Test utils function', () => {
  it('throttle function should work', () => {
    const callback = jest.fn();
    const throttled = throttleByAnimationFrame(callback);
    expect(callback).not.toBeCalled();

    throttled();
    throttled();

    jest.runAllTimers();
    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
  });

  it('throttle function should be canceled', () => {
    const callback = jest.fn();
    const throttled = throttleByAnimationFrame(callback);

    throttled();
    throttled.cancel();

    jest.runAllTimers();
    expect(callback).not.toBeCalled();
  });
});
