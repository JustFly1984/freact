import {
  isObject
} from "../utils/is";

import {
  createPlainObject
} from "../utils/funcs";

const propsCollection = createPlainObject();

const setPropToCollection = (uniqueId, propName, propValue) => (

  isObject(propsCollection[uniqueId])
  ||
  (
    propsCollection[uniqueId] = createPlainObject()
  ),
  

  propsCollection[uniqueId][propName] = propValue

);

const registerProps = (uniqueId, props) =>
  Object.keys(props).map(key =>
    setPropToCollection(uniqueId, key, props[key])
  );


const getPropsFromCollection = (uniqueId) =>
  propsCollection[uniqueId];


const removePropsFromCollection = uniqueId =>
  delete propsCollection[uniqueId];

export {
  registerProps,

  getPropsFromCollection,

  removePropsFromCollection
};

