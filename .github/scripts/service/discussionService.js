import { graphql } from '../client/githubClient.js';

export async function getLastQuestionNumber() {
  const result = await graphql(`
    {
      repository(owner: "cocoon-hub", name: "cs-interview") {
        discussions(first: 2) {
          edges {
            node {
              title
            }
          }
        }
      }
    }
  `);
  const discussions = result.repository.discussions.edges;
  const lastTitle = discussions[1]?.node.title ?? '';
  const match = lastTitle.match(/^(\d+)\./);
  return match ? parseInt(match[1], 10) : 0;
}

export async function createDiscussion(repositoryId, categoryId, title, body) {
  return await graphql(
    `
      mutation CreateDiscussion(
        $repositoryId: ID!
        $categoryId: ID!
        $title: String!
        $body: String!
      ) {
        createDiscussion(
          input: {
            repositoryId: $repositoryId
            categoryId: $categoryId
            title: $title
            body: $body
          }
        ) {
          discussion {
            id
            url
          }
        }
      }
    `,
    { repositoryId, categoryId, title, body }
  );
}

export async function assignLabelsToDiscussion(discussionId, labelIds) {
  if (!labelIds || labelIds.length === 0) return;
  try {
    await graphql(
      `
        mutation AddLabelsToDiscussion($labelableId: ID!, $labelIds: [ID!]!) {
          addLabelsToLabelable(
            input: { labelableId: $labelableId, labelIds: $labelIds }
          ) {
            clientMutationId
          }
        }
      `,
      { labelableId: discussionId, labelIds }
    );
    console.log(`label 추가 완료: ${discussionId}`);
  } catch (error) {
    console.error(`label 추가 실패 (${discussionId}):`, error.message);
  }
}
