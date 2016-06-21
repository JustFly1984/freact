import {
  objectAssignPlain
} from "../utils/funcs";

const tag = tagName =>
  objectAssignPlain({
    tagName
  });

const div = (branches, options) =>
  objectAssignPlain(
    tag("div"), {
      branches
    },
    options
  );

const p = (branches, options) =>
  objectAssignPlain(
    tag("p"), {
      branches
    },
    options
  );

const input = options =>
  objectAssignPlain(tag("input"), options);

const label = (branches, options) =>
  objectAssignPlain(
    tag("label"), {
      branches
    },
    options
  );

const button = (branches, options) =>
  objectAssignPlain(
    tag("button"), {
      branches
    },
    options
  );

const use = xlink =>
  objectAssignPlain(
    tag("use"), {
      attributes: {
        xlink
      }
    }
  );

const useTransform = (xlink, transform) =>
  objectAssignPlain(
    tag("use"), {
      attributes: {
        xlink,
        transform
      }
    }
  );

const svg = (viewBox, branches, options) =>
  objectAssignPlain(
    tag("svg"), {
      branches
    }, {
      attributes: {
        viewBox,
        preserveAspectRatio: "xMinYMin slice"
      }
    },
    options
  );

const symbol = (branches, options) =>
  objectAssignPlain(
    tag("symbol"), {
      branches
    },
    options
  );

const path = options =>
  objectAssignPlain(
    tag("path"),
    options
  );

const span = (branches, options) =>
  objectAssignPlain(
    tag("span"), {
      branches
    },
    options
  );

const a = (branches, options) =>
  objectAssignPlain(
    tag("a"), {
      branches
    },
    options
  );

const desc = (branches, options) =>
  objectAssignPlain(
    tag("desc"), {
      branches
    },
    options
  );

const select = (branches, options) =>
  objectAssignPlain(
    tag("select"), {
      branches
    },
    options
  );

const option = (branches, options) =>
  objectAssignPlain(
    tag("option"), {
      branches
    },
    options
  );

const h1 = (branches, options) =>
  objectAssignPlain(
    tag("h1"), {
      branches
    },
    options
  );

const h2 = (branches, options) =>
  objectAssignPlain(
    tag("h2"), {
      branches
    },
    options
  );

const h3 = (branches, options) =>
  objectAssignPlain(
    tag("h3"), {
      branches
    },
    options
  );

const form = (branches, options) =>
  objectAssignPlain(
    tag("form"), {
      branches
    },
    options
  );

const nav = (branches, options) =>
  objectAssignPlain(
    tag("nav"), {
      branches
    },
    options
  );

const script = (branches, options) =>
  objectAssignPlain(
    tag("script"), {
      branches
    },
    options
  );

const textarea = (branches, options) =>
  objectAssignPlain(
    tag("textarea"), {
      branches
    },
    options
  );

const section = (branches, options) =>
  objectAssignPlain(
    tag("section"), {
      branches
    },
    options
  );

export {
  div,
  p,
  input,
  label,
  button,
  svg,
  symbol,
  path,
  use,
  useTransform,
  span,
  a,
  desc,
  select,
  option,
  h1,
  h2,
  h3,
  form,
  nav,
  script,
  textarea,
  section
};