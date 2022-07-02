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
    return Reflect.get(target, key, receiver);
  },
  set(target, key, newVal, receiver) {
    return Reflect.set(target, key, newVal, receiver);
  },
};
