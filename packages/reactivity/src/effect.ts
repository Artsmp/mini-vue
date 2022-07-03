export let activeEffect: ReactiveEffect = undefined;

/**
 * 清空当前effect的所有依赖，并从对应的属性中的依赖set中删除自己
 * @param effect 当前要进行重新依赖收集的effect实例
 */
const cleanupEffect = (effect: ReactiveEffect) => {
  const { deps } = effect;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect);
  }
  deps.length = 0;
};
class ReactiveEffect {
  public active = true;
  public parent = null;
  public deps = [];
  constructor(public fn: Function) {}
  run() {
    // 不是激活的effect，则只执行不进行依赖收集
    if (!this.active) this.fn();
    // 进行依赖收集
    try {
      this.parent = activeEffect; // 记录自己的父亲
      activeEffect = this;
      // 重新进行依赖收集的时候，清空上一次保存的effect set
      cleanupEffect(this);
      this.fn();
    } finally {
      activeEffect = undefined;
      activeEffect = this.parent; // 自己执行完后重新设置自己的父亲为 activeEffect
      this.parent = null;
    }
  }
}

export const effect = (fn: Function) => {
  const _effect = new ReactiveEffect(fn);
  _effect.run(); // 默认先执行一次
};

const targetMap = new WeakMap(); // 依赖存放地：键为对象，值为Map，Map里面的键为对象的key，值为Set，Set存放的是effect实例
/**
 * 收集依赖
 * @param target 要进行收集的源对象
 * @param type 类型：get
 * @param key 访问的对象 key
 * 最终的数据结构 targetMap => WeakMap { target: Map { key: Set [ effect ] } }
 */
export const track = (target, type, key) => {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  // 这么做有一定的性能优化效果
  let shouldTrack = dep.has(activeEffect);
  if (!shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep); // 进行反向收集依赖，清除副作用时会用到
  }
};

export const trigger = (target, type, key, newVal, oldVal) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  let effects = depsMap.get(key);
  if (effects) {
    effects = [...effects];
    effects.forEach((effect) => {
      if (effect !== activeEffect) {
        // 防止在effect回调中再次修改目标属性值，造成爆栈
        effect.run();
      }
    });
  }
};

/* 
嵌套使用effect的情况处理：为每个effect新增一个 parent 属性，记录自己的父亲，自己执行完毕后将父亲再修改为activeEffect
effect(() => {
  state.name
  effect(() => {
    state.age
  })
  state.address
})

*/
