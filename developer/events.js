import {
  isArray,
  isObject,
  isUndefined,
  isFunction
} from "../utils/is";

import {
  createPlainObject
} from "../utils/funcs";

import {
  getPropsFromCollection
} from "./props";

import {
  getRefsFromCollection
} from "./refs";

const eventsCollection = createPlainObject();

window.eventsCollection = eventsCollection;

const getTargetUniqueId = target =>
  target.getAttribute("branch");

const getTargetEntryFromUniqueId = uniqueId =>
  uniqueId.split("-")[0];

const eventListenerCallback = (fn, props, refs) =>
  event =>
    fn({ event, target: event.target, props, refs });

const addEventListener = (target, eventType, fn, props, refs) =>
  target.addEventListener(
    eventType,
    eventListenerCallback(fn, props, refs)
  );

const eventHandler = ({ uniqueId, eventType, event }) => (
  // console.log(`eventHandler:
  //   uniqueId: ${uniqueId}
  //   eventType: ${eventType}
  // `),

  uniqueId
  &&
  eventsCollection[uniqueId]
  &&
  isArray(eventsCollection[uniqueId][eventType])
  &&
  eventsCollection[uniqueId][eventType].map(cb =>
    isFunction(cb)
    &&
    cb({
      event,

      target: event.target,

      props: getPropsFromCollection(uniqueId),

      refs: getRefsFromCollection(getTargetEntryFromUniqueId(uniqueId))
    })
  )
);

const eventsManager = () => [
  "click"
  ,"contextmenu"
  ,"dblclick"
  ,"drag"
  ,"dragend"
  ,"drop"
  ,"dragenter"
  ,"dragleave"
  ,"dragover"
  ,"dragstart"
  ,"drop"
  ,"keydown"
  ,"keypress"
  ,"keyup"
  ,"mousedown"
  ,"mouseenter"
  ,"mouseout"
  ,"mouseup"
  ,"paste"
].map(eventType =>
  document.body.addEventListener(eventType, event => {
    //event.stopPropagation();
    // console.log(`eventsManager:
    //   eventType: ${eventType}
    //   uniqueId: ${getTargetUniqueId(event.target)}
    // `);

    eventHandler({
      uniqueId: getTargetUniqueId(event.target),
      eventType,
      event
    });
  })
);

const callbackHandler = (renderId, element, eventType, callback) => {
  isFunction(callback)
  &&
  addEventListener(
    element,

    eventType,

    callback,

    getPropsFromCollection(renderId),

    getRefsFromCollection(getTargetEntryFromUniqueId(renderId))
  );

  isArray(callback)
  &&
  callback.map(cb =>
    callbackHandler(renderId, element, eventType, cb)
  );
};

const registerEventsByType = (element, eventType, renderId, callback) => {
  // console.log(`registerEventsByType:
  //   uniqueId: ${renderId},
  //   eventType: ${eventType}
  // `);
  switch (eventType) {
  case "click":
  case "contextmenu":
  case "dblclick":
  case "drag":
  case "dragend":
  case "drop":
  case "dragenter":
  case "dragleave":
  case "dragover":
  case "dragstart":
  case "drop":
  case "keydown":
  case "keypress":
  case "keyup":
  case "mousedown":
  case "mouseup":
  case "paste":
    isUndefined(eventsCollection[renderId][eventType])
    ?
    (
      isFunction(callback)
      &&
      (
        eventsCollection[renderId][eventType] = [callback]
      ),

      isArray(callback)
      &&
      (
        eventsCollection[renderId][eventType] = callback
      )
    )
    :
    (
      isFunction(callback)
      &&
      (
        eventsCollection[renderId][eventType] = [...eventsCollection[renderId][eventType], callback]
      ),

      isArray(callback)
      &&
      (
        eventsCollection[renderId][eventType] = [...eventsCollection[renderId][eventType], ...callback]
      )
    );
    break;
  case "mousemove":
  case "mouseover":
  case "mouseenter":
  case "mouseout":
  default:
    isUndefined(eventsCollection[renderId][eventType])
    ?
    (
      isFunction(callback)
      &&
      (
        eventsCollection[renderId][eventType] = [callback]
      ),

      isArray(callback)
      &&
      (
        eventsCollection[renderId][eventType] = callback
      )
    )
    :
    (
      isFunction(callback)
      &&
      (
        eventsCollection[renderId][eventType] = [...eventsCollection[renderId][eventType], callback]
      ),

      isArray(callback)
      &&
      (
        eventsCollection[renderId][eventType] = [...eventsCollection[renderId][eventType], ...callback]
      )
    );

    isUndefined(callback)
    ||
    callbackHandler(renderId, element, eventType, callback);
    break;
  }
};

const registerEvents = (element, renderId, events) => {
  isUndefined(eventsCollection[renderId])
  &&
  (
    eventsCollection[renderId] = createPlainObject()
  );

  isObject(events)
  &&
  registerEventsByType(element, events.type, renderId, events.callback);
  
  isArray(events)
  &&
  events.map(event =>
    registerEvents(element, renderId, event)
  );
};

const unregisterEvents = renderId => {
  // console.log(`unregisterEvents:
  //   uniqueId: ${renderId}
  // `);
  delete eventsCollection[renderId];
};

export {
  eventsManager,

  registerEvents,

  unregisterEvents
};