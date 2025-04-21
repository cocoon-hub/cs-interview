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
const labelIds = process.env.LABEL_ID?.split(',');

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

if (!token || !repositoryId || !categoryId || !issueBody || !labelIds) {
  console.error('필수 환경변수가 누락되었습니다.');
  process.exit(1);
}

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
