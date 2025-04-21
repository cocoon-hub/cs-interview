import { context, getOctokit } from '@actions/github';
import * as core from '@actions/core';

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const issue = context.payload.issue;
  const labels = issue.labels || [];

  if (labels.length === 0) {
    console.log('라벨이 없습니다. 이슈를 reopen합니다.');

    const octokit = getOctokit(token);
    await octokit.rest.issues.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue.number,
      state: 'open',
    });

    core.setFailed('라벨 없음 - 이슈 재오픈');
  } else {
    console.log('라벨 있음 - 다음 단계로 진행');
  }
}

run();
