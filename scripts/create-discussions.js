import { graphql } from '@octokit/graphql';

const token = process.env.GITHUB_TOKEN;
const repositoryId = process.env.REPOSITORY_ID;
const categoryId = process.env.CATEGORY_ID;
const issueBody = process.env.ISSUE_BODY;
const labelId = process.env.LABEL_ID;

async function getLastQuestionNumber() {
  const result = await graphql(
    `
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
    `,
    {
      headers: {
        authorization: `token ${token}`,
      },
    }
  );
  const discussions = result.repository.discussions.edges;
  const lastQuestionTitle = discussions[1].node.title;
  const match = lastQuestionTitle.match(/^(\d+)\./);
  return match ? parseInt(match[1], 10) : 0;
}

async function createDiscussion(title, body) {
  const mytoken = [token];
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
    {
      repositoryId,
      categoryId,
      body,
      title,
      headers: {
        authorization: `token ${token}`,
      },
    }
  );
}

async function addLabelToDiscussion(discussionId, labelId) {
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
      {
        labelableId: discussionId,
        labelIds: [labelId],
        headers: {
          authorization: `token ${token}`,
        },
      }
    );
    console.log(`label 추가 완료: ${discussionId}`);
  } catch (error) {
    console.error(`label 추가 실패 (${discussionId}):`, error.message);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

if (!token || !repositoryId || !categoryId || !issueBody) {
  console.error('필수 환경변수가 누락되었습니다.');
  process.exit(1);
}

const startNumber = await getLastQuestionNumber();
const questionArr = issueBody
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0);

console.log(`총 ${questionArr.length}개의 질문을 등록합니다.`);

for (const [index, line] of questionArr.entries()) {
  const numberedTitle = `${startNumber + index + 1}. ${line}`;
  const body = line;
  try {
    console.log(`title: ${numberedTitle}, body: ${body}`);
    const result = await createDiscussion(numberedTitle, body);
    console.log(
      `${startNumber + index + 1}번째 discussion 생성됨: ${
        result.createDiscussion.discussion.url
      }`
    );
    await addLabelToDiscussion(discussionId, labelId);
    await delay(1000);
  } catch (error) {
    console.error(`${numberedTitle} 질문 등록 실패:`, error.message);
  }
}
