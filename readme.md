# serverless-plugin-check-api-doc

This plugin validates that every lambda wit a http event is properly documented


## Install

```sh
npm install -D serverless-plugin-check-api-doc
```

Add the following plugin to your `serverless.yml`:

```yaml
plugins:
  - serverless-plugin-check-api-doc
```

## Configuration

The following options can be set in your `serverless.yml` under `custom.checkApiDoc`

| Option key   | Required     | Description |
|--------------|--------------|----------------|
| `apiDocPath` | Not-required | The path to the Open Api documentation (Defaults to : `openapi.json` )|
| `exclude`    | Not-required | Paths to exclude from the validation |

### Example

```yml
custom:
  checkApiDoc:
    apiDocPath: openapi.json
    exclude: 
      - some/excluded/path

functions:
  someLambda:
    handler: someLambda.handler
    events:
    - http:
        path: some/path/{someParam}
        method: get
        request:
          parameters:
            paths:
              someParam: true

functions:
  someOtherLambda:
    handler: someOtherLambda.handler
    events:
    - http:
        path: some/excluded/path
        method: get


```

## Usage


```sh
  sls check-api
```