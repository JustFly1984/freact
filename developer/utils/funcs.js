const createPlainObject = () =>
  Object.create(null);

const removeByKey = (obj, deleteKey) => {

  const newObject = createPlainObject();

  Object.keys(obj).map(key =>
    key !== deleteKey
    &&
    Object.assign(newObject, {
      [key]: obj[key] 
    })
  );

  return newObject;
};

const objectAssignPlain = (...args) =>
  Object.assign(createPlainObject(), ...args);


const assignMultipleObjects = (...args) =>
  objectAssignPlain(...args);

export {

  createPlainObject,

  removeByKey,

  assignMultipleObjects,

  objectAssignPlain
};