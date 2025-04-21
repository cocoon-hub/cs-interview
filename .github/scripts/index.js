import {
  getLastQuestionNumber,
  createDiscussion,
  assignLabelsToDiscussion,
} from './service/discussionService.js';
import { parseQuestions } from './utils/questionParser.js';

const token = process.env.GITHUB_TOKEN;
const repositoryId = process.env.REPOSITORY_ID;
const categoryId = process.env.CATEGORY_ID;
const issueBody = process.env.ISSUE_BODY;
const labelIds = process.env.LABEL_IDS?.split(',');

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateEnv() {
  const requiredVars = {
    GITHUB_TOKEN: token,
    REPOSITORY_ID: repositoryId,
    CATEGORY_ID: categoryId,
    ISSUE_BODY: issueBody,
    LABEL_IDS: labelIds,
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(`다음 환경변수가 누락되었습니다: ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function main() {
  validateEnv();

  const startNumber = await getLastQuestionNumber();
  const questions = parseQuestions(issueBody, startNumber);

  console.log(`총 ${questions.length}개의 질문을 등록합니다.`);

  for (const [index, { title, body }] of questions.entries()) {
    try {
      console.log(`등록중 => title: ${title}, body: ${body}`);
      const result = await createDiscussion(
        repositoryId,
        categoryId,
        title,
        body
      );
      const { id, url } = result.createDiscussion.discussion;
      console.log(`등록 완료: ${url}`);
      await assignLabelsToDiscussion(id, labelIds);
      await delay(1000);
    } catch (error) {
      console.error(`${title} 질문 등록 실패:`, error.message);
    }
  }
}

main().catch((error) => {
  console.error('실행 중 에러 발생:', error.message);
  process.exit(1);
});
