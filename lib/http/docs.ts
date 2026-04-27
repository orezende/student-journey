export function renderApiDocs(spec: object): string {
  const json = JSON.stringify(spec);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Student Journey — API Reference</title>
  <style>body { margin: 0; }</style>
</head>
<body>
  <script id="api-reference" type="application/json">${json}</script>
  <script>
    document.getElementById('api-reference').dataset.configuration = JSON.stringify({
      theme: 'deepSpace',
      layout: 'modern',
      defaultHttpClient: { targetKey: 'javascript', clientKey: 'fetch' },
    });
  </script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`;
}
