const pick = <T extends Record<string, unknown>, K extends keyof T>(
    object: T,
    keys: K[]
  ): Partial<T> => {
    const result: Partial<T> = {};
    for (const key of keys) {
      if (object && Object.prototype.hasOwnProperty.call(object, key)) {
        result[key] = object[key];
      }
    }
  
    return result;
  };
  

  export default pick