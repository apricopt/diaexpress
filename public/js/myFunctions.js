//  a function to get the name attribute to true button even if user click on the nested icon inside the button.
function trueTarget(e) {
  let element;

  if (e.target.tagName !== "BUTTON") {
    element = e.target.parentNode;
  } else {
    element = e.target;
  }

  return element;
}

// this function will handle the change on input fields and will set the value to the new updated value.
function handleChange(e) {
  e.target.defaultValue = e.target.value;
  console.log("defaultvalue ", e.target.defaultValue);
}

// this function is to delete one
function deleteone(e, source) {
  let element = trueTarget(e);
  axios
    .post(`http://localhost:5000${source}`, {
      id: element.name,
    })
    .then((result) => {
      location.reload();
    })
    .catch((err) => {
      console.log(err);
    });
}
