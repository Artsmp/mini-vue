import { track, trigger } from "./effect";

export const enum ReactiveFlags {
  /** 判断是否已经被代理过 */
  IS_REACTIVE = "__v_isReactive",
}

export const mutableHandler = {
  get(target, key, receiver) {
    // 3.3
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // 取值时依赖收集
    track(target, "get", key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, newVal, receiver) {
    // 写值时触发更新：注意这里书写顺序问题
    const oldValue = target[key];
    const result = Reflect.set(target, key, newVal, receiver);
    if (oldValue !== newVal) {
      trigger(target, "set", key, newVal, oldValue);
    }
    return result;
  },
};
