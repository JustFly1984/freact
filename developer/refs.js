import {
  createPlainObject
} from "../utils/funcs";

const refsCollection = createPlainObject();

window.refsCollection = refsCollection;

const registerRef = (entry, ref, element) => (
  refsCollection[entry]
  ||
  (
    refsCollection[entry] = createPlainObject()
  ),

  refsCollection[entry][ref] = element
);

const unregisterRef = entry =>
  delete refsCollection[entry];

const getRefsFromCollection = entry =>
  refsCollection[entry];

export {
  registerRef,

  unregisterRef,

  getRefsFromCollection
};