import fetch from "../util/fetch-fill";
import URI from "urijs";

const PRIMARY_COLORS = ["yellow", "red", "blue"];

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
const generateUrl = (page, colors) => {
  const params = {
    limit: 11 /* Grab 11 items to tell if there can be another page of items */,
    offset: (page - 1) * 10,
    "color[]": colors
  };

  return new URI(window.path).search(params);
};

const isPrimaryColor = color => {
  return PRIMARY_COLORS.includes(color);
};

const checkResponseStatus = response => {
  if (response.status === 200) {
    return response;
  } else {
    let error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
};

const openDispositionItems = items => {
  return items
    .filter(item => item.disposition === "open")
    .map(item => {
      return Object.assign({}, item, { isPrimary: isPrimaryColor(item.color) });
    });
};

const closedPrimaryCount = items => {
  return items.filter(item => {
    return item.disposition === "closed" && isPrimaryColor(item.color);
  }).length;
};

const shapePayload = (data, page) => {
  const hasMoreItems = data.length > 10;
  const items = data.slice(0, 10);

  return {
    ids: items.map(item => item.id),
    open: openDispositionItems(items),
    closedPrimaryCount: closedPrimaryCount(items),
    previousPage: page === 1 ? null : page - 1,
    nextPage: hasMoreItems ? page + 1 : null
  };
};

const retrieve = ({ page = 1, colors = [] } = {}) => {
  const url = generateUrl(page, colors);

  return fetch(url)
    .then(response => {
      checkResponseStatus(response);
      return response.json();
    })
    .then(data => {
      return shapePayload(data, page);
    })
    .catch(err => {
      console.log("we have an error!", err);

      return {
        ids: [],
        open: [],
        closedPrimaryCount: 0,
        previousPage: null,
        nextPage: null
      };
    });
};

export default retrieve;
