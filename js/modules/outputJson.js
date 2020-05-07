export { outputJson };

const outputJson = (inpJson, outpPreId, parentNodeId) => {
  if (document.getElementById(outpPreId)) {
    document.getElementById(outpPreId).parentNode.removeChild(document.getElementById(outpPreId));
  }

  let outpPre = document.createElement('pre');
  outpPre.setAttribute('id', outpPreId);
  outpPre.innerHTML = syntaxHighlight(JSON.stringify(inpJson, null, 2));

  if (document.getElementById(parentNodeId)) {
    document.getElementById(parentNodeId).appendChild(outpPre);
  } else {
    document.body.appendChild(outpPre);
  }
};

const syntaxHighlight = (json) => {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    }
  );
};
