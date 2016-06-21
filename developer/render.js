import {
  diff
} from "deep-diff";

import {
  isString,
  isArray,
  isObject,
  isBoolean,
  isUndefined,
  isFunction
} from "./utils/is";

import {
  clearElement,

  removeElement,

  replaceElement
} from "./utils/element";

import {
  existsInArray
} from "./utils/array";

import {
  createPlainObject,

  objectAssignPlain
} from "./utils/funcs";

import {
  registerProps,

  removePropsFromCollection
} from "./props";

import {
  registerEvents,

  unregisterEvents
} from "./events";

import {
  registerRef,

  unregisterRef,

  getRefsFromCollection
} from "./refs";


const virtualDOM = createPlainObject();

const elementsCollection = createPlainObject();

const rootElementsCollection = createPlainObject();

window.virtualDOM = virtualDOM;

window.elementsCollection = elementsCollection;

const virtualDiff = createPlainObject();

window.virtualDiff = virtualDiff;

let stringAttrsList = [
      //"branch",

      "id",
      "style",
      "name",
      "htmlFor",
      "type",
      "style",
      "value",
      "placeholder",
      "href",
      "src",
      "width",
      "height",
      "title",
      "rel",
      "alt",
      "media",
      "target",
      "method",
      "action"
    ],
    boolAttrsList = [
      "checked",
      "disabled",
      "selected",
      "readOnly",
      "required"
    ],
    svgAttrsList = [
      "viewBox",
      "preserveAspectRatio",
      "opacity",
      "transform",
      "title",
      "style",
      "d",
      "x",
      "y",
      "cx",
      "cy",
      "r",
      "stroke",
      "stroke-width",
      "fill",
      "fill-rule",
      "width",
      "height",
      "id"
    ],
    svgTags = [
      "svg",
      "g",
      "defs",
      "desc",
      "use",
      "title",
      "symbol",
      "path"
    ];

const createEntryPoint = entry =>
  virtualDOM[entry] = createPlainObject();

const createElementsCollectionEntryPoint = entry =>
  elementsCollection[entry] = createPlainObject();

const createDiffDOMEntryPoint = entry =>
  virtualDiff[entry] = createPlainObject();

const clearVDIFF = entry =>
  delete virtualDiff[entry];

const countUniqueId = ( entry, arrIndex, parentUniqueId ) => (
    entry
    &&
    isUndefined(parentUniqueId)
  )
  ?
  `${entry}-${isUndefined(arrIndex) ? "0": arrIndex}`
  :
  isUndefined(parentUniqueId)
  ?
  isUndefined(arrIndex) ? void 0 : arrIndex
  :
  `${parentUniqueId}-${isUndefined(arrIndex) ? "0" : arrIndex}`;

const combineTree = (branch, entry, arrIndex, parentUniqueId ) => {

  if (isObject(branch)) {
    const uniqueId = countUniqueId(entry, arrIndex, parentUniqueId),
          Branch = objectAssignPlain(branch, { branch: uniqueId});

    isArray(Branch.branches)
    &&
    Branch.branches.map((branch, index) =>
      (
        isObject(branch)
        &&
        combineTree(
          branch,
          entry,
          index,
          uniqueId
        )
      )
    );
  }
  return branch;
};

const countDiffUniqueId = ( entry, arrIndex, parentUniqueId ) =>
  `${parentUniqueId || entry}-${arrIndex || 0}`;

const combineDiffTree = (tree, entry, arrIndex, parentUniqueId ) => {

  if (isString(tree)) return tree;
  
  if (isObject(tree)) {

    const branch = countDiffUniqueId(entry, arrIndex, parentUniqueId),
          upgTree = objectAssignPlain(tree, { branch });


    if (!isUndefined(upgTree.branches)) {
      upgTree.branches = combineDiffTree(
        upgTree.branches,
        entry,
        0,
        branch
      );
    }

    virtualDiff[entry][branch] =  objectAssignPlain({
      branch,
      tagName: upgTree.tagName,
      className: upgTree.className,
      styles: upgTree.styles,
      attributes: upgTree.attributes,
      dataset: upgTree.dataset,
      events: upgTree.events,
      branches: isString(upgTree.branches) ? upgTree.branches : isObject(upgTree.branches) ? createPlainObject() : isArray(upgTree.branches) ? upgTree.branches.length : void 0,
      props: upgTree.props,
      ref: upgTree.ref
    });

    return upgTree;
  }

  if (isArray(tree)) {
    return tree.map((branch, index) =>
      combineDiffTree(
        branch,
        entry,
        index,
        parentUniqueId
      )
    );
  }
};

const getNextSibling = (id, entry) => {
  const path = id.split("-"),
        deep = path.length,
        nextSibling = elementsCollection[entry][[...path.slice(0, deep - 1), "" + (+path.slice(deep - 1, deep) + 1)].join("-")];

  // console.log(`getNextSibling:
  //   path: ${JSON.stringify(path)}
  //   deep: ${deep}
  //   nextSibling:
  // `,nextSibling);

  return nextSibling;
};

const updateRender = (id, tree, entry, root) => {
  const path = id.split("-"),
        deep = path.length,
        oldChild = elementsCollection[entry][id],
        parentUniqueId = path.slice(0, deep - 1).join("-"),
        arrIndex = path.slice(deep - 1, deep),
        parentElement = parentUniqueId === entry ? root : elementsCollection[entry][parentUniqueId];
  // console.log(`updateRender:
  //   id: ${id}
  //   path: ${JSON.stringify(path)}
  //   oldChild: ${oldChild}
  //   parentUniqueId: ${parentUniqueId}
  //   parentElement:
  // `,parentElement);


  let updateTreeFragment;

  const walkTheTree = (tree, id) => {

    if (isObject(tree)) {
      if (tree.branch === id) {
        updateTreeFragment = tree;
        return;
      }
      if (!isUndefined(tree.branches)) {
        walkTheTree(tree.branches, id);
      }
    }

    if (isArray(tree)) {
      for (let i = 0, l = tree.length; i < l; i++ ) {
        walkTheTree(tree[i], id);
        if (updateTreeFragment) break;
      }
    }
  };

  walkTheTree(tree, id);

  updateTreeFragment
  &&
  ((fragment) => {
    if (oldChild) {
      replaceElement(
        oldChild,

        fragment,

        parentElement
      );
    } else {
      const nextSibling = getNextSibling(id, entry);

      if (nextSibling) {

        parentElement.insertBefore(
          fragment,

          nextSibling
        );
      } else {
        parentElement.appendChild(
          fragment
        );
      }
    }
  })(
    createBranch(
      document.createDocumentFragment(),

      updateTreeFragment,

      entry,

      arrIndex,

      parentUniqueId
    )
  );
};

const compareVirtualDOMvsDiffDOM = (entry, tree, root) => {
  const vDOM = virtualDOM[entry],
        vDIFF = virtualDiff[entry],
        edited = createPlainObject(),
        removed = createPlainObject(),
        added = createPlainObject();
  
  Object.keys(vDOM).map(key => {
    isUndefined(vDIFF[key])
    &&
    (
      removed[key] = vDOM[key]
    );

    ((currentDiff) => (
      currentDiff
      &&
      (
        // console.log(`currentDiff:
        //   uniqueId: ${key}
        //   currentDiff: ${JSON.stringify(currentDiff)}
        // `),
        edited[key] = currentDiff
      )

    ))(diff(vDOM[key], vDIFF[key]));
  });

  Object.keys(vDIFF).map(key => {
    isUndefined(vDOM[key])
    &&
    (
      added[key] = vDIFF[key]
    );
  });

  const editedUniqueIds = Object.keys(edited).sort();
  const removedUniqueIds = Object.keys(removed).sort();
  const addedUniqueIds = Object.keys(added).sort();

  const isRemoved = !!removedUniqueIds.length;
  const isAdded = !!addedUniqueIds.length;
  const isEdited = !!editedUniqueIds.length;

  console.log(`compareVirtualDOMvsDiffDOM:
    E: ${isEdited}
    D: ${isRemoved}
    A: ${isAdded}
  `);

  isRemoved
  &&
  (() => {
    
    let rootId = removedUniqueIds[0],
        removedRootUniqueIds = [rootId];

    removedUniqueIds.map((id, index) => {
      if (index > 0) {
        id.indexOf(rootId) !== 0
        &&
        (
          removedRootUniqueIds = [...removedRootUniqueIds, id],
          rootId = id
        );
      }
    });

    // console.log(`isRemoved:
    //   rootId: ${rootId}
    //   removedUniqueIds: ${JSON.stringify(removedUniqueIds)}
    // `);

    removedRootUniqueIds.map(id =>
      removeElement(elementsCollection[entry][id])
    );

    removedUniqueIds.map(id => {
      Object.keys(vDOM).filter(key => 
        key.indexOf(id) === 0
      ).map(id =>
        unregisterEvents(id)
      );
      delete elementsCollection[entry][id];
      delete virtualDOM[entry][id];
    });
  })();

  isAdded
  &&
  (() => {
    let rootId = addedUniqueIds[0],
        addedRootUniqueIds = [rootId];

    addedUniqueIds.map((id, index) => {
      if (index > 0) {

        id.indexOf(rootId) !== 0
        &&
        (
          addedRootUniqueIds = [...addedRootUniqueIds, id],
          rootId = id
        );
      }
    });

    addedRootUniqueIds.map(id => {
      updateRender(id, tree, entry, root);
    });
  })();

  isEdited
  &&
  (() => {
    let rootId = editedUniqueIds[0],
        editedRootUniqueIds = [rootId];

    editedUniqueIds.map((id, index) => {
      
      if (index > 0) {

        id.indexOf(rootId) !== 0
        &&
        (
          editedRootUniqueIds = [...editedRootUniqueIds, id],
          rootId = id
        );
      }
    });

    editedRootUniqueIds.map(id => {
      Object.keys(vDOM).filter(key => 
        key.indexOf(id) === 0
      ).map(id =>
        unregisterEvents(id)
      );
      updateRender(id, tree, entry, root);
    });
  })();

  virtualDOM[entry] = objectAssignPlain(virtualDOM[entry], virtualDiff[entry]);

  clearVDIFF(entry);
};

const applyStyle = (element, styles) => {
  isObject(styles)
  &&
  (
    element.style = styles
  );

  isArray(styles)
  &&
  styles.map(style =>
    applyStyle(element, style)
  );
};

const createBranch = (branch, tree, entry, arrIndex, parentBranchId) => {

  if (isString(tree)) {
    branch.appendChild(document.createTextNode(tree));
  }

  if (isObject(tree)) {
    branch.appendChild((({ tagName, className, styles, attributes, dataset, branches, events, props, ref }) => {

      const element = 
            ~svgTags.indexOf(tagName)
            ?
            document.createElementNS("http://www.w3.org/2000/svg", tagName)
            :
            document.createElement(tagName),

            uniqueId = tree.branch || countUniqueId(entry, arrIndex, parentBranchId);

      /*
       * Prints brunch attribute in html for each element
       */
      element.setAttribute("branch", uniqueId);

      virtualDOM[entry][uniqueId] = {
        branch: uniqueId,
        tagName,
        className,
        styles,
        attributes,
        dataset,
        events,
        branches: isString(branches) ? branches : isObject(branches) ? createPlainObject() : isArray(branches) ? branches.length : void 0,
        props,
        ref
      };

      elementsCollection[entry][uniqueId] = element;

      isObject(attributes)
      &&
      Object.keys(attributes).map(key =>
        (
          (
            !~svgTags.indexOf(tagName)
            &&
            isString(attributes[key])
            &&
            existsInArray(stringAttrsList, key)
          )
          &&
          (element[key] = attributes[key]),

          (
            isBoolean(attributes[key])
            &&
            existsInArray(boolAttrsList, key)
          )
          &&
          (element[key] = attributes[key]),

          isString(attributes["xlink"])
          &&
          element.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", attributes["xlink"]),

          ~svgTags.indexOf(tagName)
          &&
          existsInArray(svgAttrsList, key)
          &&
          element.setAttribute(key, attributes[key])
        )
      );

      (
        tagName === "a"
        &&
        !attributes.rel
      )
      &&
      element.setAttribute("rel", "noreferrer noopener");

      isString(className)
      &&
      (
        (
          tagName === "svg"
          ||
          tagName === "use"
        )
        ?
        element.setAttribute("class", className)
        :
        element.className = className
      );

      isUndefined(styles)
      ||
      applyStyle(element, styles);

      isObject(dataset)
      &&
      Object.keys(dataset).map(key =>
        (
          key
          &&
          element.setAttribute(`data-${key}`, dataset[key])
        )
      );

      isString(ref)
      &&
      registerRef(entry, ref, element);


      isObject(props)
      &&
      registerProps(uniqueId, props);

      isUndefined(events)
      ||
      registerEvents(element, uniqueId, events);
      
      isUndefined(branches)
      ||
      createBranch(
        element,

        branches,

        entry,

        isArray(branches)
        ?
        arrIndex
        :
        "0",

        uniqueId
      );

      return element;

    })(tree));
  }
  
  if (isArray(tree)) {
    tree.map((item, index) =>
      createBranch(
        branch,
        item,
        entry,
        index,
        parentBranchId
      )
    );
  }
  return branch;
};

const renderToPosition = (root, fragment, position, replace) => {

  switch (position) {

  case "first": root.insertBefore(fragment, root.firstChild);
    break;

  case "before": (
    root.parentElement.insertBefore(fragment, root),

    replace
    &&
    removeElement(root)
    );
    break;

  case "after": (
    root.parentElement.insertBefore(fragment, root.nextSibling),

    replace
    &&
    removeElement(root.nextSibling)
    );
    break;

  default: (
    replace
    &&
    clearElement(root),

    root.appendChild(fragment)
    );
    break;
  }
};

const clear = root => {
  if (isUndefined(root)) return;

  let _entry,
      _root; 

  if (isString(root)) {
    _entry = root;
    _root = rootElementsCollection[_entry];
  } else {
    _entry = root.getAttribute("root");
    _root = root;
  }

  _root
  &&
  (
    Object.keys(virtualDOM[_entry]).filter(key =>
      virtualDOM[_entry][key].events
    ).map(key => 
      unregisterEvents(key)
    ),

    Object.keys(virtualDOM[_entry]).filter(key =>
      virtualDOM[_entry][key].props
    ).map(key =>
      removePropsFromCollection(key)
    ),

    delete elementsCollection[_entry],
    delete virtualDOM[_entry],
    unregisterRef(_entry),
    _root.innerHTML = "",
    _root.removeAttribute("root"),
    delete rootElementsCollection[_entry]
  );

};

const render = (
  tree,

  root = document.body,

  {
    entry = "entry",

    replace = true,

    position = "last"
  },

  callback
) => {

  replace
  &&
  root.hasAttribute("root")
  &&
  clear(root);

  rootElementsCollection[entry.toLowerCase()] = root;

  isUndefined(tree)
  &&
  console.error("tree template is undefined");

  root.hasAttribute("root")
  ||
  root.setAttribute("root", entry.toLowerCase());

  replace
  ||
  virtualDOM[entry.toLowerCase()]
  &&
  (
    createDiffDOMEntryPoint(entry.toLowerCase()),

    compareVirtualDOMvsDiffDOM(entry.toLowerCase(), combineDiffTree(tree, entry.toLowerCase()), root)
  );

  virtualDOM[entry.toLowerCase()]
  ||
  (

    createEntryPoint(entry.toLowerCase()),

    createElementsCollectionEntryPoint(entry.toLowerCase()),

    renderToPosition(

      root,

      createBranch(
        document.createDocumentFragment(),

        combineTree(
          tree,

          entry.toLowerCase()
        ),

        entry.toLowerCase()
      ),

      position,

      replace
    )

  );
  
  isFunction(callback)
  &&
  callback({
    root,

    entry: entry.toLowerCase(),

    refs: getRefsFromCollection(entry.toLowerCase()),

    clear: rootEntry => {
      const _entry = rootEntry || entry.toLowerCase(),
            virtualDOMEntry = virtualDOM[_entry];

      Object.keys(virtualDOMEntry).filter(key =>
        virtualDOMEntry[key].events
      ).map(key => 
        unregisterEvents(key)
      );

      Object.keys(virtualDOMEntry).filter(key =>
        virtualDOMEntry[key].props
      ).map(key =>
        removePropsFromCollection(key)
      );

      delete elementsCollection[_entry];

      delete virtualDOM[_entry];

      unregisterRef(_entry);

      root.removeAttribute("root");
    }
  });
};

export {
  render,

  clear
};