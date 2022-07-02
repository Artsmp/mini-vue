export let activeEffect = undefined;
class ReactiveEffect {
  public active = true;
  constructor(public fn: Function) {}
  run() {
    // 不是激活的effect，则只执行不进行依赖收集
    if (!this.active) this.fn();
    // 进行依赖收集
    try {
      activeEffect = this;
      this.fn();
    } finally {
      activeEffect = undefined;
    }
  }
}

export const effect = (fn: Function) => {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
};
