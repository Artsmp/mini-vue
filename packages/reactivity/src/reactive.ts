import { isObject } from "@vue/shared";

/*
1. 简单的返回一个响应式对象
2. 反复的传同一个对象不需要再次进行代理，使用weakMap记录这个对象是不是已经被代理过
3. 当传入的是一个proxy过的代理对象时，直接返回传入的对象
  3.1 为代理对象设置一个独有的键
  3.2 访问一下这个键，如果返回true则说明传入的是已经被代理过得对象
  3.3 在 get 中为这个独有的键返回true
*/
const proxyMap = new WeakMap();
const enum ReactiveFlags {
  /** 判断是否已经被代理过 */
  IS_REACTIVE = "__v_isReactive",
}
export const reactive = (target: object) => {
  if (!isObject(target)) return target;
  // 3
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }
  // 2
  const existingProxy = proxyMap.get(target);
  if (existingProxy) return existingProxy;
  let proxy = new Proxy(target, {
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
  });
  proxyMap.set(target, proxy);
  return proxy;
};
