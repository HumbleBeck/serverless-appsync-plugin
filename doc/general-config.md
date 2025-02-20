# General configuration

## Quick start

```yaml
service: my-app

plugins:
  - serverless-appsync-plugin

provider:
  name: aws

appSync:
  name: my-api

  authentication:
    type: API_KEY

  apiKeys:
    - name: myKey
      expiresAfter: 1M

  dataSources:
    my-table:
      type: AMAZON_DYNAMODB
      description: 'My table'
      config:
        tableName: my-table

  resolvers:
    Query.user:
      dataSource: my-table
```

## Configuration

- `name`: The name of this AppSync API
- `schema`: The filename of the schema file. Defaults to `schema.graphql`. [Read more](#Schema)
- `authentication`: See [Authentication](authentication.md)
- `additionalAuthentications`: See [Authentication](authentication.md)
- `apiKeys`: See [API Keys](API-keys.md)
- `domain`: See [Custom domains](custom-domain.md)
- `dataSources`: See [DataSources](dataSources.md)
- `resolvers`: See [Resolvers](resolvers.md)
- `pipelineFunctions`: See [Pipeline functions](pipeline-functions.md)
- `substitutions`: See [Substitutions](substitutions.md)
- `caching`: See [Cacing](caching.md)
- `waf`: See [Web Application Firefall](WAF.md)
- `logging`: See [Logging](#Logging)
- `xrayEnabled`: Boolean. Enable or disable X-Ray tracing.
- `tags`: A key-value pair for tagging this AppSync API
- `apiId`: See [ApiId](#ApiId)

## Schema

There are different ways to define your schema. By default the schema is found in the `schema.graphql` file. The path of the file is relative to the service directory (where your `serverless.yml` file is).

```yaml
appSync:
  name: my-api
  schema: 'mySchema.graphql'
```

### Multiple files

You can specify more than one file as (an array). This is useful if you want to organize your schema into several files.

```yaml
appSync:
  name: my-api
  schema:
    - 'schemas/user.graphql'
    - 'schemas/posts.graphql'
```

You can also specify glob expressions to avoid specifying each individual file.

```yaml
appSync:
  name: my-api
  schema: 'schemas/*.graphql' # include all graphql files in the `schemas` directory
```

### Schema stitching

All the schema files will be merged together before the schema is sent to AppSync. If types are present (extended) in several files, you will need to use [Object extension](https://spec.graphql.org/October2021/#sec-Object-Extensions)

```graphql
# base.graphql

# You must create the types before you can extend them.
type Query
type Mutation
```

```graphql
# users.graphql

extend type Query {
  getUser(id: ID!): User!
}

extend type Mutation {
  createUser(user: UserInput!): User!
}

type User {
  id: ID!
  name: String!
}
```

```graphql
# posts.graphql

extend type Query {
  getPost(id: ID!): Post!
}

extend type Mutation {
  createPost(post: PostInput!): Post!
}

type Post {
  id: ID!
  title: String
  author: User!
}
```

This will result into the following schema:

```graphql
type Query {
  getUser(id: ID!): User!
  getPost(id: ID!): Post!
}

type Mutation {
  createUser(user: UserInput!): User!
  createPost(post: PostInput!): Post!
}

type User {
  id: ID!
  name: String!
}

type Post {
  id: ID!
  title: String
  author: User!
}
```

### Limitations and compatibility

AppSync is currently using an older version of the [Graphql Specs](https://spec.graphql.org/).
This plugin intends to use modern schemas for future-proofing. Incompatibilities will either be dropped or attempted to be fixed.

**Descriptions**

[Descriptions](https://spec.graphql.org/October2021/#sec-Descriptions) with three double quotes (`"""`) are not supported by AppSync and will be removed.

Old-style descriptions (using `#`) are supported by AppSync but will be removed by the [stitching procedure](#schema-stitching) which does not support them\*. Comments are also not supported on [enums](https://spec.graphql.org/October2021/#sec-Enums) by AppSync.

\* If you want to retain `#` comments, the workaround is to skip schema stitching by putting your whole schema into one single file.

**Multiple interfaces**

Types can implement multiple [interfaces](https://spec.graphql.org/October2021/#sec-Interfaces) using an ampersand `&` in GraphQL, but AppSync uses the old comma (`,`) separator. `&` is the only separator supported by this plugin, but it will automatically be replaced with a `,`.

## Logging

```yaml
appSync:
  name: my-api
  logging:
    level: ERROR
    retentionInDays: 14
```

- `level`: `ERROR`, `NONE`, or `ALL`
- `enabled`: Boolean, Optional. Defaults to `true` when `logging` is present.
- `excludeVerboseContent`: Boolean, Optional. Exclude or not verbose content (headers, response headers, context, and evaluated mapping templates), regardless of field logging level. Defaults to `false`.
- `retentionInDays`: Optional. Number of days to retain the logs. Defaults to [`provider.logRetentionInDays`](https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml#general-function-settings).
- `roleArn`: Optional. The role ARN to use for AppSync to write into CloudWatch. If not specified, a new role is created by default.


## ApiId
If you want to manage your existing AppSync Api through the serverless, you can specify `apiId.`
This is handy if you
- defined your API in the AWS console
- defined your API through the cloudformation in the current or another stack

To point your resources into existing AppSync API, you must provide apiId, which can be a string or imported value from another stack.
```yaml
appSync:
  name: my-api
  apiId: "existing api id"
```

The following configuration options are only associated with the creation of a new AppSync endpoint and will be ignored if you provide the apiId parameter:
- name
- authentication
- additionalAuthentications
- schema
- domain
- apiKeys
- xrayEnabled
- logging
- waf
- Tags
> Note: you should never specify this parameter if you're managing your AppSync through this plugin since it results in removing your API.

### Schema
After specifying this parameter, you need to manually keep your schema up to date or from the main stack where your root AppSync API is defined. The plugin is not taking into account schema property due to AppSync limitation and inability to merge schemas across multiple stacks
