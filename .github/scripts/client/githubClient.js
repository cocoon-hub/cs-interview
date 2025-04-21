import { graphql as baseGraphql } from '@octokit/graphql';

export const graphql = baseGraphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});
